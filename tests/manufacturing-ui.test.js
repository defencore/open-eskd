import { createRouteLinks } from '../src/ui/route-links.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import { createComponents } from '../src/ui/components.js';
import { createFormGuidance } from '../src/ui/form-guidance.js';
import { createFormPresets } from '../src/ui/form-presets.js';
import { createManufacturingEditor } from '../src/ui/manufacturing-editor.js';
import { createManufacturingPlan } from '../src/ui/manufacturing-plan.js';
import { createStructureForms } from '../src/application/forms/structure.js';
import { translate } from '../src/i18n/index.js';

function context(lang = 'en') {
  const p = C.createProject({ name: 'Product', designation: 'P.000' });
  C.working(p).components = [
    C.component({
      id: 'root',
      name: 'Main assembly',
      designation: 'P.000',
      type: 'assembly',
      quantity: 2,
    }),
    C.component({
      id: 'child',
      parentId: 'root',
      name: 'Bracket',
      designation: 'P.001',
      quantity: 4,
      owner: 'Engineer A',
      manufacturer: 'Workshop A',
      manufacturing: C.manufacturing({
        technology: 'printing3d',
        stock: '<img src=x>',
        steps: C.routeTemplate('printing3d'),
      }),
    }),
  ];
  const ctx = {
    state: {
      author: 'Engineer B',
      manufacturingSearch: '',
      manufacturingLimit: 1,
      manufacturingMode: 'route',
      view: 'manufacturing',
    },
    snapshot: () => C.working(p),
    t: (key) => translate(lang, key),
  };
  Object.assign(
    ctx,
    createComponents(ctx),
    createFormGuidance(ctx),
    createFormPresets(ctx),
    createManufacturingEditor(ctx),
    createRouteLinks(ctx),
    createManufacturingPlan(ctx),
  );
  return { ctx, p };
}

test('the plan renders children first, escapes route content and paginates without losing the full configuration', () => {
  for (const lang of ['en', 'ua']) {
    const { ctx, p } = context(lang);
    const html = ctx.renderManufacturingPlan();
    assert(html.includes('P.001 · Bracket'));
    assert(!html.includes('P.000 · Main assembly'));
    assert(html.includes('manufacturing-more'));
    assert(html.includes('&lt;img'));
    assert(!html.includes('<img'));
    assert(html.includes('8 pcs'));
    assert.equal(C.working(p).components.length, 2);
    ctx.state.manufacturingSearch = 'Main assembly';
    const filtered = ctx.renderManufacturingPlan();
    assert(filtered.includes('P.000 · Main assembly'));
    assert(
      filtered.includes('P.001 · Bracket'),
      'A parent must still show its required children',
    );
    assert(
      filtered.includes('4 pcs'),
      'Assembly inputs are per parent, not the multiplied total',
    );
  }
});

test('plan search finds operation locations even when they differ from the component location', () => {
  const { ctx, p } = context();
  C.working(p).components[1].manufacturing.steps[1].facility =
    'External supplier';
  ctx.state.manufacturingSearch = 'EXTERNAL SUPPLIER';
  const html = ctx.renderManufacturingPlan();
  assert(html.includes('P.001 · Bracket'));
  assert(html.includes('External supplier'));
  assert(!html.includes('P.000 · Main assembly'));
});

test('the route editor reads current ordered form values, preserving step identities and user instructions', () => {
  const { ctx } = context();
  const inputs = {
    technology: 'printing3d',
    stock: ' PETG · amount from drawing ',
    preparation: ' Document A ',
  };
  const data = [
    C.operation({
      id: 'second',
      operation: 'inspect',
      instructions: ' Check dimensions ',
    }),
    C.operation({
      id: 'first',
      operation: 'printing3d',
      equipment: ' Printer A ',
    }),
  ];
  const form = {
    elements: { namedItem: (name) => ({ value: inputs[name] }) },
    querySelector: () => ({
      dataset: {
        routeExtensions: JSON.stringify({
          'org.example.route': { instructions: 'preserve' },
        }),
      },
    }),
    querySelectorAll: () =>
      data.map((step) => ({
        dataset: {
          id: step.id,
          stepExtensions: JSON.stringify({
            'org.example.operation': { sampleCount: 2 },
          }),
        },
        querySelectorAll: () => [],
        querySelector: (selector) => ({
          value: step[selector.match(/data-step-field=(\w+)/)[1]],
        }),
      })),
  };
  const route = ctx.readManufacturing(form);
  assert.deepEqual(
    route.steps.map((step) => step.id),
    ['second', 'first'],
  );
  assert.equal(route.steps[0].instructions, 'Check dimensions');
  assert.equal(route.steps[1].equipment, 'Printer A');
  assert.equal(route.stock, 'PETG · amount from drawing');
  assert.deepEqual(route.extensions, {
    'org.example.route': { instructions: 'preserve' },
  });
  assert.deepEqual(route.steps[0].extensions, {
    'org.example.operation': { sampleCount: 2 },
  });
  C.validateManufacturing(route);
});

