import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import { checkConformance } from '../scripts/lib/conformance.mjs';
import { workspaceRevisions } from '../src/application/catalog/workspace.js';
import {
  createComplexExample,
  demoProject,
  COMPLEX_EXAMPLE_IDS as IDS,
  COMPLEX_EXAMPLE_SECTIONS,
} from '../src/data/demo.js';

test('the complex example is deterministic, localized and matches the shipped JSON', async () => {
  const english = createComplexExample('en');
  const ukrainian = createComplexExample('uk');
  C.validateProject(english);
  C.validateProject(ukrainian);
  assert.equal(checkConformance(english).valid, true);
  assert.equal(checkConformance(ukrainian).valid, true);
  assert.deepEqual(english, createComplexExample('en'));
  assert.deepEqual(ukrainian, createComplexExample('ua'));
  assert.deepEqual(
    JSON.parse(
      await readFile(
        new URL('../examples/inspection-complex.json', import.meta.url),
        'utf8',
      ),
    ),
    english,
  );
  assert.notEqual(C.working(english).meta.name, C.working(ukrainian).meta.name);
  assert.equal(english.createdAt, '2026-01-15T09:00:00.000Z');
  assert.deepEqual(english.extensions['org.openeskd.example'], {
    id: 'inspection-complex',
    version: 1,
  });
});

test('the complete learning structure has stable navigation and controlled routes on both branches', () => {
  const p = createComplexExample();
  assert.equal(C.working(p).components.length, 54);
  assert.equal(C.working(p).documents.length, 75);
  assert.equal(
    C.working(p).components.find((c) => c.id === IDS.system).type,
    'complex',
  );
  for (const branch of Object.values(p.branches)) {
    const ids = new Set(branch.working.components.map((c) => c.id));
    assert(
      COMPLEX_EXAMPLE_SECTIONS.every((section) => ids.has(section.componentId)),
    );
    assert.equal(C.manufacturingIssues(branch.working).length, 0);
    assert(
      branch.working.components.every((c) => c.manufacturing.steps.length > 0),
    );
    const plan = C.operationPlan(branch.working);
    assert(plan.every((task) => task.step && task.quantity > 0));
    assert(
      plan
        .filter((task) => task.component.id === IDS.system)
        .every((task) => task.step.facility),
    );
    assert(C.readiness(branch.working).length > 0);
  }
  const main = C.working(p);
  const software = main.components.filter((c) =>
    /software|firmware|payload-software/.test(c.id),
  );
  assert(software.length >= 6);
  assert(software.every((c) => c.type === 'set'));
  const softwareIds = new Set(software.map((c) => c.id));
  assert(
    main.documents
      .filter((d) => softwareIds.has(d.componentId))
      .every((d) => !['drawing', 'assemblyDrawing', 'model'].includes(d.kind)),
  );
});

