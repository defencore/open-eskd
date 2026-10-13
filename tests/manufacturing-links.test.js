import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import * as Z from '../src/files/zip/index.js';
import { createStructureForms } from '../src/application/forms/structure.js';
import { createDocumentsForms } from '../src/application/forms/documents.js';

function fixture() {
  const p = C.createProject({
    name: 'Staged assembly',
    designation: 'MECH.001.000.000',
  });
  const s = C.working(p);
  const part = (id, parentId, operations, type = 'part', quantity = 1) =>
    C.component({
      id,
      parentId,
      type,
      quantity,
      name: id,
      designation: 'MECH.' + id,
      owner: 'Engineer',
      manufacturer: 'Workshop',
      status: 'released',
      manufacturing: C.manufacturing({
        steps: operations.map((operation, i) =>
          C.operation({
            id: id + '-' + i,
            operation,
            instructions: 'Follow controlled instruction A.',
          }),
        ),
      }),
    });
  s.components = [
    part('product', null, ['fastening', 'inspect'], 'assembly', 2),
    part('insert', 'product', ['pressFit', 'assembly', 'inspect'], 'assembly'),
    part('printed', 'insert', ['printing3d', 'drilling', 'inspect']),
    part('tube', 'insert', ['turning', 'drilling', 'inspect']),
    part('piston', 'insert', ['turning', 'fitting', 'inspect']),
    part('bracket', 'product', ['cutStock', 'drilling', 'bending', 'inspect']),
    part('bolts', 'product', ['purchase', 'inspect'], 'standard', 4),
  ];
  const get = (id) => s.components.find((c) => c.id === id);
  get('insert').manufacturing.steps[0].componentInputs = [
    'printed',
    'tube',
  ].map((id) => C.inputReference(get(id)));
  get('insert').manufacturing.steps[1].componentInputs = [
    C.inputReference(get('piston')),
  ];
  get('piston').manufacturing.steps[0].dependsOn = [
    {
      componentId: 'insert',
      operationId: 'insert-0',
      revision: 'A',
      catalogRevisionId: null,
    },
  ];
  get('piston').manufacturing.steps[1].componentInputs = [
    C.inputReference(get('tube'), 1, 'reference'),
  ];
  C.validateProject(p);
  return { p, s, get };
}

async function fileBlob(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return {
    id: await Z.hash(bytes),
  };
}

async function addDocuments(p) {
  const blob = await fileBlob(
    new File(['Controlled drawing A'], 'drawing.txt'),
  );
  const s = C.working(p);
  s.documents = s.components
    .filter((c) => ['assembly', 'part'].includes(c.type))
    .map((c) => ({
      id: 'doc-' + c.id,
      name: c.id + '.txt',
      path: c.id + '.txt',
      componentId: c.id,
      kind: 'drawing',
      revision: 'A',
      sha256: blob.id,
      required: true,
    }));
  s.components[1].manufacturing.steps[0].documents = [
    C.documentReference(s.documents[1]),
  ];
  C.validateProject(p);
}

test('staged assembly permits piston work after press fitting and before the same assembly is complete', () => {
  const { s } = fixture(),
    before = C.clone(s),
    plan = C.operationPlan(s);
  const position = (id) => plan.findIndex((task) => task.step?.id === id);
  assert(position('printed-2') < position('insert-0'));
  assert(position('tube-2') < position('insert-0'));
  assert(position('insert-0') < position('piston-0'));
  assert(position('piston-2') < position('insert-1'));
  assert(position('insert-2') < position('product-0'));
  assert(position('bracket-3') < position('product-0'));
  assert(position('bracket-1') < position('bracket-2'));
  assert(
    plan
      .filter((task) => task.component.id === 'bolts')
      .every((task) => task.quantity === 8),
  );
  assert.equal(plan.find((task) => task.step?.id === 'piston-1').quantity, 2);
  assert.equal(
    plan.find((task) => task.step?.id === 'printed-0').stage,
    plan.find((task) => task.step?.id === 'tube-0').stage,
  );
  assert.deepEqual(s, before);
});

test('unlinked assembly steps wait for all immediate children and explicit intermediate dependencies can reveal a cycle', () => {
  const { s, get } = fixture();
  get('insert').manufacturing.steps[0].componentInputs = [];
  assert.throws(() => C.operationPlan(s), { code: 'route-cycle' });
  get('piston').manufacturing.steps[0].dependsOn = [];
  const plan = C.operationPlan(s);
  assert(
    plan.findIndex((task) => task.step?.id === 'piston-2') <
      plan.findIndex((task) => task.step?.id === 'insert-0'),
  );
});

