import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import { createProductionView } from '../src/ui/production/view.js';
import { createProductionDialogs } from '../src/ui/production/dialogs.js';
import { createProductionController } from '../src/application/production.js';
import { createComponents } from '../src/ui/components.js';
import { createFormGuidance } from '../src/ui/form-guidance.js';
import { translate } from '../src/i18n/index.js';

function project(quantity = 1) {
  const initial = C.createProject({
    name: 'Test fixture',
    designation: 'FIX.000',
  });
  C.working(initial).components = [
    C.component({
      id: 'root',
      name: 'Test fixture',
      designation: 'FIX.000',
      type: 'assembly',
    }),
    C.component({
      id: 'plate',
      parentId: 'root',
      name: '<img src=x> mounting plate',
      designation: 'FIX.001',
      quantity,
      manufacturer: 'Workshop A',
      manufacturing: C.manufacturing({
        technology: 'other',
        steps: [
          C.operation({
            id: 'prepare',
            operation: 'prepare',
            instructions: 'Review approved documentation',
            check: 'Revision confirmed',
            facility: 'Preparation desk',
          }),
          C.operation({
            id: 'inspect',
            operation: 'inspect',
            instructions: 'Inspect against the approved drawing',
            check: '<script>check</script>',
            facility: 'Quality desk',
          }),
        ],
      }),
    }),
  ];
  const published = C.publishComponent(initial, 'plate', {
    label: 'A',
    author: 'Engineer',
  });
  const reused = C.useRevision(
    published.project,
    published.record.id,
    'root',
    2,
  );
  C.commit(reused.project, {
    version: '0.2.0',
    author: 'Engineer',
    message: 'Two independent placements',
  });
  C.validateProject(reused.project);
  return { p: reused.project, reusedId: reused.id };
}
function context(p, language = 'en') {
  const events = [];
  const ctx = {
    state: {
      projects: [p],
      projectId: p.id,
      batchId: null,
      lang: language,
      productionLimit: 100,
    },
    project: () =>
      ctx.state.projects.find((item) => item.id === ctx.state.projectId),
    t: (key) => translate(language, key),
    author: () => 'Quality engineer',
    titleRow: () => '<h1>Production</h1>',
    fmtDate: (date) => date,
    showModal: (title, html, form) => events.push({ title, html, form }),
    persist: async (candidate) => {
      events.push({ persist: candidate });
      return { persisted: true };
    },
    closeModal: () => events.push({ close: true }),
    render: () => events.push({ render: true }),
    success: (message) => events.push({ success: message }),
  };
  Object.assign(
    ctx,
    createComponents(ctx),
    createFormGuidance(ctx),
    createProductionView(ctx),
    createProductionDialogs(ctx),
  );
  return { ctx, events, controller: createProductionController(ctx) };
}
function batch(p, quantity = 1) {
  return C.createBatch(p, {
    name: 'MVP-001',
    mode: 'prototype',
    quantity,
    author: 'Planner',
  });
}
function submit(controller, form, values) {
  return controller.handleForm(
    { dataset: { form } },
    null,
    (name) => values[name] ?? '',
  );
}

test('production view renders independent placements and freezes its instructions across later project edits', () => {
  for (const language of ['en', 'ua']) {
    const { p, reusedId } = project();
    const order = batch(p);
    const { ctx } = context(p, language);
    ctx.state.batchId = 'unknown-order';
    C.working(p).components[0].name = 'Later project edit';
    const before = C.clone(p);
    const html = ctx.renderProduction();
    assert(html.includes('FIX.001 [1]'));
    assert(html.includes('FIX.001 [2]'));
    assert(html.includes(`data-component="${reusedId}"`));
    assert(html.includes('&lt;img src=x&gt;'));
    assert(html.includes('&lt;script&gt;check&lt;/script&gt;'));
    assert(!html.includes('<img src=x>'));
    assert(html.includes(translate(language, 'waitingPrerequisites')));
    assert(html.includes('MVP-001'));
    assert.equal(order.snapshot.components[0].name, 'Test fixture');
    assert.deepEqual(p, before);
    ctx.state.productionSearch = 'QUALITY DESK';
    ctx.state.productionLimit = 1;
    const filtered = ctx.renderProduction();
    assert(filtered.includes('production-more'));
    assert(!filtered.includes('data-operation="prepare"'));
    assert(filtered.includes(translate(language, 'operation_inspect')));
  }
});