test('catalog replacement preserves ancestry, frozen configuration and the independent alternative', () => {
  const p = createComplexExample();
  const baseline = p.commits[IDS.baseline];
  const mainTelemetry = C.working(p).components.find(
    (c) => c.id === IDS.telemetry,
  );
  const variant = p.branches['ground/rugged-station'].working;
  assert.deepEqual(p.catalog[IDS.catalogB].parents, [IDS.catalogA]);
  assert.equal(mainTelemetry.source.revisionId, IDS.catalogB);
  assert.equal(mainTelemetry.revision, 'B');
  assert.equal(
    baseline.snapshot.components.find((c) => c.id === IDS.telemetry).source
      .revisionId,
    IDS.catalogA,
  );
  assert.equal(
    variant.components.find((c) => c.id === IDS.telemetry).source.revisionId,
    IDS.catalogA,
  );
  assert.equal(
    variant.components.find((c) => c.id === 'ground-computer').revision,
    'ALT-1',
  );
  assert.equal(
    C.working(p).components.find((c) => c.id === 'ground-computer').revision,
    'A',
  );
  assert.equal(
    C.commonAncestor(
      p,
      p.branches.main.head,
      p.branches['ground/rugged-station'].head,
    ),
    IDS.baseline,
  );
  const batch = p.production[0];
  assert.equal(batch.commitId, IDS.baseline);
  assert.deepEqual(batch.snapshot, baseline.snapshot);
  assert.equal(
    batch.snapshot.components.find((c) => c.id === IDS.telemetry).source
      .revisionId,
    IDS.catalogA,
  );
  assert(
    batch.snapshot.documents.some((d) =>
      d.path.endsWith('SUP.410.010_A_interface.pdf'),
    ),
  );
  assert(
    C.working(p).documents.some((d) =>
      d.path.endsWith('SUP.410.010_B_interface.pdf'),
    ),
  );
  const frozen = C.clone(batch.snapshot);
  C.working(p).meta.description = 'An editable later project description.';
  assert.deepEqual(batch.snapshot, frozen);
  assert(Object.values(p.commits).every((c) => c.status !== 'released'));
  assert(Object.values(p.catalog).every((c) => c.status !== 'released'));
});

test('synthetic MVP results preserve rejected units and block unfinished integration', () => {
  const p = createComplexExample();
  const batch = p.production[0];
  const tasks = C.batchTasks(batch);
  const bracket = tasks.find((task) => task.component.id === 'tracker-bracket');
  assert.equal(batch.quantity, 2);
  assert.equal(bracket.quantity, 4);
  const preparation = C.taskResult(batch, bracket.key);
  assert.equal(preparation.accepted, 4);
  assert.equal(preparation.rejected, 1);
  assert.equal(preparation.events.length, 2);
  const communicationTest = tasks.find(
    (task) =>
      task.component.id === IDS.communications &&
      task.step.operation === 'test',
  );
  assert.equal(C.taskResult(batch, communicationTest.key).accepted, 1);
  assert.equal(C.taskResult(batch, communicationTest.key).rejected, 1);
  assert(
    batch.results.every(
      (event) => event.extensions['org.openeskd.example'].synthetic,
    ),
  );
  const verification = tasks.find(
    (task) =>
      task.component.id === IDS.verification && task.step.operation === 'test',
  );
  assert.throws(
    () =>
      C.recordResult(p, batch.id, {
        componentId: verification.component.id,
        operationId: verification.step.id,
        accepted: 1,
        rejected: 0,
        operator: 'Training reviewer',
        notes: 'Synthetic attempt before prerequisites are complete.',
      }),
    /prerequisite/,
  );
  assert.equal(batch.results.length, 17);
});

test('video paths are optional absent placeholders and supplied text evidence is explicitly synthetic', async () => {
  const p = createComplexExample();
  const documents = C.working(p).documents;
  const videos = documents.filter((d) => d.path.endsWith('.mp4'));
  assert.equal(videos.length, 2);
  assert(
    videos.every(
      (d) =>
        d.required === false &&
        d.sha256 === null &&
        d.path.includes('.placeholder.'),
    ),
  );
  assert(
    documents.every(
      (d) =>
        d.sha256 === null && !d.path.includes('://') && !d.path.startsWith('/'),
    ),
  );
  assert(!Object.hasOwn(p, 'blobs'));
  const fixtures = documents.filter(
    (d) =>
      d.path.endsWith('.synthetic.log') || d.path.endsWith('.synthetic.csv'),
  );
  const supplied = documents.filter(
    (d) => d.extensions['org.openeskd.example'].supplied,
  );
  assert.equal(supplied.length, 11);
  for (const document of supplied)
    await readFile(
      new URL(
        '../examples/inspection-complex-files/' + document.path,
        import.meta.url,
      ),
      'utf8',
    );
  assert(fixtures.length >= 5);
  for (const document of fixtures) {
    const text = await readFile(
      new URL(
        '../examples/inspection-complex-files/' + document.path,
        import.meta.url,
      ),
      'utf8',
    );
    assert.match(text, /synthetic/i);
    assert.equal(document.required, false);
    assert.equal(document.extensions['org.openeskd.example'].supplied, true);
  }
  for (const event of p.production[0].results.filter(
    (item) => item.evidencePath,
  ))
    await readFile(
      new URL(
        '../examples/inspection-complex-files/' + event.evidencePath,
        import.meta.url,
      ),
      'utf8',
    );
});

