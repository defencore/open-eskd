import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import * as Z from '../src/files/zip/index.js';

const execute = promisify(execFile);

function fixture() {
  const project = C.createProject({ name: 'Evidence collection' });
  C.working(project).components.push(
    C.component({
      id: 'module',
      name: 'Original module',
      designation: 'SYS.101',
      revision: 'A',
      manufacturer: 'Supplier',
      manufacturing: C.manufacturing({
        steps: [
          C.operation({
            id: 'bench',
            operation: 'test',
            facility: 'Bench lab',
          }),
          C.operation({
            id: 'field',
            operation: 'test',
            facility: 'Field lab',
          }),
        ],
      }),
    }),
  );
  C.commit(project, {
    author: 'Engineer',
    message: 'Baseline',
    version: '1.0.0',
  });
  return project;
}

function artifact(path, fields = {}) {
  return {
    id: C.uid(),
    title: path.split('/').at(-1),
    kind: 'video',
    path,
    sha256: null,
    required: false,
    notes: '',
    ...fields,
  };
}

function session(project, fields = {}) {
  return C.recordVerificationRun(project, {
    id: C.uid(),
    name: 'Bench session',
    testCase: 'TC-BENCH',
    procedurePath: 'verification/procedures/bench-A.pdf',
    performedAt: '2026-10-18T09:00:00Z',
    operator: 'Verifier',
    componentId: 'module',
    commitId: C.head(project).id,
    branch: project.activeBranch,
    batchId: null,
    operationId: 'bench',
    retestOf: null,
    outcome: 'passed',
    summary: 'Observed and recorded.',
    artifacts: [],
    ...fields,
  });
}

async function run(script, root) {
  const folder = await mkdtemp(join(tmpdir(), 'eskd-evidence-script-')),
    filename = join(folder, 'check.sh');
  await writeFile(filename, script);
  try {
    return { ...(await execute('/bin/bash', [filename, root])), code: 0 };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, code: error.code };
  }
}

test('inventory retains every session procedure and artifact across historical configurations', () => {
  const project = fixture(),
    path = 'verification/session-01/shared.log',
    expectedHash = 'a'.repeat(64);
  C.working(project).documents.push({
    id: 'shared-document',
    name: 'Shared log',
    path,
    componentId: 'module',
    kind: 'other',
    revision: 'A',
    sha256: null,
    required: false,
  });
  const first = session(project, {
    id: 'first',
    outcome: 'failed',
    artifacts: [
      artifact(path, { kind: 'log', sha256: expectedHash, required: true }),
    ],
  });
  C.working(project).components[0].revision = 'B';
  C.commit(project, {
    author: 'Engineer',
    message: 'Revision B',
    version: '1.1.0',
  });
  session(project, {
    id: 'second',
    retestOf: first.id,
    procedurePath: 'verification/procedures/bench-B.pdf',
    artifacts: [
      artifact(path, { kind: 'log' }),
      ...Array.from({ length: 30 }, (_, index) =>
        artifact(`verification/session-02/camera-${index + 1}.mp4`),
      ),
    ],
  });
  const inventory = E.projectFileInventory(project),
    shared = inventory.files.find((file) => file.path === path);
  assert.equal(inventory.files.length, 33);
  assert.equal(shared.sha256, expectedHash);
  assert.equal(shared.required, true);
  assert.deepEqual(shared.documents, ['shared-document']);
  assert(inventory.files.some((file) => file.path.endsWith('bench-A.pdf')));
  assert(inventory.files.some((file) => file.path.endsWith('bench-B.pdf')));
  assert(inventory.directories.includes('verification/session-02'));
  assert.throws(
    () =>
      session(project, {
        artifacts: [artifact(path, { sha256: 'b'.repeat(64) })],
      }),
    /conflict/,
  );
  assert.throws(
    () =>
      session(project, {
        artifacts: [artifact('Verification/session-01/shared.log')],
      }),
    /case-insensitive/,
  );
});