test('self dependencies, forward route dependencies and cross-component cycles are rejected', () => {
  for (const ref of [
    {
      componentId: 'tube',
      operationId: 'tube-0',
      revision: 'A',
      catalogRevisionId: null,
    },
    {
      componentId: 'tube',
      operationId: 'tube-2',
      revision: 'A',
      catalogRevisionId: null,
    },
    {
      componentId: 'insert',
      operationId: 'insert-0',
      revision: 'A',
      catalogRevisionId: null,
    },
  ]) {
    const { p, get } = fixture();
    get('tube').manufacturing.steps[0].dependsOn.push(ref);
    assert.throws(() => C.validateProject(p), { code: 'route-cycle' });
  }
});

test('missing operations, components and documents fail with targeted diagnostics rather than silently dropping links', async () => {
  for (const [code, change] of [
    [
      'route-operation-missing',
      (s) => {
        s.components.find((c) => c.id === 'insert').manufacturing.steps.shift();
      },
    ],
    [
      'route-component-missing',
      (s) => {
        s.components = s.components.filter((c) => c.id !== 'tube');
        s.documents = s.documents.filter((d) => d.componentId !== 'tube');
      },
    ],
    [
      'route-document-missing',
      (s) => {
        s.documents = s.documents.filter((d) => d.id !== 'doc-insert');
      },
    ],
  ]) {
    const { p, s } = fixture();
    await addDocuments(p);
    change(s);
    assert.throws(() => C.validateProject(p), { code });
  }
});

test('link validation rejects duplicates, unknown keys, unsafe identities, invalid quantities and excess links', () => {
  for (const change of [
    (step) =>
      step.dependsOn.push({
        componentId: 'tube',
        operationId: 'tube-0',
        extra: true,
      }),
    (step) =>
      step.componentInputs.push({
        componentId: 'constructor',
        revision: 'A',
        catalogRevisionId: null,
        quantity: 1,
        usage: 'input',
      }),
    (step) =>
      step.componentInputs.push({
        componentId: 'tube',
        revision: 'A',
        catalogRevisionId: null,
        quantity: 0,
        usage: 'input',
      }),
    (step) =>
      step.componentInputs.push(
        ...Array.from({ length: 101 }, (_, i) => ({
          componentId: 'c-' + i,
          revision: 'A',
          catalogRevisionId: null,
          quantity: 1,
          usage: 'input',
        })),
      ),
    (step) =>
      step.dependsOn.push(
        {
          componentId: 'tube',
          operationId: 'tube-0',
          revision: 'A',
          catalogRevisionId: null,
        },
        {
          componentId: 'tube',
          operationId: 'tube-0',
          revision: 'A',
          catalogRevisionId: null,
        },
      ),
    (step) => {
      step.documents = null;
    },
  ]) {
    const step = C.operation();
    change(step);
    assert.throws(
      () => C.validateManufacturing(C.manufacturing({ steps: [step] })),
      { code: 'route-link-invalid' },
    );
  }
});

test('input revision and document-byte changes remain visible until explicitly reviewed and block release', async () => {
  const { p, s, get } = fixture();
  await addDocuments(p);
  assert.equal(C.readiness(s).length, 0);
  get('tube').revision = 'B';
  assert(
    C.readiness(s).some(
      (issue) =>
        issue.code === 'inputRevision' && issue.componentId === 'piston',
    ),
  );
  assert.throws(
    () =>
      C.commit(p, {
        version: '1.0.0',
        author: 'Engineer',
        message: 'Release reviewed assembly',
        status: 'released',
      }),
    /manufacturing checklist/,
  );
  for (const c of s.components)
    for (const step of c.manufacturing.steps)
      step.componentInputs = step.componentInputs.map((ref) =>
        ref.componentId === 'tube'
          ? C.inputReference(get('tube'), ref.quantity, ref.usage)
          : ref,
      );
  const replacement = await fileBlob(
    new File(['Replaced drawing; label still A'], 'replacement.txt'),
  );
  s.documents[1].sha256 = replacement.id;
  assert(C.readiness(s).some((issue) => issue.code === 'operationDocument'));
  get('insert').manufacturing.steps[0].documents = [
    C.documentReference(s.documents[1]),
  ];
  assert.equal(C.readiness(s).length, 0);
  C.commit(p, {
    version: '1.0.0',
    author: 'Engineer',
    message: 'Release reviewed assembly',
    status: 'released',
  });
});

