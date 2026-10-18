import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
function project() {
  const p = C.createProject({ name: 'Production' });
  C.working(p).components.push(
    C.component({
      id: 'part',
      name: 'Housing',
      designation: 'P.1',
      quantity: 2,
      manufacturer: 'Print shop',
      manufacturing: C.manufacturing({
        steps: [
          C.operation({
            id: 'print',
            operation: 'printing3d',
            facility: 'Print shop',
          }),
          C.operation({
            id: 'drill',
            operation: 'drilling',
            facility: 'Machine shop',
            check: 'Inspect against drawing A.',
          }),
        ],
      }),
    }),
  );
  return E.registerDocuments(p, ['parts/housing.pdf'], 'part');
}
function batch(p) {
  return C.createBatch(p, {
    name: 'MVP-001',
    mode: 'prototype',
    quantity: 3,
    author: 'Planner',
  });
}
function result(p, b, operationId, accepted, rejected = 0, notes = '') {
  return C.recordResult(p, b.id, {
    componentId: 'part',
    operationId,
    accepted,
    rejected,
    operator: 'Inspector',
    notes,
  });
}

test('work orders freeze structure, quantities, routes and file references', () => {
  const p = project(),
    b = batch(p);
  assert(C.batchTasks(b).every((task) => task.quantity === 6));
  C.working(p).components[0].revision = 'B';
  C.working(p).documents[0].path = 'parts/housing-B.pdf';
  C.working(p).components[0].manufacturing.steps = [];
  assert.equal(b.snapshot.components[0].revision, 'A');
  assert.equal(b.snapshot.documents[0].path, 'parts/housing.pdf');
  assert.equal(C.batchTasks(b).length, 2);
  C.validateProject(p);
});
test('downstream results require accepted prerequisites, and reworked units preserve rejection history', () => {
  const p = project(),
    b = batch(p);
  assert.throws(() => result(p, b, 'drill', 1), /prerequisite/);
  result(p, b, 'print', 4, 2, 'Two failed prints; replace them.');
  assert.throws(() => result(p, b, 'drill', 1), /prerequisite/);
  result(p, b, 'print', 2, 0, 'Replacement units inspected.');
  result(p, b, 'drill', 6);
  const totals = C.taskResult(b, C.operationKey('part', 'print'));
  assert.equal(totals.accepted, 6);
  assert.equal(totals.rejected, 2);
  assert.equal(totals.events.length, 2);
  assert.throws(() => result(p, b, 'print', 1), /exceeds/);
});
test('invalid production input is rejected without mutating the batch', () => {
  const p = project(),
    b = batch(p),
    before = C.clone(b);
  assert.throws(() => result(p, b, 'print', 0, 1, ''), /inspection note/);
  assert.throws(() => result(p, b, 'print', -1), /Invalid production/);
  assert.throws(
    () =>
      C.recordResult(p, b.id, {
        componentId: 'part',
        operationId: 'print',
        accepted: 1,
        rejected: 0,
        operator: 'Inspector',
        notes: '',
        evidencePath: '../outside.pdf',
      }),
    /Invalid production/,
  );
  assert.deepEqual(b, before);
  assert.throws(
    () =>
      C.createBatch(p, {
        name: 'Invalid',
        mode: 'series',
        quantity: 0,
        author: 'Planner',
      }),
    /Invalid production batch/,
  );
});
test('component-completion prerequisites include input inspection results', () => {
  const p = project(),
    s = C.working(p);
  s.components[0].parentId = 'assembly';
  s.components.push(
    C.component({
      id: 'assembly',
      type: 'assembly',
      name: 'Assembly',
      designation: 'A.1',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'assemble', operation: 'assembly' })],
      }),
    }),
  );
  const b = batch(p);
  assert.throws(
    () =>
      C.recordResult(p, b.id, {
        componentId: 'assembly',
        operationId: 'assemble',
        accepted: 1,
        rejected: 0,
        operator: 'Inspector',
        notes: '',
      }),
    /prerequisite/,
  );
  result(p, b, 'print', 6);
  result(p, b, 'drill', 6);
  C.recordResult(p, b.id, {
    componentId: 'assembly',
    operationId: 'assemble',
    accepted: 3,
    rejected: 0,
    operator: 'Inspector',
    notes: '',
  });
  C.validateProject(p);
});
test('an assembly inspection requires complete child routes even without an assembly operation', () => {
  const p = project(),
    s = C.working(p);
  s.components[0].parentId = 'system';
  s.components.push(
    C.component({
      id: 'system',
      type: 'assembly',
      name: 'Integrated system',
      designation: 'SYS.1',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'accept', operation: 'inspect' })],
      }),
    }),
  );
  const b = batch(p),
    accept = () =>
      C.recordResult(p, b.id, {
        componentId: 'system',
        operationId: 'accept',
        accepted: 3,
        rejected: 0,
        operator: 'Inspector',
        notes: '',
      });
  const parent = C.batchTasks(b).find((task) => task.component.id === 'system');
  assert.deepEqual(
    C.productionPrerequisites(b, parent).map((task) => task.step.id),
    ['print', 'drill'],
  );
  assert.throws(accept, /prerequisite/);
  assert.equal(b.results.length, 0);
  result(p, b, 'print', 6);
  assert.throws(accept, /prerequisite/);
  result(p, b, 'drill', 6);
  accept();
  assert.equal(C.taskResult(b, C.operationKey('system', 'accept')).accepted, 3);
  C.validateProject(p);
});
test('independent production result records merge and conflicting cumulative quantities are rejected', () => {
  const p = project(),
    b = batch(p),
    left = C.clone(p),
    right = C.clone(p);
  result(left, left.production[0], 'print', 2);
  result(right, right.production[0], 'print', 3);
  const merged = C.importHistory(left, right).project;
  assert.equal(
    C.taskResult(merged.production[0], C.operationKey('part', 'print'))
      .accepted,
    5,
  );
  assert.equal(
    C.importHistory(merged, right).project.production[0].results.length,
    2,
  );
  result(right, right.production[0], 'print', 3);
  assert.throws(() => C.importHistory(merged, right), /exceeds/);
  assert.equal(b.results.length, 0);
});
test('facility work order includes only relevant operations and documents, while retaining prerequisite names', async () => {
  const p = project(),
    b = batch(p);
  C.working(p).documents.push({
    id: 'private',
    name: 'unrelated.pdf',
    path: 'private/unrelated.pdf',
    componentId: null,
    kind: 'other',
    revision: 'A',
    sha256: null,
    required: false,
  });
  const html = await E.projectReport(p, 'en', b, 'Machine shop');
  assert(html.includes('Drilling'));
  assert(html.includes('Inspect against drawing A.'));
  assert(html.includes('parts/housing.pdf'));
  assert(!html.includes('private/unrelated.pdf'));
  assert(!html.includes('<h3>1. P.1 · 3D printing'));
});

test('decimal unit quantities can be accepted without floating-point residuals or unbounded totals', () => {
  const p = project();
  C.working(p).components[0].quantity = 0.1;
  const b = batch(p);
  result(p, b, 'print', 0.3);
  result(p, b, 'drill', 0.3);
  assert(C.quantityAccepted(0.3, C.batchTasks(b)[0].quantity));
  assert(!C.quantityAccepted(0, 1e-20));
  assert(!C.quantityAccepted(5, Infinity));
  assert(!C.quantityAccepted(1000000, 1000001));
  const invalid = C.clone(p);
  invalid.production[0].results[0].accepted = 1e308;
  assert.throws(() => C.validateProject(invalid), /exceeds/);
});
test('import validation rejects downstream results without accepted prerequisites', () => {
  const p = project(),
    b = batch(p);
  b.results.push({
    id: 'forged',
    createdAt: C.now(),
    componentId: 'part',
    operationId: 'drill',
    accepted: 1,
    rejected: 0,
    operator: 'Inspector',
    notes: '',
    evidencePath: '',
  });
  assert.throws(() => C.validateProject(p), /prerequisite/);
});
