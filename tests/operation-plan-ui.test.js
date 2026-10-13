import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as C from '../src/domain/index.js';
import { createComponents } from '../src/ui/components.js';
import { createFormGuidance } from '../src/ui/form-guidance.js';
import { createFormPresets } from '../src/ui/form-presets.js';
import { createManufacturingEditor } from '../src/ui/manufacturing-editor.js';
import { createManufacturingPlan } from '../src/ui/manufacturing-plan.js';
import { createOperationPlan } from '../src/ui/operation-plan.js';
import { createRouteLinks } from '../src/ui/route-links.js';
import { createValueFormatting } from '../src/ui/value-formatting.js';
import { createManufacturingView } from '../src/ui/views/manufacturing.js';
import { translate } from '../src/i18n/index.js';

const example = JSON.parse(
  await readFile(
    new URL('../examples/staged-assembly.json', import.meta.url),
    'utf8',
  ),
);

function context(lang = 'en') {
  const p = C.clone(example);
  const ctx = {
    state: {
      manufacturingSearch: '',
      manufacturingLimit: 1000,
      manufacturingMode: 'operations',
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
    createManufacturingPlan(ctx),
    createOperationPlan(ctx),
    createRouteLinks(ctx),
    createValueFormatting(ctx),
  );
  return { ctx, p };
}

test('the shipped example renders the full operation order and readable prerequisites in both languages', () => {
  C.validateProject(example);
  for (const lang of ['en', 'ua']) {
    const { ctx } = context(lang),
      html = ctx.renderOperationPlan();
    const operationIds = [...html.matchAll(/data-operation-id="([^"]*)"/g)].map(
      (match) => match[1],
    );
    const pos = (id) => operationIds.indexOf(id);
    assert(pos('demo-insert-operation-1') < pos('demo-piston-operation-1'));
    assert(pos('demo-piston-operation-3') < pos('demo-insert-operation-2'));
    assert(html.includes(translate(lang, 'routeUsage_reference')));
    assert(html.includes('MECH.001.100.002'));
    assert(html.includes('staged-assembly-demo.txt'));
    assert(!html.includes('undefined'));
    assert(!html.includes('[object Object]'));
  }
});

test('operation search and pagination preserve the plan and can find a specific operation at a separate facility', () => {
  const { ctx } = context();
  ctx.state.manufacturingLimit = 2;
  const html = ctx.renderOperationPlan();
  assert.equal([...html.matchAll(/data-operation-id=/g)].length, 2);
  assert(html.includes('manufacturing-more'));
  ctx.snapshot().components[1].manufacturing.steps[0].facility =
    'External installation workshop';
  ctx.state.manufacturingSearch = 'EXTERNAL INSTALLATION';
  const filtered = ctx.renderOperationPlan();
  assert.equal([...filtered.matchAll(/data-operation-id=/g)].length, 1);
  assert(filtered.includes('Press fitting'));
  assert(!filtered.includes('manufacturing-more'));
});

test('returning to the operation order expands the selected component rather than an unrelated first task', () => {
  const { ctx } = context();
  ctx.state.selected = 'demo-piston';
  const html = ctx.renderOperationPlan();
  const open = [
    ...html.matchAll(/<details[^>]*data-operation-id="([^"]*)" open>/g),
  ].map((match) => match[1]);
  assert.deepEqual(open, ['demo-piston-operation-1']);
});

test('components without a route are shown separately and are not counted as manufacturing operations', () => {
  const { ctx } = context();
  ctx.snapshot().components.push(
    C.component({
      id: 'unplanned',
      name: 'Additional part',
      designation: 'MECH.OTHER',
    }),
  );
  const html = ctx.renderOperationPlan();
  assert(html.includes('Operations: 20'));
  assert(html.includes('Components without a route: 1'));
  assert(html.includes('No operations defined.'));
});

test('changed revisions are shown on affected operations and comparisons include controlled input and document identities', () => {
  const { ctx, p } = context('ua'),
    s = C.working(p);
  s.components.find((c) => c.id === 'demo-tube').revision = 'B';
  const html = ctx.renderOperationPlan();
  assert(html.includes(translate('ua', 'routeReferencesChanged')));
  const text = ctx.formatFieldValue(
    'manufacturing',
    s.components.find((c) => c.id === 'demo-insert').manufacturing,
  );
  assert(text.includes('MECH.001.100.002'));
  assert(text.includes('staged-assembly-demo.txt'));
  assert(text.includes('SHA-256'));
});

test('operation content and selected component names cannot inject markup', () => {
  const { ctx } = context();
  const s = ctx.snapshot(),
    tube = s.components.find((c) => c.id === 'demo-tube');
  tube.name = '<img src=x onerror=alert(1)>';
  tube.manufacturing.steps[0].instructions = '<script>bad()</script>';
  const html = ctx.renderOperationPlan();
  assert(!html.includes('<img'));
  assert(!html.includes('<script>'));
  assert(html.includes('&lt;img'));
  assert(html.includes('&lt;script&gt;'));
});

