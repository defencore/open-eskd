import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import { createState } from '../src/application/state.js';
import { createVerificationController } from '../src/application/verification.js';
import { verificationConfiguration } from '../src/application/verification-configuration.js';
import {
  filterVerificationArtifacts,
  filterVerificationRuns,
} from '../src/application/verification-query.js';
import { createComponents } from '../src/ui/components.js';
import { createFormGuidance } from '../src/ui/form-guidance.js';
import { createVerificationDialogs } from '../src/ui/verification/dialogs.js';
import {
  createVerificationEvidenceEditor,
  evidenceKind,
  parseEvidencePaths,
} from '../src/ui/verification/evidence-editor.js';
import { createVerificationView } from '../src/ui/verification/view.js';
import { translate } from '../src/i18n/index.js';

function project() {
  const p = C.createProject({ name: 'Verification UI fixture' });
  C.working(p).components = [
    C.component({
      id: 'controller',
      type: 'set',
      name: 'Commit controller',
      designation: 'SYS.001',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'bench-test', operation: 'test' })],
      }),
    }),
    C.component({
      id: 'supply',
      type: 'purchased',
      name: 'Power supply',
      designation: 'SYS.002',
    }),
  ];
  C.commit(p, {
    author: 'Engineer',
    message: 'Freeze controller configuration.',
    version: '1.0',
  });
  C.working(p).components[0].name = 'Frozen batch controller';
  C.working(p).components[0].revision = 'B';
  const batch = C.createBatch(p, {
    name: 'MVP-UI-01',
    mode: 'prototype',
    quantity: 1,
    author: 'Planner',
  });
  C.working(p).components[0].name = 'Current unsaved controller';
  C.working(p).components[0].manufacturing.steps[0].id = 'changed-current';
  return { p, batch };
}

function artifact(index = 0) {
  return {
    id: 'artifact-' + index,
    title: index === 0 ? '<b>Camera recording</b>' : 'Evidence ' + index,
    kind: index % 2 ? 'log' : 'video',
    path: `tests/run-1/camera-${index}.mp4`,
    sha256: null,
    required: false,
    notes: index === 0 ? 'Synthetic fixture' : '',
  };
}

function runFields(p, overrides = {}) {
  return {
    id: 'run-1',
    name: 'Acceptance attempt',
    testCase: 'acceptance',
    procedurePath: 'tests/procedure.pdf',
    performedAt: '2026-10-18T12:00:00.000Z',
    operator: 'Quality engineer',
    componentId: 'controller',
    commitId: C.head(p).id,
    branch: 'main',
    batchId: null,
    operationId: 'bench-test',
    retestOf: null,
    outcome: 'failed',
    summary: 'Synthetic attempt; original evidence is retained.',
    artifacts: [artifact()],
    ...overrides,
  };
}

function context(p, language = 'en') {
  const events = [];
  const state = createState();
  Object.assign(state, {
    projects: [p],
    projectId: p.id,
    lang: language,
  });
  const ctx = {
    state,
    project: () => state.projects.find((item) => item.id === state.projectId),
    t: (key) => translate(language, key),
    author: () => 'Test engineer',
    fmtDate: (date) => date,
    titleRow: () => '<h1>Verification</h1>',
    showModal: (title, html, form) => events.push({ title, html, form }),
    render: () => events.push({ render: true }),
    persist: async (candidate) => {
      events.push({ persist: candidate });
      return { persisted: true };
    },
    closeModal: () => events.push({ close: true }),
    navigate: (view) => events.push({ navigate: view }),
    success: (message) => events.push({ success: message }),
    copyText: async (text) => events.push({ copied: text }),
  };
  Object.assign(
    ctx,
    createComponents(ctx),
    createFormGuidance(ctx),
    createVerificationEvidenceEditor(ctx),
    createVerificationDialogs(ctx),
    createVerificationView(ctx),
  );
  return { ctx, events, controller: createVerificationController(ctx) };
}

