import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as U from '../src/application/project-tools.js';
import * as E from '../src/files/index.js';

async function fixture() {
  let p = U.createProject({
    name: 'Control system',
    designation: 'SYS.000',
    owner: 'Engineer',
  });
  const root = C.working(p).components[0];
  C.working(p).components.push(
    C.component({
      id: 'module',
      parentId: root.id,
      name: 'Sensor module',
      designation: 'MOD.100',
      type: 'assembly',
      owner: 'Engineer',
    }),
    C.component({
      id: 'plate',
      parentId: 'module',
      name: 'Mounting plate',
      designation: 'MOD.101',
      quantity: 2,
      owner: 'Engineer',
    }),
  );
  p = await E.registerDocuments(p, ['module.svg'], 'module');
  C.commit(p, {
    author: 'Engineer',
    message: 'Initial structure',
    version: '0.2.0',
  });
  return p;
}
function publish(p, id = 'module', label = 'A') {
  return C.publishComponent(p, id, {
    label,
    author: 'Engineer',
    message: 'Component revision',
  });
}

test('publishing creates an immutable independent revision and does not rewrite project history', async () => {
  const p = await fixture(),
    before = C.clone(p);
  const result = publish(p);
  assert.deepEqual(p, before);
  assert.equal(result.record.snapshot.components.length, 2);
  assert.equal(result.record.snapshot.components[0].quantity, 1);
  assert.equal(result.record.itemId, 'module');
  assert.equal(
    C.working(result.project).components.find((c) => c.id === 'module').source
      .revisionId,
    result.record.id,
  );
  assert.deepEqual(C.head(result.project), C.head(before));
  C.validateProject(result.project);
});
test('a published assembly can be reused twice with shared identities and multiplied quantities', async () => {
  let { project: p, record } = publish(await fixture());
  const root = C.working(p).components.find((c) => c.parentId === null);
  root.quantity = 3;
  const result = C.useRevision(p, record.id, root.id, 4);
  p = result.project;
  const reused = C.flatten(C.working(p)).filter(
    (c) => c.definitionId === 'plate',
  );
  assert.equal(reused.length, 2);
  assert.deepEqual(
    reused.map((c) => c.totalQuantity),
    [6, 24],
  );
  assert.equal(C.working(p).documents.length, 2);
  assert.equal(Object.hasOwn(p, 'blobs'), false);
  C.validateProject(p);
});
test('pinned metadata, children and documentation cannot be silently edited', async () => {
  const { project: p } = publish(await fixture());
  for (const change of [
    (s) => (s.components.find((c) => c.id === 'plate').material = 'Steel'),
    (s) => (s.components = s.components.filter((c) => c.id !== 'plate')),
    (s) => (s.documents = []),
  ]) {
    const candidate = C.clone(p);
    change(C.working(candidate));
    assert.throws(() => C.validateProject(candidate), /Pinned/);
  }
  await assert.rejects(
    Promise.resolve().then(() =>
      E.registerDocuments(p, ['extra.txt'], 'plate'),
    ),
    { code: 'pinned-component' },
  );
});
test('checkout and new revision preserve old placements until explicitly updated', async () => {
  let { project: p, record: a } = publish(await fixture());
  const reused = C.useRevision(p, a.id, C.working(p).components[0].id, 2);
  p = reused.project;
  p = C.checkoutComponent(p, 'module');
  C.working(p).components.find(
    (c) => c.definitionId === 'plate' && !c.source,
  ).material = 'Aluminium';
  const newer = publish(p, 'module', 'B');
  p = newer.project;
  assert.equal(
    C.working(p).components.find((c) => c.id === reused.id).revision,
    'A',
  );
  const old = C.clone(p.catalog[a.id]);
  const updated = C.updateOccurrence(p, reused.id, newer.record.id);
  assert.equal(
    C.working(updated).components.find((c) => c.id === reused.id).revision,
    'B',
  );
  assert.equal(
    C.working(updated).components.find((c) => c.id === reused.id).quantity,
    2,
  );
  assert.deepEqual(updated.catalog[a.id], old);
  C.validateProject(updated);
});
test('a parent assembly pins the exact revision of its dependency', async () => {
  let { project: p, record: a } = publish(await fixture());
  const root = C.working(p).components.find((c) => c.parentId === null);
  const parent = publish(p, root.id, 'SYSTEM-A');
  p = parent.project;
  assert.equal(
    parent.record.snapshot.components.find((c) => c.id === 'module').source
      .revisionId,
    a.id,
  );
  assert.throws(() => C.updateOccurrence(p, 'module', a.id), {
    code: 'pinned-root',
  });
  p = C.checkoutComponent(p, root.id);
  assert.equal(
    C.working(p).components.find((c) => c.id === 'module').source.revisionId,
    a.id,
  );
  C.validateProject(p);
});
test('component ZIP includes only the selected revision, dependencies and document references', async () => {
  let { project: p, record } = publish(await fixture());
  p = E.registerDocuments(p, ['project-note.txt']);
  const packageProject = C.componentPackage(p, record.id);
  assert.equal(packageProject.kind, 'component');
  assert.equal(C.working(packageProject).components.length, 2);
  assert.equal(Object.keys(packageProject.commits).length, 1);
  assert.equal(Object.hasOwn(packageProject, 'blobs'), false);
  assert(
    !JSON.stringify(packageProject).includes('Confidential project notes'),
  );
  const imported = (
    await E.read(new File([await E.archive(packageProject)], 'module.zip'))
  ).project;
  assert.deepEqual(imported, packageProject);
  const local = U.createProject({
    name: 'Another product',
    designation: 'OTHER.000',
  });
  C.mergeCatalog(local, imported);
  const linked = C.useRevision(
    local,
    record.id,
    C.working(local).components[0].id,
    5,
  ).project;
  C.validateProject(linked);
});
test('nested component packages retain dependency revisions across project boundaries', async () => {
  const child = publish(await fixture());
  const root = C.working(child.project).components[0];
  const parent = publish(child.project, root.id, 'SYS-A');
  const exported = C.componentPackage(parent.project, parent.record.id);
  assert.equal(Object.keys(exported.catalog).length, 2);
  const target = U.createProject({
    name: 'Integration',
    designation: 'INT.000',
  });
  C.mergeCatalog(target, exported);
  C.validateProject(
    C.useRevision(target, parent.record.id, C.working(target).components[0].id)
      .project,
  );
});
test('history exchange retains independent catalog revisions and rejects rewritten revision identities', async () => {
  const local = await fixture(),
    published = publish(local),
    result = C.importHistory(local, published.project);
  assert.deepEqual(
    result.project.catalog[published.record.id],
    published.record,
  );
  const rewritten = C.clone(published.project);
  rewritten.catalog[published.record.id].message = 'Changed history';
  assert.throws(() => C.mergeCatalog(C.clone(published.project), rewritten), {
    code: 'catalog-collision',
  });
});
test('revision labels, independent definitions and dependency cycles are validated', async () => {
  const a = publish(await fixture());
  assert.throws(
    () => publish(C.checkoutComponent(a.project, 'module'), 'module', 'A'),
    { code: 'revision-label' },
  );
  const candidate = C.checkoutComponent(a.project, 'module');
  C.working(candidate).components.find((c) => c.id === 'plate').definitionId =
    'module';
  assert.throws(() => publish(candidate, 'module', 'B'), /contain itself/);
  const released = await fixture();
  assert.throws(
    () =>
      C.publishComponent(released, 'module', {
        label: 'A',
        author: 'Engineer',
        status: 'released',
      }),
    /incomplete/,
  );
});
test('catalog root placement can change quantity or parent without altering its definition', async () => {
  const a = publish(await fixture());
  const moved = C.configureOccurrence(a.project, 'module', null, 7);
  const c = C.working(moved).components.find((c) => c.id === 'module');
  assert.equal(c.quantity, 7);
  assert.equal(c.parentId, null);
  assert.equal(c.revision, 'A');
  assert.throws(() => C.configureOccurrence(a.project, 'module', 'plate', 1), {
    code: 'pinned-component',
  });
});

