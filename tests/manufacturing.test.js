import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as U from '../src/application/project-tools.js';
import * as E from '../src/files/index.js';
import * as Z from '../src/files/zip/index.js';
import { createValueFormatting } from '../src/ui/value-formatting.js';
import { createRevisionDialogs } from '../src/ui/dialogs/revision.js';
import { translate } from '../src/i18n/index.js';

function fixture() {
  const p = U.createProject({
    name: 'Drive assembly',
    designation: 'DRV.001.000',
    owner: 'Engineer',
  });
  const s = C.working(p),
    root = s.components[0];
  root.quantity = 2;
  root.manufacturing = C.manufacturing({
    technology: 'assembly',
    steps: C.routeTemplate('assembly'),
  });
  s.components.push(
    C.component({
      id: 'part',
      parentId: root.id,
      name: 'Bracket',
      designation: 'DRV.001.001',
      quantity: 4,
      material: 'PETG',
      manufacturer: 'Workshop A',
      manufacturing: C.manufacturing({
        technology: 'printing3d',
        stock: 'PETG filament · 200 g',
        preparation: 'Drawing A and reviewed build file',
        steps: C.routeTemplate('printing3d'),
      }),
    }),
  );
  C.commit(p, {
    author: 'Engineer',
    version: '0.2.0',
    message: 'Define manufacturing routes',
  });
  return p;
}

test('technology presets provide independent editable operation lists with stable ordered steps', () => {
  for (const technology of C.TECHNOLOGIES) {
    const first = C.routeTemplate(technology),
      second = C.routeTemplate(technology);
    C.validateManufacturing(C.manufacturing({ technology, steps: first }));
    assert(first.length >= 2);
    assert.equal(new Set(first.map((s) => s.id)).size, first.length);
    assert(!second.some((s) => first.some((a) => a.id === s.id)));
    assert(
      second.every((s) => s.instructions === ''),
      'Templates must not invent engineering parameters',
    );
  }
  assert.deepEqual(
    C.routeTemplate('milling').map((s) => s.operation),
    ['prepare', 'cutStock', 'milling', 'deburr', 'inspect'],
  );
  assert.throws(() => C.routeTemplate('unknown'), /technology/);
});

test('route validation rejects duplicate steps, unsupported operations, unsafe fields and excessive sizes', () => {
  const route = C.manufacturing({
    technology: 'turning',
    steps: C.routeTemplate('turning'),
  });
  for (const change of [
    (r) => r.steps.push(C.clone(r.steps[0])),
    (r) => {
      r.steps[0].operation = 'unknown';
    },
    (r) => {
      r.steps[0].program = 'unsafe extension';
    },
    (r) => {
      r.stock = 'x'.repeat(2001);
    },
    (r) => {
      r.steps = Array.from({ length: 101 }, () => C.operation());
    },
    (r) => {
      r.technology = 'unknown';
    },
  ]) {
    const invalid = C.clone(route);
    change(invalid);
    assert.throws(() => C.validateManufacturing(invalid), /manufacturing/);
  }
  const p = fixture();
  C.working(p).components[0].manufacturing = null;
  assert.throws(() => C.validateProject(p), /manufacturing route/);
});

test('production order places children before parents, preserves sibling order and keeps nested quantities', () => {
  const p = fixture(),
    s = C.working(p),
    root = s.components[0],
    before = C.clone(s);
  assert.deepEqual(
    C.productionOrder(s).map((c) => c.id),
    ['part', root.id],
  );
  assert.equal(C.flatten(s).find((c) => c.id === 'part').totalQuantity, 8);
  assert.deepEqual(s, before);
  s.components.push(
    C.component({
      id: 'independent',
      name: 'Independent',
      designation: 'IND.001',
      type: 'assembly',
    }),
  );
  assert.deepEqual(
    C.productionOrder(s).map((c) => c.id),
    ['part', root.id, 'independent'],
  );
});

test('facility worklists include operation-specific locations without inventing extra product quantities', () => {
  const p = fixture(),
    s = C.working(p);
  const route = s.components.find((c) => c.id === 'part').manufacturing;
  route.steps[1].facility = 'Printing supplier';
  const groups = C.tasksByFacility(s);
  assert.equal(groups.get('Printing supplier').length, 1);
  assert.equal(groups.get('Printing supplier')[0].step.operation, 'printing3d');
  assert.equal(groups.get('Printing supplier')[0].quantity, 8);
  assert.equal(groups.get('Workshop A').length, 3);
  assert(groups.get('Workshop A').every((task) => task.quantity === 8));
});

