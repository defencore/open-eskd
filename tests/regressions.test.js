import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as U from '../src/application/project-tools.js';
import { strings } from '../src/i18n/index.js';
import { createWorkflow } from '../src/ui/workflow.js';

test('a release is blocked by domain rules even without the interface', () => {
  const p = U.createProject({ name: 'Release test', designation: 'R.001' }),
    before = C.clone(p);
  assert.throws(
    () =>
      C.commit(p, {
        author: 'Engineer',
        message: 'Release',
        version: '1.0.0',
        status: 'released',
      }),
    /manufacturing checklist/,
  );
  assert.deepEqual(p, before);
});
test('nested quantity overflow is rejected before manufacturing export', () => {
  let p = U.createProject({ name: 'Quantities', designation: 'Q.001' });
  p = U.addList(
    p,
    'Q.002; Subassembly; 1000000',
    C.working(p).components[0].id,
    'assembly',
    'Engineer',
  );
  p = U.addList(
    p,
    'Q.003; Part; 1000000',
    C.working(p).components[1].id,
    'part',
    'Engineer',
  );
  C.working(p).components[0].quantity = 1000000;
  assert.throws(() => C.validateProject(p), /Total quantity/);
});
test('malformed production objects produce schema diagnostics rather than TypeError', () => {
  const p = C.createProject({ name: 'Malformed data' });
  p.production = null;
  assert.throws(
    () => C.validateProject(p),
    (error) =>
      error instanceof Error &&
      !(error instanceof TypeError) &&
      /production batches/.test(error.message),
  );
});
test('both languages contain the same complete translation keys', () => {
  assert.deepEqual(
    Object.keys(strings.en).sort(),
    Object.keys(strings.ua).sort(),
  );
  for (const dictionary of Object.values(strings))
    for (const value of Object.values(dictionary))
      assert.equal(typeof value, 'string');
});
test('large valid trees retain sibling ordering and descendant quantities', () => {
  const p = U.createProject({ name: 'Large assembly', designation: 'L.000' }),
    s = C.working(p),
    root = s.components[0];
  root.quantity = 2;
  for (let i = 1; i <= 2000; i++)
    s.components.push(
      C.component({
        ...root,
        id: 'part-' + i,
        definitionId: 'part-' + i,
        parentId: root.id,
        type: 'part',
        designation: 'L.' + i,
        quantity: 3,
      }),
    );
  C.validateProject(p);
  const rows = C.flatten(s);
  assert.equal(rows.length, 2001);
  assert.equal(rows[1].id, 'part-1');
  assert.equal(rows.at(-1).totalQuantity, 6);
  assert.equal(C.descendants(s, root.id).size, 2001);
});

test('the workflow supports the complete 5000-version history without recursive stack overflow', () => {
  const p = C.createProject({ name: 'Long history' });
  const baseline = C.head(p);
  const start = Date.parse(baseline.createdAt);
  p.commits = {};
  for (let index = 0; index < 5000; index++) {
    const id = 'version-' + index;
    p.commits[id] = {
      ...baseline,
      id,
      version: String(index),
      parents: index ? ['version-' + (index - 1)] : [],
      createdAt: new Date(start + index).toISOString(),
    };
  }
  p.branches.main.head = 'version-4999';
  p.commits['version-4999'].parents.push('version-1000');
  C.validateProject(p);
  const workflow = createWorkflow({
    project: () => p,
    snapshot: () => C.working(p),
  });
  const history = workflow.reachableHistory(p);
  assert.equal(history.length, 5000);
  assert.equal(new Set(history.map((record) => record.id)).size, 5000);
  assert.equal(history[0].id, 'version-4999');
  assert.equal(history.at(-1).id, 'version-0');
  assert.equal(workflow.workflowSteps()[2].done, true);
});
