import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
const component = (id, parentId = null, extra = {}) =>
  C.component({
    id,
    parentId,
    name: id,
    designation: `DEMO.${id}`,
    type: 'part',
    quantity: 1,
    unit: 'pcs',
    revision: 'A',
    status: 'draft',
    owner: 'Engineer',
    material: '',
    manufacturer: 'Workshop',
    process: '',
    notes: '',
    ...extra,
  });
function fixture() {
  const p = C.createProject({ name: 'Engineering test', owner: 'Engineer' });
  C.working(p).components = [
    component('assembly', null, { type: 'assembly', quantity: 2 }),
    component('part', 'assembly', { quantity: 3 }),
  ];
  C.commit(p, {
    author: 'Engineer',
    message: 'Initial structure',
    version: '0.2.0',
  });
  return p;
}
function save(p, version) {
  return C.commit(p, {
    author: 'Engineer',
    message: 'Engineering change',
    version,
  });
}

test('project creation produces a valid initial immutable baseline', () => {
  const p = C.createProject({ name: 'Example' });
  assert.equal(C.validateProject(p), p);
  assert.equal(C.dirty(p), false);
  C.working(p).meta.description = 'New work';
  assert.equal(C.head(p).snapshot.meta.description, '');
  assert.equal(C.dirty(p), true);
});
test('semantic equality ignores object property order', () => {
  assert.equal(C.equal({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 }), true);
  assert.equal(C.equal([1, 2], [2, 1]), false);
});
test('nested BOM quantities multiply parent quantities', () => {
  const p = fixture();
  assert.equal(
    C.flatten(C.working(p)).find((c) => c.id === 'part').totalQuantity,
    6,
  );
});
test('cycles in product structure are rejected', () => {
  const p = fixture(),
    s = C.working(p);
  s.components[0].parentId = 'part';
  s.components[1].type = 'assembly';
  assert.throws(() => C.validateSnapshot(s), /cycle/);
});
test('dangling parents and documents are rejected', () => {
  const p = fixture();
  C.working(p).components[1].parentId = 'missing';
  assert.throws(() => C.validateProject(p), /Missing parent/);
});
test('leaf parts cannot contain child components', () => {
  const p = fixture();
  C.working(p).components[0].type = 'part';
  assert.throws(() => C.validateSnapshot(C.working(p)), /Only assemblies/);
});
test('duplicate designations, invalid quantities and unsafe fields are rejected', () => {
  const p = fixture(),
    s = C.working(p);
  s.components[1].designation = s.components[0].designation.toLowerCase();
  assert.throws(() => C.validateSnapshot(s), /Duplicate designation/);
  s.components[1].designation = 'UNIQUE';
  s.components[1].quantity = 0;
  assert.throws(() => C.validateSnapshot(s), /Quantity/);
  s.components[1].quantity = 1;
  s.components[1].constructor = 'unsafe';
  assert.throws(() => C.validateSnapshot(s), /unsafe/);
});
test('branching preserves dirty work in the original branch', () => {
  const p = fixture();
  C.working(p).components[1].material = 'Aluminium';
  C.createBranch(p, 'mechanical');
  assert.equal(C.working(p).components[1].material, '');
  assert.equal(p.branches.main.working.components[1].material, 'Aluminium');
});
test('branches can be created from an older baseline', () => {
  const p = fixture(),
    oldest = Object.values(p.commits).find((c) => c.parents.length === 0);
  C.createBranch(p, 'restore/initial', oldest.id);
  assert.equal(C.working(p).components.length, 0);
});
test('unsafe and duplicate branch names are rejected', () => {
  const p = fixture();
  assert.throws(() => C.createBranch(p, '__proto__'), /letters/);
  assert.throws(() => C.createBranch(p, 'main'), /already exists/);
});
test('three-way merge combines independent fields on the same component', () => {
  const p = fixture();
  C.createBranch(p, 'mechanical');
  C.working(p).components[1].material = 'Aluminium';
  save(p, '0.3.0-mech');
  p.activeBranch = 'main';
  C.working(p).components[1].manufacturer = 'Second workshop';
  save(p, '0.3.0-main');
  const plan = C.prepareMerge(p, 'mechanical');
  assert.equal(plan.conflicts.length, 0);
  const merged = C.resolveMerge(plan, []);
  assert.equal(merged.components[1].material, 'Aluminium');
  assert.equal(merged.components[1].manufacturer, 'Second workshop');
  p.branches.main.working = merged;
  const merge = C.commit(p, {
    author: 'Engineer',
    message: 'Merged',
    version: '0.4.0',
    parents: plan.parents,
  });
  assert.equal(merge.parents.length, 2);
  C.validateProject(p);
});
test('parallel edits to the same field require an explicit choice', () => {
  const p = fixture();
  C.createBranch(p, 'alternative');
  C.working(p).components[1].material = 'Steel';
  save(p, '0.3.0-steel');
  p.activeBranch = 'main';
  C.working(p).components[1].material = 'Aluminium';
  save(p, '0.3.0-al');
  const plan = C.prepareMerge(p, 'alternative');
  assert.equal(plan.conflicts.length, 1);
  assert.deepEqual(plan.conflicts[0].path, ['components', 'part', 'material']);
  assert.throws(() => C.resolveMerge(plan, []), /every conflict/);
  assert.equal(
    C.resolveMerge(plan, ['theirs']).components[1].material,
    'Steel',
  );
  assert.equal(
    C.resolveMerge(plan, ['ours']).components[1].material,
    'Aluminium',
  );
});
test('delete versus edit conflicts preserve the selected whole component', () => {
  const p = fixture();
  C.createBranch(p, 'remove-part');
  C.working(p).components.pop();
  save(p, '0.3.0-delete');
  p.activeBranch = 'main';
  C.working(p).components[1].notes = 'Keep this part';
  save(p, '0.3.0-keep');
  const plan = C.prepareMerge(p, 'remove-part');
  assert.equal(plan.conflicts.length, 1);
  assert.equal(C.resolveMerge(plan, ['theirs']).components.length, 1);
  assert.equal(C.resolveMerge(plan, ['ours']).components.length, 2);
});
test('structural conflicts introduced by independent edits are detected on validation', () => {
  const p = fixture();
  C.createBranch(p, 'remove-assembly');
  C.working(p).components[1].parentId = null;
  C.working(p).components.shift();
  save(p, '0.3.0-remove');
  p.activeBranch = 'main';
  C.working(p).components.push(component('new-part', 'assembly'));
  save(p, '0.3.0-add');
  const plan = C.prepareMerge(p, 'remove-assembly');
  assert.equal(plan.conflicts.length, 0);
  const selected = C.resolveMerge(plan, []);
  assert.throws(() => C.validateSnapshot(selected), /Missing parent/);
});
test('dirty target and source branches cannot merge', () => {
  const p = fixture();
  C.createBranch(p, 'other');
  C.working(p).meta.description = 'Dirty';
  p.activeBranch = 'main';
  assert.throws(() => C.prepareMerge(p, 'other'), /source branch/);
  C.working(p).meta.owner = 'Other engineer';
  assert.throws(() => C.prepareMerge(p, 'other'), /current branch/);
});
test('history import preserves local work and imports remote branches without overwriting', () => {
  const local = fixture(),
    incoming = C.clone(local);
  C.working(incoming).components[1].material = 'Steel';
  save(incoming, '0.3.0-remote');
  C.working(local).components[1].notes = 'Local dirty work';
  const result = C.importHistory(local, incoming);
  assert.deepEqual(result.names, ['incoming/main']);
  assert.equal(
    result.project.branches.main.working.components[1].notes,
    'Local dirty work',
  );
  assert.equal(
    result.project.branches['incoming/main'].working.components[1].material,
    'Steel',
  );
  assert.equal(
    C.commonAncestor(
      result.project,
      result.project.branches.main.head,
      result.project.branches['incoming/main'].head,
    ),
    local.branches.main.head,
  );
  assert.equal(C.importHistory(result.project, incoming).names.length, 0);
});
test('imports reject mismatched identities and rewritten commit IDs', () => {
  const p = fixture(),
    incoming = C.clone(p);
  incoming.id = 'different';
  assert.throws(() => C.importHistory(p, incoming), /same project/);
  incoming.id = p.id;
  incoming.commits[incoming.branches.main.head].message = 'Tampered';
  assert.throws(() => C.importHistory(p, incoming), /different content/);
});
test('cyclic commit history and unsupported schema versions are rejected', () => {
  const p = fixture(),
    ids = Object.keys(p.commits);
  p.commits[ids[0]].parents = [ids[1]];
  assert.throws(() => C.validateProject(p), /cycle/);
  p.schemaVersion = 99;
  assert.throws(() => C.validateProject(p), /Unsupported/);
});
test('saved history retains controlled file paths after working deletion', () => {
  const p = fixture();
  C.working(p).documents.push({
    id: 'doc',
    name: 'drawing.pdf',
    path: 'drawings/drawing.pdf',
    componentId: 'part',
    kind: 'drawing',
    revision: 'A',
    sha256: null,
    required: true,
  });
  const record = save(p, '0.3.0');
  C.working(p).documents = [];
  assert.equal(record.snapshot.documents[0].path, 'drawings/drawing.pdf');
  assert(!Object.hasOwn(p, 'blobs'));
  C.validateProject(p);
});
test('embedded content is rejected by the canonical format', () => {
  const p = fixture();
  p.blobs = {};
  assert.throws(() => C.validateProject(p), /unsafe schema/);
});
test('readiness identifies missing drawings, ownership, locations and status', () => {
  const p = fixture(),
    s = C.working(p);
  s.components[1].owner = '';
  s.components[1].manufacturer = '';
  const codes = C.readiness(s)
    .filter((i) => i.componentId === 'part')
    .map((i) => i.code);
  assert.deepEqual(codes, ['status', 'owner', 'manufacturer', 'document']);
});
test('descendant removal includes every nested component', () => {
  const p = fixture();
  assert.deepEqual(
    [...C.descendants(C.working(p), 'assembly')],
    ['assembly', 'part'],
  );
});