function bulkForm(paths, rows = [], kind = 'auto', required = 'true') {
  const controls = {
    evidencePaths: { value: paths },
    bulkEvidenceKind: { value: kind },
    bulkEvidenceRequired: { value: required },
  };
  const insertions = [];
  return {
    form: {
      elements: { namedItem: (name) => controls[name] },
      querySelectorAll: () =>
        rows.map((item) => ({
          dataset: { id: item.id },
          querySelector: (selector) => ({
            value: String(item[selector.match(/="(.+)"/u)[1]] ?? ''),
          }),
        })),
      querySelector: () => ({
        insertAdjacentHTML: (position, html) => insertions.push(html),
      }),
    },
    controls,
    insertions,
  };
}

function submit(controller, values) {
  return controller.handleForm(
    { dataset: { form: 'verification-run' } },
    null,
    (key) => values[key] ?? '',
  );
}

function formValues(p, overrides = {}) {
  return {
    configuration: 'commit:' + C.head(p).id,
    name: 'New attempt',
    testCase: 'acceptance',
    performedAt: '2026-10-18T15:45',
    operator: 'Quality engineer',
    componentId: 'controller',
    operationId: 'bench-test',
    retestOf: '',
    outcome: 'passed',
    summary: 'The recorded checks met the stated criteria.',
    procedurePath: 'tests\\procedure.pdf',
    ...overrides,
  };
}

test('bulk evidence paths infer metadata without reading files and accept portable Windows relative paths', () => {
  const results = parseEvidencePaths(
    ' tests\\run-1\\camera.MP4\r\n tests/run-1/controller.jsonl\n\n tests/run-1/protocol.pdf\n tests/run-1/image.PNG\n tests/run-1/telemetry.csv\n tests/run-1/archive.zip ',
    'auto',
    false,
  );
  assert.deepEqual(
    results.map((item) => item.kind),
    ['video', 'log', 'protocol', 'image', 'dataset', 'other'],
  );
  assert.equal(results[0].path, 'tests/run-1/camera.MP4');
  assert.equal(results[0].title, 'camera.MP4');
  assert(
    results.every((item) => item.required === false && item.sha256 === null),
  );
  assert.equal(new Set(results.map((item) => item.id)).size, results.length);
  assert(results.every((item) => !Object.hasOwn(item, 'content')));
  assert.equal(evidenceKind('tests/recording.WEBM'), 'video');
  assert.equal(parseEvidencePaths('logs/plain.csv', 'log')[0].kind, 'log');
});

test('bulk evidence rejects unsafe, duplicate and excessive paths before adding any editor rows', () => {
  const { p } = project();
  const { ctx } = context(p);
  for (const text of [
    '../outside.mp4',
    '/absolute.mp4',
    'C:\\tests\\recording.mp4',
    'tests/a.mp4\ntests/a.mp4',
    'tests/a.mp4\ntests/A.mp4',
    'tests/café.log\ntests/cafe\u0301.log',
    Array.from({ length: 1001 }, (_, index) => `tests/${index}.log`).join('\n'),
  ]) {
    const { form, controls, insertions } = bulkForm(text);
    assert.throws(() => ctx.addVerificationPaths(form));
    assert.equal(controls.evidencePaths.value, text);
    assert.deepEqual(insertions, []);
  }
  const existing = { ...artifact(), path: 'tests/Existing.MP4' };
  const { form, insertions } = bulkForm('tests/existing.mp4', [existing]);
  assert.throws(() => ctx.addVerificationPaths(form));
  assert.deepEqual(insertions, []);
});

