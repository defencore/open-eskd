import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as U from '../src/application/project-tools.js';

function fixture() {
  return U.createProject({
    name: 'Control unit',
    designation: 'PRJ.001.000',
    owner: 'Engineer',
  });
}

test('new projects start with an identified main assembly and a clean baseline', () => {
  const p = fixture(),
    s = C.working(p);
  assert.equal(s.components.length, 1);
  assert.equal(s.components[0].type, 'assembly');
  assert.equal(s.components[0].designation, s.meta.designation);
  assert.equal(s.components[0].name, s.meta.name);
  assert.equal(C.dirty(p), false);
  assert.deepEqual(C.head(p).snapshot, s);
  C.validateProject(p);
});
test('an engineer can choose a project without an initial assembly', () => {
  const p = U.createProject({ name: 'Files only', designation: '' }, false);
  assert.equal(C.working(p).components.length, 0);
  C.validateProject(p);
});
test('suggested designations preserve numeric width and skip existing values', () => {
  const p = fixture(),
    root = C.working(p).components[0];
  assert.equal(U.nextDesignation(C.working(p), root.id), 'PRJ.001.001');
  const candidate = U.addList(
    p,
    'prj.001.001; First; 1\nPRJ.001.002; Second; 2',
    root.id,
    'part',
    'Engineer',
  );
  assert.equal(U.nextDesignation(C.working(candidate), root.id), 'PRJ.001.003');
});
test('nonnumeric designation conventions receive an editable unused suffix', () => {
  const p = U.createProject({
    name: 'Custom conventions',
    designation: 'CONTROL',
  });
  assert.equal(
    U.nextDesignation(C.working(p), C.working(p).components[0].id),
    'CONTROL-01',
  );
});
test('Excel paste accepts a localized header, tabs, CRLF and decimal comma', () => {
  const result = U.parseList(
    'Позначення\tНазва\tКількість\r\nPRJ.1\tPlate\t2,5\r\nPRJ.2\tBracket\t',
    C.working(fixture()),
  );
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.rows, [
    { designation: 'PRJ.1', name: 'Plate', quantity: 2.5 },
    { designation: 'PRJ.2', name: 'Bracket', quantity: 1 },
  ]);
});
test('semicolon lists preserve quoted names and escaped quotes', () => {
  const result = U.parseList(
    'designation;name;quantity\nPRJ.1;"Front; plate";2\nPRJ.2;"Bracket ""A""";1',
    C.working(fixture()),
  );
  assert.deepEqual(result.errors, []);
  assert.equal(result.rows[0].name, 'Front; plate');
  assert.equal(result.rows[1].name, 'Bracket "A"');
});
test('preview reports duplicate designations, missing columns and invalid quantities by row', () => {
  const result = U.parseList(
    'PRJ.001.000; Duplicate; 1\nPRJ.1; New; 0\nOnly one column\nPRJ.2; Valid; 2\nprj.2; Duplicate again; 1',
    C.working(fixture()),
  );
  assert.deepEqual(
    result.errors.map((e) => [e.line, e.code]),
    [
      [1, 'duplicate'],
      [2, 'quantity'],
      [3, 'columns'],
      [5, 'duplicate'],
    ],
  );
  assert.equal(result.rows.length, 1);
});
test('a list is applied atomically and preserves earlier snapshots', () => {
  const p = fixture(),
    original = C.clone(p),
    parent = C.working(p).components[0].id;
  const candidate = U.addList(
    p,
    'PRJ.1; Plate; 2\nPRJ.2; Bracket; 4',
    parent,
    'part',
    'Engineer',
  );
  assert.deepEqual(p, original);
  assert.equal(C.working(candidate).components.length, 3);
  assert.equal(C.head(candidate).snapshot.components.length, 1);
  assert(
    candidate.branches.main.working.components
      .slice(1)
      .every((c) => c.parentId === parent && c.owner === 'Engineer'),
  );
  C.validateProject(candidate);
  assert.throws(
    () =>
      U.addList(p, 'PRJ.1; Valid; 1\nPRJ.2; Invalid; -1', parent, 'part', ''),
    /Fix/,
  );
  assert.deepEqual(p, original);
});
test('bulk quantities follow the same nested manufacturing rules as manual entries', () => {
  const p = fixture(),
    parent = C.working(p).components[0];
  parent.quantity = 3;
  const candidate = U.addList(
    p,
    'PRJ.1; Bracket; 4',
    parent.id,
    'part',
    'Engineer',
  );
  assert.equal(
    C.flatten(C.working(candidate)).find((c) => c.designation === 'PRJ.1')
      .totalQuantity,
    12,
  );
});
test('bulk attachment to a missing or leaf parent is rejected', () => {
  const p = fixture();
  assert.throws(
    () => U.addList(p, 'PRJ.1; Bracket; 4', 'missing', 'part', ''),
    /Missing component/,
  );
  C.working(p).components[0].type = 'part';
  assert.throws(
    () =>
      U.addList(
        p,
        'PRJ.1; Bracket; 4',
        C.working(p).components[0].id,
        'part',
        '',
      ),
    /Only assemblies/,
  );
});

test('designation suggestions preserve long numeric identifiers without rounding', () => {
  const p = U.createProject({
    name: 'Serial numbering',
    designation: 'PRJ.12345678901234567890',
  });
  assert.equal(
    U.nextDesignation(C.working(p), C.working(p).components[0].id),
    'PRJ.12345678901234567891',
  );
});

test('a standalone part completes the structure step without artificial child components', async () => {
  const { createWorkflow } = await import('../src/ui/workflow.js');
  const p = U.createProject(
    { name: 'Single part', designation: 'PART.001' },
    true,
    'part',
  );
  const steps = createWorkflow({
    project: () => p,
    snapshot: () => C.working(p),
  }).workflowSteps();
  assert.equal(steps[0].done, true);
});