test('complex JSON and metadata ZIP round-trip all history, routes, evidence references and production results', async () => {
  const p = createComplexExample();
  const json = await E.read(
    new File([E.json(p)], 'inspection-complex.json', {
      type: 'application/json',
    }),
  );
  assert.deepEqual(json.project, p);
  const archive = await E.archive(p);
  const zip = await E.read(new File([archive], 'inspection-complex.zip'));
  assert.deepEqual(zip.project, p);
  const report = await E.projectReport(p, 'en');
  assert(report.includes('SUP.410.010_B_interface.pdf'));
  assert(report.includes('bench-interface.placeholder.mp4'));
  const workOrder = await E.projectReport(p, 'en', p.production[0]);
  assert(workOrder.includes('SUP.410.010_A_interface.pdf'));
  assert(workOrder.includes('SYNTHETIC'));
});

test('opening independent demo workspaces gives new project identities while keeping learning anchors stable', async () => {
  const first = await demoProject('en');
  const second = await demoProject('en');
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.id, IDS.project);
  assert.deepEqual(first.commits, second.commits);
  assert.deepEqual(first.catalog, second.catalog);
  assert.deepEqual(C.working(first), C.working(second));
  C.validateProject(first);
});

test('localized examples keep distinct immutable identities while their guide anchors stay stable', async () => {
  const english = createComplexExample('en');
  const ukrainian = createComplexExample('ua');
  assert.notEqual(english.id, ukrainian.id);
  assert.equal(workspaceRevisions([english, ukrainian], english.id).length, 4);
  const merged = C.mergeCatalog(C.clone(english), ukrainian);
  C.validateProject(merged);
  assert.equal(Object.keys(merged.catalog).length, 4);
  const englishIds = new Set(Object.keys(english.commits));
  assert(Object.keys(ukrainian.commits).every((id) => !englishIds.has(id)));
  assert.deepEqual(
    C.working(english).components.map((c) => c.id),
    C.working(ukrainian).components.map((c) => c.id),
  );
  for (const localized of [english, ukrainian]) {
    const telemetry = C.working(localized).components.find(
      (c) => c.id === IDS.telemetry,
    );
    const record = localized.catalog[telemetry.source.revisionId];
    const baseline = localized.production[0];
    assert.deepEqual(
      baseline.snapshot,
      localized.commits[baseline.commitId].snapshot,
    );
    assert.equal(C.manufacturingIssues(C.working(localized)).length, 0);
    const packaged = C.componentPackage(localized, record.id);
    const imported = (
      await E.read(new File([await E.archive(packaged)], 'telemetry.zip'))
    ).project;
    assert.deepEqual(imported, packaged);
    const target = C.createProject({ name: 'Independent integration target' });
    C.mergeCatalog(target, imported);
    const reused = C.useRevision(target, record.id, null, 2).project;
    C.validateProject(reused);
    assert.equal(
      C.working(reused).components[0].definitionId,
      telemetry.definitionId,
    );
    assert.equal(C.working(reused).components[0].source.revisionId, record.id);
  }
  assert.notEqual(
    C.working(english).components.find((c) => c.id === IDS.telemetry)
      .definitionId,
    C.working(ukrainian).components.find((c) => c.id === IDS.telemetry)
      .definitionId,
  );
  const sameLocale = await demoProject('ua');
  assert.deepEqual(sameLocale.catalog, ukrainian.catalog);
  assert.deepEqual(sameLocale.commits, ukrainian.commits);
});
