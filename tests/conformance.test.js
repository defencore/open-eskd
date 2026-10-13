import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import * as C from 'open-eskd/core';
import * as E from 'open-eskd/files';
import { checkConformance } from '../scripts/lib/conformance.mjs';
import { createProject } from '../src/application/create-project.js';
import { createStructureForms } from '../src/application/forms/structure.js';
import { createExchange } from '../src/application/exchange.js';
import { createExchangeActions } from '../src/application/actions/exchange.js';

const fixture = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`./fixtures/conformance/${name}.json`, import.meta.url),
      'utf8',
    ),
  );
const file = (project) =>
  Object.assign(
    new Blob([JSON.stringify(project)], { type: 'application/json' }),
    { name: 'project.json' },
  );

test('published fixtures distinguish structural conformance from semantic validity', async () => {
  for (const name of ['valid-minimal', 'valid-decomposition'])
    assert.equal(checkConformance(await fixture(name)).valid, true);
  assert.equal(
    checkConformance(await fixture('invalid-version')).errors[0].stage,
    'structure',
  );
  for (const name of ['invalid-parent', 'invalid-path'])
    assert.equal(
      checkConformance(await fixture(name)).errors[0].stage,
      'semantics',
    );
});

test('canonical schema and semantic validation agree for shipped examples', async () => {
  for (const name of ['quick-start', 'staged-assembly'])
    assert.deepEqual(
      checkConformance(
        JSON.parse(
          await readFile(
            new URL(`../examples/${name}.json`, import.meta.url),
            'utf8',
          ),
        ),
      ),
      { valid: true, schemaVersion: 6, errors: [] },
    );
});

test('unsupported imports fail without conversion or source mutation', async () => {
  const p = await fixture('invalid-version'),
    before = C.clone(p);
  await assert.rejects(E.read(file(p)), /Unsupported/);
  assert.deepEqual(p, before);
  const invalidUtf8 = Object.assign(
    new Blob([new Uint8Array([123, 34, 120, 34, 58, 34, 255, 34, 125])], {
      type: 'application/json',
    }),
    { name: 'bad.json' },
  );
  await assert.rejects(E.read(invalidUtf8));
});

test('Unicode limits count code points and reject malformed scalars without lossy normalization', () => {
  assert(C.text('🛠'.repeat(200), 200));
  assert(!C.text('🛠'.repeat(201), 200));
  assert(!C.text('\ud800'));
  assert(C.validId('Компонент-日本'));
  assert(!C.validId('component name'));
  assert(!C.validId('constructor'));
  assert(C.validFilePath('documents/測定結果.pdf'));
  assert(!C.validFilePath('documents/' + '測'.repeat(70) + '.pdf'));
  assert(C.validFilePath(C.pathSegment('🛠'.repeat(200))));
  assert(C.validFilePath(C.pathSegment('\ud800')));
});

test('calendar timestamps are UTC with valid dates and bounded fractional precision', () => {
  assert(C.validDate('2024-02-29T00:00:00Z'));
  assert(C.validDate('2026-10-13T00:00:00.1Z'));
  for (const value of [
    '2025-02-29T00:00:00Z',
    '2026-02-30T00:00:00Z',
    '2026-10-13T24:00:00Z',
    '2026-10-13T00:00:00+03:00',
    '2026-10-13T00:00:00.1234Z',
  ])
    assert(!C.validDate(value), value);
});

test('organizational annotations preserve JSON values and reject dangerous or unbounded payloads', () => {
  C.validateExtensions({
    'org.example.quality': { criteria: ['drawing', 3, null], approved: false },
  });
  for (const payload of [
    NaN,
    Infinity,
    undefined,
    new Date(),
    Array(2),
    { bad: '\ud800' },
    JSON.parse('{"constructor":1}'),
  ])
    assert.throws(() =>
      C.validateExtensions({ 'org.example.quality': payload }),
    );
  assert.throws(() => C.validateExtensions(new Date()));
  assert.throws(() => C.validateExtensions({ quality: {} }));
  assert.throws(() =>
    C.validateExtensions({ 'org.example.quality': 'x'.repeat(65536) }),
  );
  let nested = {};
  for (let i = 0; i < 17; i++) nested = { child: nested };
  assert.throws(() => C.validateExtensions({ 'org.example.quality': nested }));
});