test('evidence editor combines rows and pending paths, preserving explicit hash, kind and requirement metadata', () => {
  const { p } = project();
  const { ctx } = context(p);
  const existing = {
    ...artifact(),
    title: ' Camera one ',
    path: 'tests\\camera.mp4',
    sha256: 'a'.repeat(64),
    required: true,
    notes: ' Controlled recording ',
  };
  const { form } = bulkForm(
    'tests/camera-two.mp4',
    [existing],
    'video',
    'false',
  );
  const evidence = ctx.readVerificationEvidence(form);
  assert.equal(evidence.length, 2);
  assert.equal(evidence[0].id, existing.id);
  assert.equal(evidence[0].path, 'tests/camera.mp4');
  assert.equal(evidence[0].sha256, 'a'.repeat(64));
  assert.equal(evidence[0].required, true);
  assert.equal(evidence[0].notes, 'Controlled recording');
  assert.equal(evidence[1].required, false);
  const pending = bulkForm('tests/new.mp4');
  ctx.addVerificationPaths(pending.form);
  assert.equal(pending.controls.evidencePaths.value, '');
  assert.equal(pending.insertions.length, 1);
  assert(pending.insertions[0].includes('data-evidence-row'));
});

test('verification filters search evidence and pinned configuration labels with independent outcome, component and batch filters', () => {
  const { p, batch } = project();
  C.recordVerificationRun(p, runFields(p));
  C.recordVerificationRun(
    p,
    runFields(p, {
      id: 'batch-run',
      batchId: batch.id,
      outcome: 'passed',
      name: 'Batch acceptance',
      artifacts: [{ ...artifact(), path: 'tests/batch/camera.mp4' }],
    }),
  );
  C.recordVerificationRun(
    p,
    runFields(p, {
      id: 'supply-run',
      componentId: 'supply',
      operationId: null,
      outcome: 'blocked',
      name: 'Supply incoming inspection',
      artifacts: [],
    }),
  );
  assert.deepEqual(
    filterVerificationRuns(p, { query: '  RUN-1/CAMERA-0.MP4  ' }).map(
      (run) => run.id,
    ),
    ['run-1'],
  );
  assert.deepEqual(
    filterVerificationRuns(p, { query: 'Frozen batch controller' }).map(
      (run) => run.id,
    ),
    ['batch-run'],
  );
  assert.deepEqual(
    filterVerificationRuns(p, { query: 'Current unsaved controller' }),
    [],
  );
  assert.deepEqual(
    filterVerificationRuns(p, {
      outcome: 'passed',
      componentId: 'controller',
      batchId: batch.id,
    }).map((run) => run.id),
    ['batch-run'],
  );
  assert.deepEqual(
    filterVerificationRuns(p, { outcome: 'failed', batchId: batch.id }),
    [],
  );
  assert.deepEqual(
    filterVerificationRuns(p, { componentId: 'supply' }).map((run) => run.id),
    ['supply-run'],
  );
  assert.deepEqual(
    filterVerificationArtifacts(C.verificationRuns(p)[0], {
      query: 'synthetic',
      kind: 'video',
    }).map((item) => item.id),
    ['artifact-0'],
  );
  assert.deepEqual(
    filterVerificationArtifacts(C.verificationRuns(p)[0], {
      query: 'synthetic',
      kind: 'log',
    }),
    [],
  );
  assert.equal(
    verificationConfiguration(p, 'batch:' + batch.id).snapshot.components[0]
      .name,
    'Frozen batch controller',
  );
  assert.equal(
    verificationConfiguration(p, 'commit:' + C.head(p).id).snapshot
      .components[0].name,
    'Commit controller',
  );
});