test('suggestions reuse current project values and keep arbitrary engineering text editable and escaped', () => {
  const { ctx } = context();
  ctx.snapshot().components[1].manufacturer = '<unsafe location>';
  const owners = ctx.suggestedField('owner', 'owner');
  assert(
    owners.includes('value="Engineer A"') &&
      owners.includes('value="Engineer B"'),
  );
  const facility = ctx.suggestedField(
    'manufacturer',
    'manufacturer',
    'Custom workshop',
  );
  assert(facility.includes('value="Custom workshop"'));
  assert(facility.includes('&lt;unsafe location&gt;'));
  assert(!facility.includes('<unsafe location>'));
  const designation = ctx.suggestedField('projectDesignation', 'designation');
  assert(designation.includes('value="PRJ.001.000"'));
  assert(designation.includes('value="PRJ.001.000.000"'));
});

test('technology help follows the chosen template and operation help uses operation names rather than product types', () => {
  for (const lang of ['en', 'ua']) {
    const { ctx } = context(lang);
    const milling = ctx.guidanceContent('technology', 'milling');
    const printing = ctx.guidanceContent('technology', 'printing3d');
    assert.notEqual(milling, printing);
    assert(milling.includes(translate(lang, 'operation_deburr')));
    assert(printing.includes(translate(lang, 'operation_postProcess')));
    assert(
      ctx
        .guidanceContent('routeOperation', 'assembly')
        .includes(translate(lang, 'operation_assembly')),
    );
  }
});

test('saving manufacturing edits returns to the plan with the edited component selected', async () => {
  const { ctx, p } = context();
  const component = C.working(p).components[1];
  let destination;
  Object.assign(ctx, {
    state: { ...ctx.state, projects: [p] },
    project: () => ctx.state.projects[0],
    readManufacturing: () => C.clone(component.manufacturing),
    readProvenance: () => C.provenance(),
    persist: async () => {},
    closeModal() {},
    success() {},
    navigate: (view) => {
      destination = view;
    },
  });
  await createStructureForms(ctx).handleForm(
    { dataset: { form: 'component', returnView: 'manufacturing' } },
    null,
    (key) => String(component[key] ?? ''),
    null,
  );
  assert.equal(destination, 'manufacturing');
  assert.equal(ctx.state.selected, component.id);
  C.validateProject(ctx.state.projects[0]);
});

test('printing expands the complete filtered plan temporarily and restores the previous screen state', (t) => {
  const { ctx, p } = context(),
    original = C.clone(p);
  let cards = [{ open: false }];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { querySelectorAll: () => cards },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  });
  ctx.render = () => {
    cards = Array.from(
      { length: Math.min(ctx.state.manufacturingLimit, 2) },
      () => ({ open: false }),
    );
  };
  ctx.prepareManufacturingPrint();
  assert.equal(cards.length, 2);
  assert(cards.every((card) => card.open));
  ctx.prepareManufacturingPrint();
  ctx.restoreManufacturingPrint();
  assert.equal(ctx.state.manufacturingLimit, 1);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].open, false);
  assert.deepEqual(p, original);
});

test('printing the operations view includes every operation beyond the screen pagination ceiling', async (t) => {
  const { createOperationPlan } = await import('../src/ui/operation-plan.js');
  const { ctx, p } = context();
  ctx.state.manufacturingMode = 'operations';
  ctx.state.manufacturingLimit = 5;
  ctx.snapshot().components = Array.from({ length: 200 }, (_, index) =>
    C.component({
      id: 'large-' + index,
      name: 'Large part ' + index,
      designation: 'L.' + index,
      manufacturing: C.manufacturing({
        steps: Array.from({ length: 51 }, (_, step) =>
          C.operation({ id: 'step-' + step, operation: 'inspect' }),
        ),
      }),
    }),
  );
  Object.assign(ctx, createOperationPlan(ctx));
  let html = '';
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { querySelectorAll: () => [] },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else delete globalThis.document;
  });
  ctx.render = () => {
    html = ctx.renderOperationPlan();
  };
  ctx.prepareManufacturingPrint();
  assert.equal(
    [...html.matchAll(/class="panel production-card operation-card"/g)].length,
    10200,
  );
  ctx.restoreManufacturingPrint();
  assert.equal(
    [...html.matchAll(/class="panel production-card operation-card"/g)].length,
    5,
  );
  C.validateProject(p);
});