test('production result dialogs distinguish placements and accept the complete remaining target above one million', () => {
  const { p, reusedId } = project(1000);
  const order = batch(p, 2000);
  C.recordResult(p, order.id, {
    componentId: 'plate',
    operationId: 'prepare',
    accepted: 100,
    rejected: 0,
    operator: 'Inspector',
    notes: '',
    evidencePath: '',
  });
  const { ctx, events } = context(p);
  for (const [component, label] of [
    ['plate', 'FIX.001 [1]'],
    [reusedId, 'FIX.001 [2]'],
  ]) {
    ctx.productionResultModal({
      dataset: { id: order.id, component, operation: 'prepare' },
    });
    const { html, form } = events.at(-1);
    assert.equal(form, 'production-result');
    assert(html.includes(label));
    assert(html.includes(`name="componentId" value="${component}"`));
    assert(html.includes('&lt;img src=x&gt;'));
    if (component === 'plate') {
      assert(html.includes('name="accepted" value="1999900"'));
      assert(html.includes('max="1999900"'));
    } else {
      assert(html.includes('name="accepted" value="4000"'));
      assert(html.includes('max="4000"'));
    }
  }
});

test('production controller creates and persists an isolated order and appends validated results', async () => {
  const { p } = project();
  const { ctx, events, controller } = context(p);
  const original = C.clone(p);
  assert(
    await submit(controller, 'production-batch', {
      name: 'MVP-001',
      mode: 'prototype',
      quantity: '2',
      author: 'Planner',
    }),
  );
  const issued = ctx.project();
  const order = issued.production[0];
  assert.notEqual(issued, p);
  assert.deepEqual(p, original);
  assert.equal(ctx.state.batchId, order.id);
  assert.equal(events.filter((event) => event.persist).length, 1);
  assert.equal(events.find((event) => event.persist).persist, issued);
  assert.equal(events.at(-1).success, translate('en', 'updated'));
  assert(
    await submit(controller, 'production-result', {
      batchId: order.id,
      componentId: 'plate',
      operationId: 'prepare',
      accepted: '1',
      rejected: '1',
      operator: 'Inspector',
      notes: 'One blank needs replacement',
      evidencePath: 'reports/MVP-001/inspection.csv',
    }),
  );
  assert.equal(issued.production[0].results.length, 0);
  const event = ctx.project().production[0].results[0];
  assert.equal(event.accepted, 1);
  assert.equal(event.rejected, 1);
  assert.equal(event.evidencePath, 'reports/MVP-001/inspection.csv');
  assert.equal(events.filter((entry) => entry.persist).length, 2);
  C.validateProject(ctx.project());
});

test('invalid production submissions preserve the project, selected order, and open dialog', async () => {
  const { p } = project();
  const order = batch(p);
  const before = C.clone(p);
  const { ctx, events, controller } = context(p);
  ctx.state.batchId = order.id;
  await assert.rejects(
    submit(controller, 'production-result', {
      batchId: order.id,
      componentId: 'plate',
      operationId: 'inspect',
      accepted: '1',
      rejected: '0',
      operator: 'Inspector',
    }),
    /prerequisite/,
  );
  await assert.rejects(
    submit(controller, 'production-batch', {
      name: 'MVP-001',
      mode: 'prototype',
      quantity: '1',
      author: 'Planner',
    }),
    /batch name/,
  );
  assert.equal(ctx.project(), p);
  assert.equal(ctx.state.batchId, order.id);
  assert.deepEqual(p, before);
  assert.deepEqual(events, []);
});

test('production controller delegates its dialogs, expands the view, and ignores unrelated commands', async () => {
  const { p } = project();
  const { ctx, events, controller } = context(p, 'ua');
  assert.equal(await controller.handleAction('unrelated'), false);
  assert.equal(await submit(controller, 'unrelated', {}), false);
  assert.equal(await controller.handleAction('new-batch'), true);
  assert.equal(events.at(-1).form, 'production-batch');
  assert(events.at(-1).html.includes(translate('ua', 'batchFrozenHint')));
  assert(events.at(-1).html.includes('role="tooltip"'));
  await controller.handleAction('production-more');
  assert.equal(ctx.state.productionLimit, 200);
  assert(events.at(-1).render);
});