test('saved configuration selection attributes alternative and detached commits accurately while preserving batch branches', () => {
  const { p, batch } = project();
  const sharedCommit = C.head(p).id;
  C.createBranch(p, 'alternative');
  C.working(p).components[0].name = 'Alternative controller';
  const alternativeCommit = C.commit(p, {
    author: 'Engineer',
    message: 'Evaluate an independent controller configuration.',
    version: 'alternative-1.0',
  });
  p.activeBranch = 'main';
  assert.equal(
    verificationConfiguration(p, 'commit:' + alternativeCommit.id).branch,
    'alternative',
  );
  assert.equal(
    verificationConfiguration(p, 'commit:' + sharedCommit).branch,
    'main',
  );
  p.activeBranch = 'alternative';
  assert.equal(
    verificationConfiguration(p, 'commit:' + sharedCommit).branch,
    'alternative',
  );
  assert.equal(
    verificationConfiguration(p, 'batch:' + batch.id).branch,
    'main',
  );
  p.activeBranch = 'main';
  delete p.branches.alternative;
  assert.equal(
    verificationConfiguration(p, 'commit:' + alternativeCommit.id).branch,
    'detached',
  );
  C.validateProject(p);
});

test('journals and evidence tables paginate large ledgers and render frozen scopes safely in both languages', async () => {
  for (const language of ['en', 'ua']) {
    const { p, batch } = project();
    C.recordVerificationRun(
      p,
      runFields(p, {
        artifacts: Array.from({ length: 125 }, (_, index) => artifact(index)),
      }),
    );
    C.recordVerificationRun(
      p,
      runFields(p, {
        id: 'batch-run',
        batchId: batch.id,
        outcome: 'passed',
        artifacts: [],
      }),
    );
    const runs = C.verificationRuns(p);
    for (let index = 2; index < 60; index++)
      runs.push(
        runFields(p, {
          id: 'extra-' + index,
          performedAt: new Date(Date.UTC(2026, 9, 18, 13, index)).toISOString(),
          artifacts: [
            { ...artifact(), path: `tests/extra-${index}.log`, kind: 'log' },
          ],
        }),
      );
    C.validateProject(p);
    const before = C.clone(p);
    const { ctx, controller } = context(p, language);
    let html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="open-verification-run"/gu) || []).length,
      50,
    );
    assert(html.includes('data-action="verification-more"'));
    assert(!html.includes('Current unsaved controller'));
    await controller.handleAction('verification-more');
    html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="open-verification-run"/gu) || []).length,
      60,
    );
    assert(html.includes('Frozen batch controller'));
    assert(!html.includes('data-action="verification-more"'));
    await controller.handleAction('open-verification-run', {
      dataset: { id: 'run-1' },
    });
    html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="verification-copy-path"/gu) || []).length,
      100,
    );
    assert(html.includes('data-action="verification-artifacts-more"'));
    assert(html.includes('&lt;b&gt;Camera recording&lt;/b&gt;'));
    assert(!html.includes('<b>Camera recording</b>'));
    assert(html.includes('Commit controller'));
    await controller.handleAction('verification-artifacts-more');
    html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="verification-copy-path"/gu) || []).length,
      125,
    );
    assert(!html.includes('data-action="verification-artifacts-more"'));
    ctx.handleVerificationFilter({
      dataset: { verificationFilter: 'verificationArtifactKind' },
      value: 'video',
    });
    html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="verification-copy-path"/gu) || []).length,
      63,
    );
    assert.equal(ctx.state.verificationArtifactLimit, 100);
    ctx.state.verificationArtifactSearch = 'camera-124.mp4';
    html = ctx.renderVerification();
    assert.equal(
      (html.match(/data-action="verification-copy-path"/gu) || []).length,
      1,
    );
    assert.deepEqual(p, before);
  }
});

test('a retest initially preserves the original saved configuration and operation association', () => {
  const { p } = project();
  const run = C.recordVerificationRun(p, runFields(p));
  const originalCommit = run.commitId;
  C.commit(p, {
    author: 'Engineer',
    message: 'Changed operation and component.',
    version: '2.0',
  });
  const { ctx, events } = context(p);
  ctx.verificationRunModal(run);
  const { html, form } = events.at(-1);
  assert.equal(form, 'verification-run');
  assert(html.includes(`value="commit:${originalCommit}" selected`));
  assert(html.includes('value="bench-test" selected'));
  assert(html.includes('name="retestOf" value="run-1"'));
});

