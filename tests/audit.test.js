import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import { createRevisionDialogs } from '../src/ui/dialogs/revision.js';
import { createCatalogController } from '../src/application/catalog/controller.js';
import { createStructureView } from '../src/ui/views/structure.js';
import { createComponents } from '../src/ui/components.js';
import { createDocumentsActions } from '../src/application/actions/documents.js';
import { createProductionWorkspace } from '../src/ui/production-workspace.js';
import { parseList } from '../src/application/component-list.js';
import { translate } from '../src/i18n/index.js';

function part(id, fields = {}) {
  return C.component({ id, name: id, designation: id, ...fields });
}
function project() {
  const p = C.createProject({ name: 'Audit product', owner: 'Engineer' });
  C.working(p).components = [
    part('housing', {
      manufacturing: C.manufacturing({
        stock: 'A',
        steps: [C.operation({ id: 'print', operation: 'printing3d' })],
      }),
    }),
  ];
  C.commit(p, { version: '0.2.0', author: 'Engineer', message: 'Baseline' });
  return p;
}
function commit(p, version) {
  C.commit(p, { version, author: 'Engineer', message: 'Change' });
}

test('resolving a route conflict produces isolated editable values', () => {
  const p = project();
  C.createBranch(p, 'alternative');
  C.working(p).components[0].manufacturing.stock = 'B';
  commit(p, '0.3.0-alt');
  p.activeBranch = 'main';
  C.working(p).components[0].manufacturing.stock = 'C';
  commit(p, '0.3.0');
  const before = C.clone(p),
    plan = C.prepareMerge(p, 'alternative'),
    resolved = C.resolveMerge(
      plan,
      plan.conflicts.map(() => 'theirs'),
    );
  resolved.components[0].manufacturing.stock = 'Edited after merge';
  assert.deepEqual(p, before);
  assert.equal(plan.conflicts[0].theirs.stock, 'B');
});

test('incoming history accepts maximum-length Unicode branch names with deterministic collision handling', () => {
  const p = project(),
    incoming = C.clone(p),
    name = '工'.repeat(100);
  C.createBranch(incoming, name);
  C.working(incoming).meta.description = 'First change';
  const first = C.importHistory(p, incoming);
  assert.equal([...first.names[0]].length, 100);
  assert.equal(
    first.project.branches[first.names[0]].working.meta.description,
    'First change',
  );
  C.working(incoming).meta.description = 'Another change';
  const second = C.importHistory(first.project, incoming);
  assert(second.names[0].endsWith('-2'));
  assert.equal([...second.names[0]].length, 100);
  C.validateProject(second.project);
});

test('catalog paths remain unambiguous when definition IDs contain slash and colon', () => {
  const p = C.createProject({ name: 'Definitions with separators' }),
    s = C.working(p);
  s.components = [
    part('root', { type: 'assembly' }),
    part('flat', { parentId: 'root', definitionId: 'a:0/b' }),
    part('nested', { parentId: 'root', type: 'assembly', definitionId: 'a' }),
    part('leaf', { parentId: 'nested', definitionId: 'b' }),
  ];
  const published = C.publishComponent(p, 'root', {
      label: 'A',
      author: 'Engineer',
    }),
    copy = C.checkoutComponent(published.project, 'root');
  assert.deepEqual(
    C.working(copy).components.map((c) => c.id),
    ['root', 'flat', 'nested', 'leaf'],
  );
  C.validateProject(copy);
});

test('updating a catalog document path preserves a unique placement reference and requires review', () => {
  let p = C.createProject({ name: 'Document update' }),
    s = C.working(p);
  s.components = [
    part('product', { type: 'assembly' }),
    part('module', { parentId: 'product', type: 'assembly' }),
    part('plate', { parentId: 'module' }),
    part('inspection', {
      parentId: 'product',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'inspect', operation: 'inspect' })],
      }),
    }),
  ];
  s.documents = [
    {
      id: 'drawing',
      name: 'plate-A.pdf',
      path: 'drawings/plate-A.pdf',
      componentId: 'plate',
      kind: 'drawing',
      revision: 'A',
      required: true,
      sha256: null,
    },
  ];
  let published = C.publishComponent(p, 'module', {
    label: 'A',
    author: 'Engineer',
  });
  const reused = C.useRevision(
    published.project,
    published.record.id,
    'product',
  );
  p = reused.project;
  s = C.working(p);
  const ids = C.descendants(s, reused.id),
    document = s.documents.find((d) => ids.has(d.componentId));
  s.components.find(
    (c) => c.id === 'inspection',
  ).manufacturing.steps[0].documents = [C.documentReference(document)];
  p = C.checkoutComponent(p, 'module');
  const newer = C.working(p).documents.find((d) => d.componentId === 'plate');
  newer.path = 'drawings/plate-B.pdf';
  newer.name = 'plate-B.pdf';
  newer.revision = 'B';
  published = C.publishComponent(p, 'module', {
    label: 'B',
    author: 'Engineer',
  });
  const updated = C.updateOccurrence(
      published.project,
      reused.id,
      published.record.id,
    ),
    updatedDocument = C.working(updated).documents.find(
      (d) => d.id === document.id,
    );
  assert.equal(updatedDocument.path, 'drawings/plate-B.pdf');
  assert.equal(
    C.working(updated).components.find((c) => c.id === 'inspection')
      .manufacturing.steps[0].documents[0].path,
    'drawings/plate-A.pdf',
  );
  assert(
    C.manufacturingIssues(C.working(updated)).some(
      (issue) => issue.code === 'operationDocument',
    ),
  );
  C.validateProject(updated);
});