test('whole-project JSON and ZIP preserve namespaced annotations and provenance', async () => {
  const p = await fixture('valid-decomposition'),
    s = C.working(p);
  s.components[0].extensions = {
    'org.example.quality': { inspection: 'sample-1' },
  };
  s.components[0].manufacturing.extensions = {
    'org.example.route': { approval: false },
  };
  for (const artifact of [
    file(p),
    Object.assign(await E.archive(p), { name: 'metadata.zip' }),
  ])
    assert.deepEqual((await E.read(artifact)).project, p);
});

test('decomposition records inherit observed origin and readiness requires evidence', () => {
  const p = createProject({
      name: 'Observed product',
      designation: 'OBS.001',
      workflow: 'decomposition',
    }),
    root = C.working(p).components[0];
  assert.equal(root.provenance.basis, 'observed');
  assert(
    C.readiness(C.working(p)).some((issue) => issue.code === 'provenance'),
  );
  root.provenance.confidence = 'measured';
  assert(
    C.readiness(C.working(p)).some((issue) => issue.code === 'provenance'),
  );
  root.provenance.reference = 'documents/measurement.pdf';
  assert(
    !C.readiness(C.working(p)).some((issue) => issue.code === 'provenance'),
  );
});

test('component edits preserve organizational annotations outside editable controls', async () => {
  const p = await fixture('valid-decomposition'),
    component = C.working(p).components[0];
  component.extensions = { 'org.example.quality': { sampleCount: 3 } };
  const context = {
    state: { projects: [p] },
    project: () => context.state.projects[0],
    snapshot: () => C.working(context.project()),
    readManufacturing: () => component.manufacturing,
    readProvenance: () => component.provenance,
    persist: async () => {},
    closeModal() {},
    navigate() {},
    success() {},
    t: (key) => key,
  };
  await createStructureForms(context).handleForm(
    { dataset: { form: 'component' } },
    null,
    (key) =>
      key === 'id'
        ? component.id
        : key === 'name'
          ? 'Updated housing'
          : String(component[key] ?? ''),
    null,
  );
  assert.deepEqual(
    C.working(context.project()).components[0].extensions,
    component.extensions,
  );
  assert.equal(
    C.working(context.project()).components[0].name,
    'Updated housing',
  );
  C.validateProject(context.project());
});

test('pinned definitions and component packages include provenance and annotations in immutable signatures', async () => {
  const p = await fixture('valid-decomposition');
  C.working(p).components[0].extensions = {
    'org.example.quality': { sampleCount: 1 },
  };
  const { project, record } = C.publishComponent(p, 'housing', {
    label: 'A',
    author: 'Engineer',
    message: 'Measured part',
  });
  const pkg = C.componentPackage(project, record.id);
  assert.equal(checkConformance(pkg).valid, true);
  assert.equal(C.working(pkg).meta.workflow, 'decomposition');
  C.working(project).components[0].extensions[
    'org.example.quality'
  ].sampleCount = 2;
  assert.throws(() => C.validateProject(project), /pinned|immutable|revision/i);
});

test('protected stored identities offer an independent copy without overwriting the raw record', async () => {
  const incoming = await fixture('valid-minimal'),
    raw = { id: incoming.id, schemaVersion: 2 },
    state = {
      projects: [],
      rejected: [{ record: raw, reason: 'unsupported' }],
      view: 'projects',
    };
  let html = '',
    persisted;
  const context = {
    state,
    project: () => null,
    t: (key) => key,
    toast() {},
    showModal: (_title, body) => {
      html = body;
    },
    persist: async (p) => {
      persisted = p;
    },
    selectProject() {},
    success() {},
    closeModal() {},
  };
  await createExchange(context).importFile(file(incoming));
  assert.equal(state.projects.length, 0);
  assert(html.includes('import-copy'));
  assert(!html.includes('import-history'));
  await createExchangeActions(context).handleAction('import-copy', {});
  assert.notEqual(persisted.id, raw.id);
  assert.equal(raw.schemaVersion, 2);
  assert.equal(persisted.fileCheck, null);
});