test('search edits reset pagination and restore the focused field and caret after rendering', () => {
  const { p } = project();
  const { ctx, events } = context(p);
  const previousDocument = globalThis.document;
  const focus = [];
  globalThis.document = {
    querySelector: (selector) => ({
      focus: () => focus.push(selector),
      setSelectionRange: (start, end) => focus.push([start, end]),
    }),
  };
  try {
    for (const kind of ['runs', 'artifacts']) {
      ctx.state.verificationLimit = 500;
      ctx.state.verificationArtifactLimit = 500;
      assert.equal(
        ctx.updateVerificationSearch({
          matches: () => true,
          dataset: { verificationSearch: kind },
          selectionStart: 6,
          value: 'camera-124',
        }),
        true,
      );
      const prefix = kind === 'runs' ? 'verification' : 'verificationArtifact';
      assert.equal(ctx.state[prefix + 'Search'], 'camera-124');
      assert.equal(ctx.state[prefix + 'Limit'], kind === 'runs' ? 50 : 100);
      assert.equal(events.at(-1).render, true);
      assert.deepEqual(focus.slice(-2), [
        `[data-verification-search="${kind}"]`,
        [6, 6],
      ]);
    }
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('invalid verification submissions preserve the original project, selected attempt and open dialog', async () => {
  const { p } = project();
  const before = C.clone(p);
  const { ctx, events, controller } = context(p);
  ctx.state.verificationRunId = 'kept-selection';
  ctx.readVerificationEvidence = () => [artifact()];
  for (const overrides of [
    { operationId: 'changed-current' },
    { procedurePath: '../outside.pdf' },
    { configuration: 'commit:missing' },
    { outcome: 'success' },
    { performedAt: 'invalid' },
  ])
    await assert.rejects(submit(controller, formValues(p, overrides)));
  ctx.readVerificationEvidence = () => [
    { ...artifact(), path: '../unsafe.mp4' },
  ];
  await assert.rejects(submit(controller, formValues(p)));
  assert.equal(ctx.project(), p);
  assert.deepEqual(p, before);
  assert.equal(ctx.state.verificationRunId, 'kept-selection');
  assert.deepEqual(events, []);
});

test('successful verification submission persists an isolated append and retains frozen batch context', async () => {
  const { p, batch } = project();
  C.recordVerificationRun(p, runFields(p));
  const before = C.clone(p);
  const { ctx, events, controller } = context(p);
  const evidence = [artifact(1)];
  ctx.readVerificationEvidence = () => evidence;
  assert.equal(
    await submit(
      controller,
      formValues(p, { configuration: 'batch:' + batch.id, retestOf: 'run-1' }),
    ),
    true,
  );
  const candidate = ctx.project();
  assert.notEqual(candidate, p);
  assert.deepEqual(p, before);
  const runs = C.verificationRuns(candidate);
  assert.equal(runs.length, 2);
  assert.deepEqual(runs[0], C.verificationRuns(before)[0]);
  assert.equal(runs[1].batchId, batch.id);
  assert.equal(runs[1].commitId, batch.commitId);
  assert.equal(runs[1].branch, batch.branch);
  assert.equal(runs[1].procedurePath, 'tests/procedure.pdf');
  assert.equal(runs[1].retestOf, 'run-1');
  assert.equal(ctx.state.verificationRunId, runs[1].id);
  assert.equal(events.find((event) => event.persist).persist, candidate);
  assert.deepEqual(events.slice(-3), [
    { close: true },
    { navigate: 'verification' },
    { success: translate('en', 'updated') },
  ]);
  evidence[0].path = 'edited-after-submit.mp4';
  assert.equal(runs[1].artifacts[0].path, 'tests/run-1/camera-1.mp4');
  C.validateProject(candidate);
  assert.equal(await controller.handleAction('unrelated'), false);
  assert.equal(
    await controller.handleForm({ dataset: { form: 'unrelated' } }),
    false,
  );
});