test('generated scripts create and check many evidence paths without reading them into the browser', async () => {
  const project = fixture(),
    video = "verification/Session α/camera's $(touch HACKED).mp4",
    log = 'verification/Session α/acquisition.log';
  session(project, {
    artifacts: [
      artifact(video, { required: true }),
      artifact(log, {
        kind: 'log',
        required: true,
        sha256: await Z.hash(Z.encoder.encode('Expected log')),
      }),
      artifact('verification/Session α/camera-02.mp4'),
    ],
  });
  const scripts = await E.filesystemScripts(project, 'bash', true),
    root = await mkdtemp(join(tmpdir(), 'eskd-evidence-root-'));
  assert.equal((await run(scripts.create, root)).code, 0);
  await writeFile(join(root, video), 'External recording bytes');
  await writeFile(join(root, log), 'Expected log');
  const before = await readdir(join(root, 'verification/Session α')),
    result = await run(scripts.check, root),
    report = JSON.parse(result.stdout);
  assert.equal(result.code, 1);
  assert.equal(
    report.files.find((file) => file.path === video).status,
    'present',
  );
  assert.equal(
    report.files.find((file) => file.path === log).status,
    'verified',
  );
  assert.equal(
    report.files.find((file) => file.path.endsWith('camera-02.mp4')).status,
    'placeholder',
  );
  assert(report.files.some((file) => file.path.endsWith('bench-A.pdf')));
  await E.acceptFileCheck(project, report);
  assert.deepEqual(await readdir(join(root, 'verification/Session α')), before);
  assert(!(await readdir(root)).includes('HACKED'));
  assert.equal(
    await readFile(join(root, video), 'utf8'),
    'External recording bytes',
  );
  await writeFile(
    join(root, 'verification/procedures/bench-A.pdf'),
    'Procedure',
  );
  assert.equal((await run(scripts.check, root)).code, 0);
  const powershell = await E.filesystemScripts(project, 'powershell');
  assert(powershell.check.includes("camera''s $(touch HACKED).mp4"));
  assert(powershell.check.includes('verification/procedures/bench-A.pdf'));
});

test('new sessions and changed evidence metadata invalidate a complete file check', async () => {
  const project = fixture();
  session(project, { artifacts: [artifact('verification/RUN-1/video.mp4')] });
  const report = {
    schema: 'open-eskd-file-check-1',
    projectId: project.id,
    fingerprint: await E.configurationFingerprint(project),
    checkedAt: C.now(),
    files: E.projectFileInventory(project).files.map((file) => ({
      path: file.path,
      status: 'present',
    })),
  };
  await E.acceptFileCheck(project, report);
  const incomplete = C.clone(report);
  incomplete.files.pop();
  await assert.rejects(
    E.acceptFileCheck(project, incomplete),
    /does not cover/,
  );
  const original = C.clone(project);
  for (const mutate of [
    (run) => (run.summary = 'Reviewed observations'),
    (run) => (run.artifacts[0].path = 'verification/RUN-1/renamed.mp4'),
    (run) => (run.artifacts[0].sha256 = 'b'.repeat(64)),
    (run) => (run.artifacts[0].required = true),
  ]) {
    const changed = C.clone(original);
    mutate(C.verificationRuns(changed)[0]);
    await assert.rejects(
      E.acceptFileCheck(changed, report),
      /different configuration/,
    );
  }
  session(project, { artifacts: [artifact('verification/RUN-2/video.mp4')] });
  await assert.rejects(
    E.acceptFileCheck(project, report),
    /different configuration/,
  );
});

test('file-check import retains the validated report when its caller changes the input during hashing', async () => {
  const project = fixture();
  session(project, {
    artifacts: [artifact('verification/RUN-1/video.mp4')],
  });
  const report = {
      schema: 'open-eskd-file-check-1',
      projectId: project.id,
      fingerprint: await E.configurationFingerprint(project),
      checkedAt: C.now(),
      files: E.projectFileInventory(project).files.map((file) => ({
        path: file.path,
        status: 'present',
      })),
    },
    expected = C.clone(report),
    pending = E.acceptFileCheck(project, report);
  report.files.length = 0;
  report.fingerprint = '0'.repeat(64);
  await pending;
  assert.deepEqual(project.fileCheck, expected);
});

test('JSON and metadata toolkits preserve all evidence references and never package external media', async () => {
  const project = fixture();
  session(project, {
    artifacts: [
      artifact('verification/RUN-1/camera-01.mp4'),
      artifact('verification/RUN-1/camera-02.mp4'),
      artifact('verification/RUN-1/protocol.pdf', { kind: 'protocol' }),
      artifact('verification/RUN-1/acquisition.log', { kind: 'log' }),
    ],
  });
  assert.deepEqual(
    (await E.read(new File([E.json(project)], 'project.json'))).project,
    project,
  );
  const zip = await E.archive(project),
    entries = await Z.read(zip);
  assert.deepEqual(
    (await E.read(new File([zip], 'toolkit.zip'))).project,
    project,
  );
  assert(!entries.some((entry) => /\.(mp4|log|pdf)$/.test(entry.name)));
  assert(
    Z.decoder
      .decode(entries.find((entry) => entry.name === 'check-files.sh').data)
      .includes('camera-02.mp4'),
  );
});