test('a component revision records its parent and packages retain its own history', async () => {
  const a = publish(await fixture());
  const b = publish(C.checkoutComponent(a.project, 'module'), 'module', 'B');
  assert.deepEqual(b.record.parents, [a.record.id]);
  const packaged = C.componentPackage(b.project, b.record.id);
  assert.deepEqual(
    Object.keys(packaged.catalog).sort(),
    [a.record.id, b.record.id].sort(),
  );
});
test('more than 64 sequential revisions are supported without treating history as assembly depth', () => {
  let p = U.createProject(
    { name: 'Single part', designation: 'PART.01' },
    true,
    'part',
  );
  const root = C.working(p).components[0];
  for (let n = 1; n <= 70; n++) {
    p = C.publishComponent(p, root.id, {
      label: String(n),
      author: 'Engineer',
    }).project;
    if (n !== 70) p = C.checkoutComponent(p, root.id);
  }
  const revision = C.working(p).components[0].source.revisionId;
  assert.equal(Object.keys(C.componentPackage(p, revision).catalog).length, 70);
});

test('single part projects do not require an artificial enclosing assembly', () => {
  const p = U.createProject(
    { name: 'Mounting bracket', designation: 'BRK.01' },
    true,
    'part',
  );
  assert.equal(C.working(p).components[0].type, 'part');
  assert.equal(C.dirty(p), false);
  C.validateProject(p);
});

test('updates preserve document identity so unchanged files do not appear replaced', async () => {
  const a = publish(await fixture());
  const before = C.working(a.project).documents[0].id;
  const checkout = C.checkoutComponent(a.project, 'module');
  assert.equal(C.working(checkout).documents[0].id, before);
  const b = publish(checkout, 'module', 'B');
  assert.equal(C.working(b.project).documents[0].id, before);
});