test('JSON and ZIP retain route order and preparation, and the manufacturing guide is complete', async () => {
  const p = fixture(),
    route = C.working(p).components.find((c) => c.id === 'part').manufacturing;
  route.steps[1].instructions = 'Друк за перевіреним файлом';
  route.steps[1].equipment = 'Printer A';
  route.steps[1].inputs = 'PETG · required amount';
  route.steps[1].check = 'Inspection instruction A';
  const zip = await E.archive(p);
  assert.deepEqual((await E.read(new File([zip], 'project.zip'))).project, p);
  assert.deepEqual(
    (
      await E.read(
        new File([E.json(p)], 'project.json', { type: 'application/json' }),
      )
    ).project,
    p,
  );
  const entries = await Z.read(zip);
  const guide = Z.decoder.decode(
    entries.find((entry) => entry.name === 'manufacturing/ASSEMBLY.md').data,
  );
  assert(
    guide.indexOf('DRV.001.001 — Bracket') <
      guide.indexOf('DRV.001.000 — Drive assembly'),
  );
  for (const text of [
    'Blank / stock: PETG filament',
    'Preparation: Drawing A',
    'Друк за перевіреним файлом',
    'Equipment: Printer A',
    'Result / check: Inspection instruction A',
    'Total quantity: 8 pcs',
  ])
    assert(guide.includes(text));
  assert(E.csv(C.working(p)).includes('3D printing'));
});

test('catalog revisions freeze routes and checkout preserves old operations until a new revision is published', () => {
  const result = C.publishComponent(fixture(), 'part', {
    label: 'A',
    author: 'Engineer',
    message: 'Share route',
  });
  const pinned = C.clone(result.project);
  C.working(pinned).components.find(
    (c) => c.id === 'part',
  ).manufacturing.stock = 'Changed stock';
  assert.throws(
    () => C.validateProject(pinned),
    /Pinned component definition changed/,
  );
  const editable = C.checkoutComponent(result.project, 'part');
  C.working(editable)
    .components.find((c) => c.id === 'part')
    .manufacturing.steps.reverse();
  C.validateProject(editable);
  assert.equal(
    result.record.snapshot.components[0].manufacturing.steps[0].operation,
    'prepare',
  );
});

test('parallel route edits require an explicit conflict choice while unrelated field changes merge', () => {
  const p = fixture();
  C.createBranch(p, 'route-a');
  C.working(p).components.find((c) => c.id === 'part').manufacturing.stock =
    'Stock A';
  C.commit(p, { version: '0.3.0-a', author: 'A', message: 'Change stock' });
  p.activeBranch = 'main';
  C.working(p).components.find((c) => c.id === 'part').owner = 'B';
  C.commit(p, { version: '0.3.0-b', author: 'B', message: 'Assign owner' });
  const clean = C.prepareMerge(p, 'route-a');
  assert.equal(clean.conflicts.length, 0);
  assert.equal(
    clean.merged.components.find((c) => c.id === 'part').manufacturing.stock,
    'Stock A',
  );
  C.working(p).components.find((c) => c.id === 'part').manufacturing.stock =
    'Stock B';
  C.commit(p, {
    version: '0.4.0-b',
    author: 'B',
    message: 'Alternative stock',
  });
  const plan = C.prepareMerge(p, 'route-a');
  assert.deepEqual(plan.conflicts[0].path, [
    'components',
    'part',
    'manufacturing',
  ]);
  const selected = C.resolveMerge(plan, ['theirs']);
  assert.equal(
    selected.components.find((c) => c.id === 'part').manufacturing.stock,
    'Stock A',
  );
});

test('route comparisons use readable translated values and escape engineering content', () => {
  const p = fixture(),
    before = C.clone(C.working(p));
  C.working(p).components[1].manufacturing.stock =
    '<img src=x onerror=alert(1)>';
  const context = { state: {}, t: (key) => translate('ua', key) };
  Object.assign(
    context,
    createValueFormatting(context),
    createRevisionDialogs(context),
  );
  const html = context.diffHTML(C.diff(before, C.working(p)));
  assert(!html.includes('[object Object]'));
  assert(!html.includes('<img'));
  assert(html.includes('&lt;img'));
  assert(html.includes('3D друк'));
});

test('three and four designation groups both work independently of tree depth', () => {
  for (const designation of ['SYS.001.000', 'SYS.001.000.000']) {
    const p = U.createProject({ name: 'Nested structure', designation }),
      s = C.working(p);
    let parent = s.components[0];
    for (let i = 0; i < 7; i++) {
      const child = C.component({
        name: 'Assembly ' + i,
        type: 'assembly',
        parentId: parent.id,
        designation: U.nextDesignation(s, parent.id),
      });
      s.components.push(child);
      parent = child;
    }
    C.validateProject(p);
    assert.equal(C.flatten(s).at(-1).depth, 7);
    assert.equal(
      parent.designation.split('.').length,
      designation.split('.').length,
    );
  }
});
