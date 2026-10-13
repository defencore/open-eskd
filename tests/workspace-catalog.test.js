import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as U from '../src/application/project-tools.js';
import * as E from '../src/files/index.js';
import {
  importCatalog,
  workspaceRevisions,
  whereUsed,
} from '../src/application/catalog/workspace.js';

test('using a workspace revision excludes unrelated project files and unrelated revisions', async () => {
  let source = U.createProject(
    { name: 'Supplier work', designation: 'SUP.1' },
    true,
    'part',
  );
  const root = C.working(source).components[0];
  const published = C.publishComponent(source, root.id, {
    label: 'A',
    author: 'Supplier',
  });
  source = published.project;
  source = E.registerDocuments(source, ['private.txt']);
  const target = U.createProject({ name: 'Integration', designation: 'INT.1' });
  const result = importCatalog(target, source, published.record.id);
  assert.equal(Object.hasOwn(result, 'blobs'), false);
  assert.equal(Object.keys(result.catalog).length, 1);
});
test('workspace revisions deduplicate shared immutable records and show placements across projects', () => {
  const source = U.createProject(
      { name: 'Original part', designation: 'PART.1' },
      true,
      'part',
    ),
    id = C.working(source).components[0].id;
  const a = C.publishComponent(source, id, { label: 'A', author: 'Engineer' });
  let target = importCatalog(
    U.createProject({ name: 'Product', designation: 'PROD.1' }),
    a.project,
    a.record.id,
  );
  const root = C.working(target).components[0].id;
  target = C.useRevision(target, a.record.id, root, 3).project;
  target = C.useRevision(target, a.record.id, root, 5).project;
  assert.equal(workspaceRevisions([a.project, target], target.id).length, 1);
  assert.deepEqual(
    whereUsed([a.project, target], a.record.itemId).map((use) => use.quantity),
    [1, 3, 5],
  );
});