test('new link controls have hidden help with three examples and each added operation has contextual guidance', () => {
  for (const lang of ['en', 'ua']) {
    const { ctx } = context(lang),
      step = C.clone(ctx.snapshot().components[1].manufacturing.steps[0]);
    step.dependsOn = [
      { componentId: 'demo-tube', operationId: 'demo-tube-operation-3' },
    ];
    const html = ctx.routeLinks(step);
    const controls = [...html.matchAll(/<(?:input|select)\b([^>]*)>/g)];
    assert.equal(controls.length, 9);
    for (const [, attributes] of controls) {
      const id = attributes.match(/aria-describedby="([^"]+)"/)?.[1];
      assert(id);
      const tooltip = html.match(
        new RegExp(
          `<div id="${id}"[^>]*role="tooltip" hidden[^>]*>([\\s\\S]*?)</div>`,
        ),
      )?.[1];
      assert(tooltip);
      assert.equal([...tooltip.matchAll(/<li\b/g)].length, 3);
      assert(!/guide\w+(?:Help|Example|Rule)/.test(tooltip));
    }
    for (const operation of ['drilling', 'pressFit', 'fitting', 'fastening']) {
      const guidance = ctx.guidanceContent('routeOperation', operation);
      assert(guidance.includes(translate(lang, 'operation_' + operation)));
      assert(
        guidance.includes(
          translate(
            lang,
            'guideOperation' +
              operation[0].toUpperCase() +
              operation.slice(1) +
              'Example',
          ),
        ),
      );
    }
  }
});

test('the link reader retains captured revisions while reading current selection, quantities and use from the form', () => {
  const { ctx } = context();
  const row = {
    querySelectorAll: (selector) =>
      ({
        '[data-route-link=dependency]': [
          {
            dataset: { revision: 'A', catalogRevision: '' },
            querySelector: (field) => ({
              value:
                field === '[data-ref-component]'
                  ? 'demo-insert'
                  : 'demo-insert-operation-1',
            }),
          },
        ],
        '[data-route-link=input]': [
          {
            dataset: { revision: 'A', catalogRevision: '' },
            querySelector: (field) => ({
              value: {
                '[data-ref-component]': 'demo-tube',
                '[data-ref-quantity]': '2',
                '[data-ref-usage]': 'reference',
              }[field],
            }),
          },
        ],
        '[data-route-link=document]': [
          {
            dataset: {
              revision: 'A',
              path: 'documents/drawing.pdf',
              sha256: 'a'.repeat(64),
            },
            querySelector: () => ({ value: 'drawing' }),
          },
        ],
      })[selector],
  };
  const links = ctx.readRouteLinks(row);
  assert.deepEqual(links.dependsOn, [
    {
      componentId: 'demo-insert',
      operationId: 'demo-insert-operation-1',
      revision: 'A',
      catalogRevisionId: null,
    },
  ]);
  assert.deepEqual(links.componentInputs, [
    {
      componentId: 'demo-tube',
      revision: 'A',
      catalogRevisionId: null,
      quantity: 2,
      usage: 'reference',
    },
  ]);
  assert.equal(links.documents[0].sha256, 'a'.repeat(64));
});

test('facility worklists show external prerequisites, controlled-document links and stale-reference warnings', () => {
  const { ctx } = context();
  ctx.titleRow = () => '';
  Object.assign(ctx, createManufacturingView(ctx));
  ctx.state.manufacturingMode = 'facilities';
  const s = ctx.snapshot(),
    piston = s.components.find((c) => c.id === 'demo-piston');
  piston.manufacturing.steps[0].documents = [
    C.documentReference(s.documents[0]),
  ];
  s.documents[0].revision = 'B';
  const html = ctx.renderManufacturing();
  const row = html.match(
    /<tr[^>]*data-operation-id="demo-piston-operation-1"[^>]*>([\s\S]*?)<\/tr>/,
  )[1];
  assert(row.includes('MECH.001.100.000 · 1. Press fitting'));
  assert(row.includes('Plan step 14'));
  assert(row.includes('Operation links need review'));
  assert(
    row.includes('<td class="mobile-hide">1</td>'),
    'An operation document must be counted even when attached to another component',
  );
});

test('repeated placements and repeated document names have distinct labels without changing their identities', () => {
  const { p } = context();
  const published = C.publishComponent(p, 'demo-product', {
    label: 'A',
    author: 'Engineer',
  });
  const reused = C.useRevision(published.project, published.record.id);
  const s = C.working(reused.project),
    placements = C.placementIndex(s),
    tubes = s.components.filter((c) => c.definitionId === 'demo-tube');
  const labels = tubes.map((c) => C.placementLabel(c, placements));
  assert.notEqual(labels[0], labels[1]);
  assert(labels[0].includes('MECH.001.000.000 [1]'));
  assert(labels[1].includes('MECH.001.000.000 [2]'));
  const docLabels = C.documentLabels(s, placements, 'Project');
  assert.equal(new Set(docLabels.values()).size, s.documents.length);
  assert(
    s.components
      .filter((c) => c.definitionId === 'demo-tube')
      .every((c) => c.designation === 'MECH.001.100.002'),
  );
});