test('CLI validates, inventories and creates artifacts exclusively without altering engineering files', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'open-eskd-cli-')),
    input = path.join(root, 'project.json'),
    output = path.join(root, 'report.html');
  await writeFile(input, JSON.stringify(await fixture('valid-decomposition')));
  const run = (...args) =>
    execFileSync(
      process.execPath,
      ['scripts/project-cli.mjs', ...args, '--input', input],
      { encoding: 'utf8' },
    );
  assert.equal(JSON.parse(run('validate')).valid, true);
  assert(JSON.parse(run('inventory')).directories.includes('documents'));
  assert(
    run('scripts', '--platform', 'bash', '--kind', 'create').includes(
      'No deletion or replacement',
    ),
  );
  run('report', '--lang', 'ua', '--output', output);
  const html = await readFile(output, 'utf8');
  assert(html.includes('lang="uk"'));
  assert(html.includes('documents/measurement.pdf'));
  const second = spawnSync(
    process.execPath,
    ['scripts/project-cli.mjs', 'report', '--input', input, '--output', output],
    { encoding: 'utf8' },
  );
  assert.equal(second.status, 2);
  assert.equal(await readFile(output, 'utf8'), html);
  const malformed = spawnSync(
    process.execPath,
    [
      'scripts/project-cli.mjs',
      'validate',
      '--input',
      'tests/fixtures/conformance/invalid-version.json',
    ],
    { encoding: 'utf8' },
  );
  assert.equal(malformed.status, 1);
  assert.equal(JSON.parse(malformed.stdout).valid, false);
});

test('import cannot assert release for an incomplete saved configuration', async () => {
  const p = await fixture('valid-decomposition');
  C.head(p).status = 'released';
  assert.equal(checkConformance(p).errors[0].stage, 'semantics');
  assert.throws(() => C.validateProject(p), /released project/);
});

test('change reviews include deleted optional annotations and workflow metadata', async () => {
  const p = await fixture('valid-decomposition'),
    before = C.clone(C.working(p));
  before.components[0].extensions = {
    'org.example.quality': { sampleCount: 1 },
  };
  const after = C.clone(before);
  delete after.meta.workflow;
  delete after.components[0].extensions;
  const changes = C.diff(before, after);
  assert(
    changes
      .find((change) => change.kind === 'meta')
      .fields.includes('workflow'),
  );
  assert(
    changes
      .find((change) => change.kind === 'components')
      .fields.includes('extensions'),
  );
});

test('multiplied quantities cannot underflow to zero in a nested structure', async () => {
  const p = await fixture('valid-minimal'),
    s = C.working(p);
  s.components[0].type = 'assembly';
  s.components[0].quantity = 1e-300;
  s.components.push(
    C.component({
      id: 'small',
      parentId: 'housing',
      name: 'Small material quantity',
      designation: 'FIX.002',
      quantity: 1e-300,
    }),
  );
  assert.throws(() => C.validateProject(p), /Total quantity/);
});

test('decomposition readiness does not silently accept missing origin information', async () => {
  const p = await fixture('valid-decomposition');
  delete C.working(p).components[0].provenance;
  C.validateProject(p);
  assert(
    C.readiness(C.working(p)).some((issue) => issue.code === 'provenance'),
  );
});

test('report selection cannot mix an unrelated batch with another project', async () => {
  const p = await fixture('valid-minimal');
  await assert.rejects(
    E.projectReport(p, 'en', { id: 'unrelated', snapshot: C.working(p) }),
    /batch from this project/,
  );
  await assert.rejects(E.projectReport(p, 'fr'), /English or Ukrainian/);
});