test('catalog reuse remaps operation, input and document links independently for repeated placements and checkout', async () => {
  const { p } = fixture();
  await addDocuments(p);
  const published = C.publishComponent(p, 'product', {
    label: 'A',
    author: 'Engineer',
  });
  assert.equal(C.manufacturingIssues(C.working(published.project)).length, 0);
  const reused = C.useRevision(published.project, published.record.id, null, 3);
  const s = C.working(reused.project),
    ids = C.descendants(s, reused.id);
  for (const c of s.components.filter((c) => ids.has(c.id)))
    for (const step of c.manufacturing.steps) {
      assert(
        [...step.dependsOn, ...step.componentInputs].every((ref) =>
          ids.has(ref.componentId),
        ),
      );
      assert(
        step.documents.every((ref) =>
          ids.has(
            s.documents.find((doc) => doc.id === ref.documentId).componentId,
          ),
        ),
      );
    }
  assert.equal(C.manufacturingIssues(s).length, 0);
  const editable = C.checkoutComponent(reused.project, reused.id);
  assert.equal(C.manufacturingIssues(C.working(editable)).length, 0);
  C.validateProject(editable);
  const tampered = C.clone(reused.project);
  C.working(tampered)
    .components.find((c) => c.id === reused.id)
    .manufacturing.steps[0].documents.push(C.documentReference(s.documents[0]));
  assert.throws(
    () => C.validateProject(tampered),
    /Pinned component definition changed/,
  );
  assert.deepEqual(
    (
      await E.read(
        new File(
          [
            await E.archive(
              C.componentPackage(reused.project, published.record.id),
            ),
          ],
          'component.zip',
        ),
      )
    ).project.catalog[published.record.id],
    published.record,
  );
});

test('a standalone component with external route links cannot be published with silently broken references', () => {
  const { p } = fixture();
  assert.throws(
    () => C.publishComponent(p, 'piston', { label: 'A', author: 'Engineer' }),
    { code: 'route-external' },
  );
  assert.equal(Object.keys(p.catalog).length, 0);
});

test('publishing and reusing an assembly preserve stale input expectations instead of accepting changed revisions', () => {
  const { p, get } = fixture();
  get('tube').revision = 'B';
  const published = C.publishComponent(p, 'product', {
    label: 'A',
    author: 'Engineer',
  });
  assert(C.manufacturingIssues(C.working(published.project)).length > 0);
  const reused = C.useRevision(published.project, published.record.id);
  assert(
    C.manufacturingIssues(C.working(reused.project)).length >
      C.manufacturingIssues(C.working(published.project)).length,
  );
  const editable = C.checkoutComponent(reused.project, reused.id);
  assert(C.manufacturingIssues(C.working(editable)).length > 0);
});

test('JSON, ZIP and exported plans preserve the complete dependency graph and revision requirements', async () => {
  const { p } = fixture();
  await addDocuments(p);
  C.commit(p, {
    version: '0.2.0',
    author: 'Engineer',
    message: 'Plan staged assembly',
  });
  const zip = await E.archive(p);
  assert.deepEqual((await E.read(new File([zip], 'project.zip'))).project, p);
  assert.deepEqual(
    (await E.read(new File([E.json(p)], 'project.json'))).project,
    p,
  );
  const entries = await Z.read(zip),
    guide = Z.decoder.decode(
      entries.find((entry) => entry.name === 'manufacturing/ASSEMBLY.md').data,
    );
  for (const text of [
    '## Operations order',
    'Press fitting',
    'Drilling',
    'Fitting / matching',
    'Fastening',
    'Prerequisite operations: MECH.insert',
    'Reference / matching part: MECH.tube',
    'SHA-256',
  ])
    assert(guide.includes(text), text);
  assert(E.csv(C.working(p)).includes('Prerequisite operations'));
});

test('deleting referenced components or documents leaves the current project untouched on rejection', async () => {
  for (const kind of ['component', 'document']) {
    const { p } = fixture();
    await addDocuments(p);
    const original = C.clone(p),
      state = { projects: [p], selected: 'tube' };
    const context = {
      state,
      project: () => state.projects[0],
      snapshot: () => C.working(state.projects[0]),
      persist: async () => {
        assert.fail('Invalid changes must not be persisted');
      },
    };
    const forms =
      kind === 'component'
        ? createStructureForms(context)
        : createDocumentsForms(context);
    await assert.rejects(
      forms.handleForm({ dataset: { form: 'delete-' + kind } }, null, () =>
        kind === 'component' ? 'tube' : 'doc-insert',
      ),
      {
        code:
          kind === 'component'
            ? 'route-component-missing'
            : 'route-document-missing',
      },
    );
    assert.deepEqual(state.projects[0], original);
    assert.equal(state.selected, 'tube');
  }
});
