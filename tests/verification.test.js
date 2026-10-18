import { test } from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv/dist/2020.js';
import * as C from '../src/domain/index.js';
import { projectSchema } from '../src/domain/schema.js';

function project() {
  const p = C.createProject({ name: 'Verification workspace' });
  C.working(p).components.push(
    C.component({
      id: 'controller',
      name: 'Controller',
      designation: 'SYS.1',
      type: 'set',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'test', operation: 'test' })],
      }),
    }),
  );
  C.commit(p, {
    author: 'Engineer',
    message: 'Freeze controller configuration.',
    version: '1.0',
  });
  return p;
}

function fields(p, overrides = {}) {
  return {
    id: 'run-1',
    name: 'Controller acceptance run',
    testCase: 'controller-acceptance',
    procedurePath: 'tests/procedures/controller.pdf',
    performedAt: '2026-10-18T12:00:00.000Z',
    operator: 'Test engineer',
    componentId: 'controller',
    commitId: C.head(p).id,
    branch: 'main',
    batchId: null,
    operationId: 'test',
    retestOf: null,
    outcome: 'passed',
    summary: 'Synthetic metadata only.',
    artifacts: [
      {
        id: 'video-1',
        title: 'Camera one recording',
        kind: 'video',
        path: 'tests/run-1/camera-1.mp4',
        sha256: null,
        required: false,
        notes: 'External recording; no binary embedded.',
      },
      {
        id: 'log-1',
        title: 'Controller log',
        kind: 'log',
        path: 'tests/run-1/controller.csv',
        sha256: null,
        required: false,
        notes: '',
      },
    ],
    ...overrides,
  };
}

test('verification profiles are optional, typed and support many independent artifacts per run', () => {
  const p = project();
  C.validateProject(p);
  assert.deepEqual(C.verificationRuns(p), []);
  const input = fields(p);
  const result = C.recordVerificationRun(p, input);
  input.artifacts[0].path = 'changed.mp4';
  result.artifacts[0].path = 'also-changed.mp4';
  assert.equal(C.verificationRuns(p)[0].artifacts.length, 2);
  assert.equal(
    C.verificationRuns(p)[0].artifacts[0].path,
    'tests/run-1/camera-1.mp4',
  );
  assert.equal(C.validateProject(p), p);
  const valid = new Ajv({ strict: false }).compile(projectSchema);
  assert(valid(p), JSON.stringify(valid.errors));
  const wrong = C.clone(p);
  wrong.extensions[C.VERIFICATION_NAMESPACE].runs[0].artifacts[0].kind =
    'attachment';
  assert.equal(valid(wrong), false);
  assert.throws(() => C.validateProject(wrong), /artifact/);
});

test('invalid run inputs never mutate the ledger or unrelated extension metadata', () => {
  const p = project();
  p.extensions = { 'com.example.metadata': { retained: true } };
  const before = C.clone(p);
  for (const overrides of [
    { outcome: 'success' },
    { performedAt: '2026-02-30T12:00:00Z' },
    { componentId: 'missing' },
    { operationId: 'missing' },
    { componentId: null, operationId: 'test' },
    { commitId: 'missing' },
    { procedurePath: '../outside.pdf' },
    { batchId: undefined },
    { summary: 'x'.repeat(10001) },
    { operator: '' },
    { branch: '__proto__' },
  ]) {
    assert.throws(() => C.recordVerificationRun(p, fields(p, overrides)));
    assert.deepEqual(p, before);
  }
  C.recordVerificationRun(p, fields(p));
  assert.deepEqual(p.extensions['com.example.metadata'], { retained: true });
  const recorded = C.clone(p);
  assert.throws(() => C.recordVerificationRun(p, fields(p)), /Duplicate/);
  assert.deepEqual(p, recorded);
  const unsupported = C.clone(p);
  unsupported.extensions[C.VERIFICATION_NAMESPACE].version = 2;
  const unsupportedBefore = C.clone(unsupported);
  assert.throws(() =>
    C.recordVerificationRun(unsupported, fields(unsupported, { id: 'new' })),
  );
  assert.deepEqual(unsupported, unsupportedBefore);
});

