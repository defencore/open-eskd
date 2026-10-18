import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import { checkConformance } from '../scripts/lib/conformance.mjs';

test('branch and version references reject coercible JSON values consistently with the schema', () => {
  for (const change of [
    (p) => {
      p.activeBranch = ['main'];
    },
    (p) => {
      p.branches.main.head = [p.branches.main.head];
    },
    (p) => {
      const initial = C.head(p);
      C.commit(p, { author: 'Engineer', message: 'Update', version: '0.2.0' });
      C.head(p).parents = [[initial.id]];
    },
    (p) => {
      p.fileCheck = {
        schema: 'open-eskd-file-check-1',
        projectId: p.id,
        fingerprint: ['a'.repeat(64)],
        checkedAt: C.now(),
        files: [],
      };
    },
  ]) {
    const p = C.createProject({ name: 'Identity audit' });
    change(p);
    assert.equal(checkConformance(p).errors[0].stage, 'structure');
    assert.throws(() => C.validateProject(p), { name: 'ValidationError' });
  }
});

test('version and branch commands reject coerced identities before changing history', () => {
  const p = C.createProject({ name: 'Identity audit' }),
    before = C.clone(p),
    headId = C.head(p).id;
  for (const parents of [[[headId]], null, false, 0, '']) {
    assert.throws(
      () =>
        C.commit(p, {
          author: 'Engineer',
          message: 'Invalid parents',
          version: '0.2.0',
          parents,
        }),
      /Invalid parent versions/,
    );
    assert.deepEqual(p, before);
  }
  assert.throws(() => C.createBranch(p, ['alternative']), /branch names/);
  assert.deepEqual(p, before);
  assert.throws(
    () => C.createBranch(p, 'alternative', [headId]),
    /Missing source version/,
  );
  assert.deepEqual(p, before);
});

test('catalog ancestry rejects coerced reference identities with a validation error', () => {
  const p = C.createProject({ name: 'Catalog identity audit' });
  C.working(p).components.push(
    C.component({ id: 'part', name: 'Part', designation: 'P.1' }),
  );
  const first = C.publishComponent(p, 'part', {
    label: 'A',
    author: 'Engineer',
  });
  const editable = C.checkoutComponent(first.project, 'part');
  const second = C.publishComponent(editable, 'part', {
    label: 'B',
    author: 'Engineer',
  });
  second.project.catalog[second.record.id].parents = [[first.record.id]];
  assert.equal(checkConformance(second.project).errors[0].stage, 'structure');
  assert.throws(
    () => C.validateProject(second.project),
    /Invalid component revision ancestry/,
  );
});