test('a whitespace-only optional catalog message still exports a valid standalone package', () => {
  const published = C.publishComponent(project(), 'housing', {
    label: 'A',
    author: 'Engineer',
    message: '   ',
  });
  assert.doesNotThrow(() =>
    C.validateProject(
      C.componentPackage(published.project, published.record.id),
    ),
  );
});

test('batch issue rejects a plan with an uninspectable input before freezing it', () => {
  const p = project(),
    s = C.working(p);
  s.components[0].type = 'assembly';
  s.components[0].manufacturing.steps[0].operation = 'assembly';
  s.components.push(
    part('purchased', { type: 'purchased', parentId: 'housing' }),
  );
  const before = C.clone(p);
  assert.throws(
    () =>
      C.createBatch(p, {
        name: 'Impossible',
        mode: 'prototype',
        quantity: 1,
        author: 'Planner',
      }),
    { code: 'production-input-route' },
  );
  assert.deepEqual(p, before);
  s.components[1].manufacturing.steps.push(
    C.operation({ operation: 'inspect' }),
  );
  assert.doesNotThrow(() =>
    C.createBatch(p, {
      name: 'Executable',
      mode: 'prototype',
      quantity: 1,
      author: 'Planner',
    }),
  );
});

test('version suggestions preserve large integers and zero padding', () => {
  const p = project(),
    ctx = { project: () => p };
  C.head(p).version = '1.0.9007199254740992';
  assert.equal(
    createRevisionDialogs(ctx).suggestedVersion(),
    '1.0.9007199254740993',
  );
  C.head(p).version = '1.0.009';
  assert.equal(createRevisionDialogs(ctx).suggestedVersion(), '1.0.010');
});

test('catalog revision choices can encode IDs containing colon', async () => {
  let selected;
  const ctx = {
    state: {},
    t: (key) => key,
    updateReview: (...args) => {
      selected = args;
    },
  };
  await createCatalogController(ctx).handleForm(
    { dataset: { form: 'catalog-update' } },
    null,
    (key) =>
      ({
        id: 'module',
        choice: JSON.stringify(['project:one', 'revision:two']),
      })[key],
  );
  assert.deepEqual(selected, ['module', 'project:one', 'revision:two']);
});

test('the inspector offers an actionable copy-path control for external documents', async () => {
  const p = project(),
    s = C.working(p);
  s.documents = [
    {
      id: 'drawing',
      name: 'housing.pdf',
      path: 'drawings/housing.pdf',
      componentId: 'housing',
      kind: 'drawing',
      revision: 'A',
      sha256: null,
      required: true,
    },
  ];
  let copied;
  const ctx = {
    state: { selected: 'housing' },
    t: (key) => translate('en', key),
    snapshot: () => s,
    catalogInspector: () => '',
    provenanceSummary: () => '',
    copyText: async (text) => {
      copied = text;
    },
  };
  Object.assign(ctx, createComponents(ctx));
  const html = createStructureView(ctx).renderInspector();
  assert(!html.includes('download-document'));
  assert(html.includes('copy-file-path'));
  await createDocumentsActions(ctx).handleAction('copy-file-path', {
    dataset: { id: 'drawing' },
  });
  assert.equal(copied, 'drawings/housing.pdf');
});

test('download filenames retain their extension and whole Unicode characters within portable byte limits', () => {
  const name = E.safeName('測定🛠'.repeat(200) + '.zip');
  assert(name.endsWith('.zip'));
  assert(!/[\uD800-\uDFFF]/u.test(name));
  assert(new TextEncoder().encode(name).length <= 200);
  assert.equal(E.safeName('CON.zip'), '_CON.zip');
  assert.equal(E.safeName('a/b:c?.csv'), 'a_b_c_.csv');
});

test('bulk entry accepts the same Unicode scalar length as individual components', () => {
  const result = parseList(
    'UNI.1;' + '🛠'.repeat(200) + ';1',
    C.working(project()),
  );
  assert.equal(result.errors.length, 0);
  assert.equal([...result.rows[0].name].length, 200);
});

test('large production targets are editable as a full accepted quantity', async () => {
  const p = project();
  C.working(p).components[0].quantity = 1000;
  const batch = C.createBatch(p, {
    name: 'Series',
    mode: 'series',
    quantity: 2000,
    author: 'Planner',
  });
  let html = '';
  const ctx = {
    state: { lang: 'en' },
    project: () => p,
    author: () => 'Inspector',
    t: (key) => key,
    showModal: (_title, body) => {
      html = body;
    },
  };
  Object.assign(ctx, createComponents(ctx), {
    guidedField: (...args) => ctx.field(...args),
    guidedTextarea: (...args) => ctx.textarea(...args),
  });
  await createProductionWorkspace(ctx).handleProductionAction('record-result', {
    dataset: { id: batch.id, component: 'housing', operation: 'print' },
  });
  assert(html.includes('value="2000000"'));
  assert(html.includes('max="2000000"'));
});

test('reused component occurrences are distinguishable in structure and exported reports', async () => {
  const p = project(),
    published = C.publishComponent(p, 'housing', {
      label: 'A',
      author: 'Engineer',
    }),
    reused = C.useRevision(published.project, published.record.id),
    snapshot = C.working(reused.project);
  const ctx = {
    state: { selected: null, search: '', filter: '', collapsed: new Set() },
    snapshot: () => snapshot,
    t: (key) => translate('en', key),
  };
  Object.assign(ctx, createComponents(ctx));
  const table = createStructureView(ctx).componentTable(),
    html = await E.projectReport(reused.project);
  for (const output of [table, html]) {
    assert(output.includes('housing [1]'));
    assert(output.includes('housing [2]'));
  }
});