test('verification resolves an immutable commit or exact frozen work order configuration', () => {
  const p = project();
  const frozen = C.head(p).id;
  C.working(p).components[0].revision = 'B';
  const batch = C.createBatch(p, {
    name: 'MVP-1',
    mode: 'prototype',
    quantity: 1,
    author: 'Planner',
  });
  const run = C.recordVerificationRun(p, fields(p));
  assert.equal(C.verificationSnapshot(p, run).components[0].revision, 'A');
  const batchRun = C.recordVerificationRun(
    p,
    fields(p, { id: 'batch-run', batchId: batch.id }),
  );
  assert.equal(C.verificationSnapshot(p, batchRun).components[0].revision, 'B');
  C.working(p).components.length = 0;
  assert.equal(C.verificationSnapshot(p, batchRun).components[0].revision, 'B');
  assert.equal(C.verificationSnapshot(p, run), p.commits[frozen].snapshot);
  assert.throws(
    () =>
      C.recordVerificationRun(
        p,
        fields(p, { id: 'bad-batch', batchId: batch.id, branch: 'other' }),
      ),
    /frozen work order/,
  );
  assert.throws(
    () =>
      C.recordVerificationRun(
        p,
        fields(p, {
          id: 'bad-commit',
          batchId: batch.id,
          commitId: Object.keys(p.commits)[0],
        }),
      ),
    /frozen work order/,
  );
});

test('artifact identity, canonical paths, hashes and file-directory conflicts are validated', () => {
  const p = project();
  const first = fields(p);
  for (const artifacts of [
    [first.artifacts[0], { ...first.artifacts[1], id: 'video-1' }],
    [
      first.artifacts[0],
      { ...first.artifacts[1], path: first.artifacts[0].path },
    ],
    [{ ...first.artifacts[0], path: '../video.mp4' }],
    [{ ...first.artifacts[0], path: 'project.json' }],
    [{ ...first.artifacts[0], path: 'reports' }],
    [{ ...first.artifacts[0], sha256: 'invalid' }],
    [{ ...first.artifacts[0], notes: 'x'.repeat(2001) }],
    [{ ...first.artifacts[0], required: 'false' }],
  ])
    assert.throws(() => C.recordVerificationRun(p, fields(p, { artifacts })));
  first.artifacts[0].sha256 = 'a'.repeat(64);
  C.recordVerificationRun(p, first);
  const second = fields(p, { id: 'run-2' });
  C.recordVerificationRun(p, second);
  const incompatible = fields(p, { id: 'run-3' });
  incompatible.artifacts[0].sha256 = 'b'.repeat(64);
  assert.throws(() => C.recordVerificationRun(p, incompatible), /conflict/i);
  C.working(p).documents.push({
    id: 'protocol',
    name: 'Conflicting document',
    path: first.artifacts[0].path,
    componentId: null,
    kind: 'other',
    revision: 'A',
    sha256: 'b'.repeat(64),
    required: false,
  });
  assert.throws(() => C.validateVerification(p), /conflict/i);
});

test('retests preserve failed evidence and require matching cases and components without cycles', () => {
  const p = project();
  C.recordVerificationRun(p, fields(p, { outcome: 'failed' }));
  C.recordVerificationRun(
    p,
    fields(p, { id: 'run-2', retestOf: 'run-1', outcome: 'passed' }),
  );
  assert.deepEqual(
    C.verificationRuns(p).map((run) => run.outcome),
    ['failed', 'passed'],
  );
  for (const overrides of [
    { retestOf: 'missing' },
    { retestOf: 'run-1', testCase: 'other-case' },
    { retestOf: 'run-1', componentId: null, operationId: null },
    { retestOf: 'run-3' },
  ])
    assert.throws(() =>
      C.recordVerificationRun(p, fields(p, { id: 'run-3', ...overrides })),
    );
  const cyclic = C.clone(p);
  C.verificationRuns(cyclic)[0].retestOf = 'run-2';
  assert.throws(() => C.validateVerification(cyclic), /cycle/);
});