test('reports retain pinned revisions, all evidence links and exact batch and facility scope', async () => {
  const project = fixture(),
    firstBatch = C.createBatch(project, {
      name: 'MVP-01',
      mode: 'prototype',
      quantity: 1,
      author: 'Planner',
    }),
    secondBatch = C.createBatch(project, {
      name: 'MVP-02',
      mode: 'prototype',
      quantity: 1,
      author: 'Planner',
    });
  session(project, {
    id: 'historical',
    name: 'Historical unbatched session',
    artifacts: [artifact('verification/HISTORY/video.mp4')],
  });
  session(project, {
    id: 'bench-1',
    name: '<script>Bench batch session</script>',
    batchId: firstBatch.id,
    artifacts: [
      artifact('verification/MVP-01/clip #1.mp4', { sha256: 'c'.repeat(64) }),
      artifact('verification/MVP-01/clip #2.mp4'),
      artifact('verification/MVP-01/results.log', { kind: 'log' }),
      artifact('verification/MVP-01/protocol.pdf', { kind: 'protocol' }),
    ],
  });
  session(project, {
    name: 'Field batch session',
    batchId: firstBatch.id,
    operationId: 'field',
    artifacts: [artifact('verification/FIELD/private.mp4')],
  });
  session(project, {
    name: 'Other batch session',
    batchId: secondBatch.id,
    artifacts: [artifact('verification/MVP-02/private.mp4')],
  });
  session(project, {
    name: 'Whole configuration session',
    componentId: null,
    operationId: null,
    batchId: firstBatch.id,
    artifacts: [artifact('verification/WHOLE/private.mp4')],
  });
  C.working(project).components[0].name = 'Later module';
  C.working(project).components[0].revision = 'B';
  C.working(project).components[0].manufacturing.steps[0].facility =
    'Later lab';
  const full = await E.projectReport(project),
    batch = await E.projectReport(project, 'en', firstBatch),
    scoped = await E.projectReport(project, 'en', firstBatch, 'Bench lab');
  assert(full.includes('Historical unbatched session'));
  assert(batch.includes('verification/MVP-01/clip%20%231.mp4'));
  assert(batch.includes('verification/MVP-01/clip%20%232.mp4'));
  assert(batch.includes('c'.repeat(64)));
  assert(batch.includes('Original module'));
  assert(!batch.includes('Later module'));
  assert(!batch.includes('verification/HISTORY/video.mp4'));
  assert(!batch.includes('verification/MVP-02/private.mp4'));
  assert(scoped.includes('verification/MVP-01/clip%20%231.mp4'));
  assert(!scoped.includes('verification/FIELD/private.mp4'));
  assert(!scoped.includes('verification/WHOLE/private.mp4'));
  assert(!scoped.includes('<script>'));
  assert(scoped.includes('&lt;script&gt;Bench batch session&lt;/script&gt;'));
  assert(scoped.includes('id="verification"'));
});

test('in-flight report and toolkit exports freeze the complete verification profile before hashing', async () => {
  const project = fixture();
  session(project, {
    artifacts: [artifact('verification/ORIGINAL/video.mp4')],
  });
  const original = C.clone(project),
    reportPending = E.projectReport(project),
    toolkitPending = E.archive(project);
  C.verificationRuns(project)[0].artifacts[0].path =
    'verification/LATER/video.mp4';
  session(project, { artifacts: [artifact('verification/NEW/video.mp4')] });
  const report = await reportPending,
    entries = new Map(
      (await Z.read(await toolkitPending)).map((entry) => [
        entry.name,
        Z.decoder.decode(entry.data),
      ]),
    );
  assert(report.includes('verification/ORIGINAL/video.mp4'));
  assert(!report.includes('verification/LATER/video.mp4'));
  assert(!report.includes('verification/NEW/video.mp4'));
  assert.deepEqual(JSON.parse(entries.get('project.json')), original);
  assert(
    entries.get('report.html').includes('verification/ORIGINAL/video.mp4'),
  );
  assert(
    entries.get('check-files.sh').includes('verification/ORIGINAL/video.mp4'),
  );
  assert(
    !entries.get('check-files.sh').includes('verification/LATER/video.mp4'),
  );
});