test('history exchange appends immutable verification identities and rejects content collisions atomically', () => {
  const local = project();
  local.extensions = { 'com.example.metadata': { retained: true } };
  C.recordVerificationRun(local, fields(local));
  const incoming = C.clone(local);
  C.recordVerificationRun(incoming, fields(incoming, { id: 'remote-run' }));
  C.recordVerificationRun(local, fields(local, { id: 'local-run' }));
  const merged = C.importHistory(local, incoming).project;
  assert.equal(C.verificationRuns(merged).length, 3);
  assert.deepEqual(merged.extensions['com.example.metadata'], {
    retained: true,
  });
  assert.equal(C.verificationRuns(local).length, 2);
  C.verificationRuns(incoming)[0].summary = 'Edited identity';
  const before = C.clone(local);
  assert.throws(() => C.importHistory(local, incoming), /identity collision/);
  assert.deepEqual(local, before);
  assert.throws(
    () => C.mergeVerification(local, incoming),
    /identity collision/,
  );
  assert.deepEqual(local, before);
});

test('verification profile budgets allow realistic ledgers without weakening unknown extension limits', () => {
  const p = project();
  const run = fields(p);
  run.artifacts = Array.from({ length: 1000 }, (_, index) => ({
    ...run.artifacts[0],
    id: 'artifact-' + index,
    path: 'tests/many/camera-' + index + '.mp4',
    notes: 'x'.repeat(100),
  }));
  C.recordVerificationRun(p, run);
  assert(JSON.stringify(p.extensions).length > 65536);
  C.validateProject(p);
  assert.throws(
    () =>
      C.recordVerificationRun(
        p,
        fields(p, {
          id: 'too-many',
          artifacts: [...run.artifacts, run.artifacts[0]],
        }),
      ),
    /Invalid verification run/,
  );
  const unknown = C.clone(p);
  unknown.extensions['com.example.large'] = {
    a: 'a'.repeat(40000),
    b: 'b'.repeat(40000),
  };
  assert.throws(() => C.validateProject(unknown), /64 KiB/);
  const nested = C.clone(p);
  C.working(nested).components[0].extensions = {
    [C.VERIFICATION_NAMESPACE]: { version: 1, runs: [] },
  };
  assert.throws(() => C.validateProject(nested), /only valid on a project/);
  const namespaces = project();
  namespaces.extensions = Object.fromEntries(
    Array.from({ length: 16 }, (_, index) => ['com.example.ns' + index, {}]),
  );
  const before = C.clone(namespaces);
  assert.throws(() => C.recordVerificationRun(namespaces, fields(namespaces)));
  assert.deepEqual(namespaces, before);
});

test('run and aggregate artifact limits are enforced independently of reused file paths', () => {
  const p = project();
  p.extensions = {
    [C.VERIFICATION_NAMESPACE]: {
      version: 1,
      runs: Array.from({ length: 1001 }, (_, index) =>
        fields(p, { id: 'run-' + index, artifacts: [] }),
      ),
    },
  };
  assert.throws(() => C.validateVerification(p), /profile limit/);
  const artifacts = Array.from({ length: 1000 }, (_, index) => ({
    ...fields(p).artifacts[0],
    id: 'artifact-' + index,
    path: 'tests/shared/recording-' + index + '.mp4',
  }));
  p.extensions[C.VERIFICATION_NAMESPACE].runs = Array.from(
    { length: 11 },
    (_, index) => fields(p, { id: 'run-' + index, artifacts }),
  );
  assert.throws(() => C.validateVerification(p), /artifact limit/);
});
