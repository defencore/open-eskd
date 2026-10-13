import { createProvenanceEditor } from '../src/ui/provenance-editor.js';
import { createRouteLinks } from '../src/ui/route-links.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createComponents } from '../src/ui/components.js';
import { createFormGuidance } from '../src/ui/form-guidance.js';
import { createFormPresets } from '../src/ui/form-presets.js';
import { createManufacturingEditor } from '../src/ui/manufacturing-editor.js';
import { createProjectDialogs } from '../src/ui/dialogs/project.js';
import { createComponentDialogs } from '../src/ui/dialogs/component.js';
import { translate } from '../src/i18n/index.js';
import { createProject } from '../src/application/create-project.js';
import { working, TYPES, STATUSES } from '../src/domain/index.js';

function fixture(lang) {
  let body = '';
  const project = createProject({
    name: 'Control unit',
    designation: 'PRJ.001.000',
  });
  const context = {
    t: (key) => translate(lang, key),
    state: { author: '', selected: null },
    snapshot: () => working(project),
    showModal: (_title, html) => {
      body = html;
    },
    modal: {
      querySelector: () => ({ dataset: {}, insertAdjacentHTML() {} }),
    },
  };
  Object.assign(
    context,
    createComponents(context),
    createFormGuidance(context),
    createFormPresets(context),
    createProvenanceEditor(context),
    createManufacturingEditor(context),
    createRouteLinks(context),
  );
  context.updateRouteEditor = () => {};
  Object.assign(
    context,
    createProjectDialogs(context),
    createComponentDialogs(context),
  );
  return { context, body: () => body };
}

function checkDescriptions(html, expectedCount) {
  const controls = [
    ...html.matchAll(/<(?:input|select|textarea)\b([^>]*)>/g),
  ].filter((match) => !match[1].includes('type="hidden"'));
  assert.equal(controls.length, expectedCount);
  const ids = new Set();
  for (const [, attributes] of controls) {
    const id = attributes.match(/aria-describedby="([^"]+)"/)?.[1];
    assert(id, `Missing description: ${attributes}`);
    assert(!ids.has(id), 'Each control needs its own description');
    ids.add(id);
    const content = html.match(
      new RegExp(
        `<div id="${id}"[^>]*role="tooltip" hidden[^>]*>([\\s\\S]*?)</div>`,
      ),
    )?.[1];
    assert(content, `Description ${id} must exist`);
    assert.equal([...content.matchAll(/<li\b/g)].length, 3);
    assert.match(html, new RegExp(`data-info-tooltip="${id}"`));
    assert(
      !/guide\w+(?:Help|Example|Rule)/.test(content),
      'Guidance must be translated',
    );
    assert(!content.includes('undefined'));
  }
  for (const [, label] of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g))
    assert(
      !label.includes('data-info-tooltip'),
      'Help buttons must not be nested inside control labels',
    );
}

test('every project creation field has hidden English and Ukrainian tooltips with multiple examples', () => {
  for (const lang of ['en', 'ua']) {
    const { context, body } = fixture(lang);
    context.newProjectModal();
    checkDescriptions(body(), 7);
    assert.match(body(), /name="name" value=""/);
    assert.match(body(), /name="designation" value=""/);
  }
});

test('component forms explain every field and every supported product type in both languages', () => {
  for (const lang of ['en', 'ua']) {
    const { context, body } = fixture(lang);
    for (const type of TYPES) {
      context.snapshot().components[0].type = type;
      context.componentModal(context.snapshot().components[0].id);
      checkDescriptions(body(), 20);
    }
    assert.match(
      context.guidedTextarea(
        'bulkInput',
        'list',
        '',
        '',
        'required data-bulk-input maxlength="5000000"',
      ),
      /maxlength="5000000"/,
    );
  }
});

test('guidance IDs remain unique when settings and a creation dialog coexist', () => {
  const { context, body } = fixture('en');
  const settings = context.projectFields();
  context.newProjectModal();
  checkDescriptions(settings + body(), 12);
});

test('status tooltips describe the selected readiness state using the dropdown labels', () => {
  for (const lang of ['en', 'ua']) {
    const { context } = fixture(lang);
    const contents = STATUSES.map((status) =>
      context.guidanceContent('status', status),
    );
    assert.equal(new Set(contents).size, STATUSES.length);
    for (let i = 0; i < STATUSES.length; i++) {
      assert(contents[i].includes(translate(lang, STATUSES[i])));
      assert(!/guide\w+(?:Help|Example|Rule)/.test(contents[i]));
      assert.equal([...contents[i].matchAll(/<li\b/g)].length, 3);
    }
  }
});

test('component name and material-unit examples follow the selected product type', () => {
  for (const lang of ['en', 'ua']) {
    const { context } = fixture(lang);
    const names = TYPES.map((type) =>
      context.guidanceContent('name', '', type),
    );
    assert.equal(new Set(names).size, TYPES.length);
    for (const name of names) assert(!/guide\w+Example/.test(name));
    assert.notEqual(
      context.guidanceContent('unit', '', 'material'),
      context.guidanceContent('unit', '', 'part'),
    );
    assert.notEqual(
      context.guidanceContent('rootType', 'deferred'),
      context.guidanceContent('rootType', 'part'),
    );
  }
});

test('field values and translated examples cannot inject markup, and examples do not become input values', () => {
  const context = { t: () => '<img src=x onerror=alert(1)>' };
  Object.assign(
    context,
    createComponents(context),
    createFormGuidance(context),
  );
  const html = context.guidedField(
    'projectName',
    'name',
    '" onfocus="alert(1)',
  );
  assert(!html.includes('<img'));
  assert.match(html, /&lt;img/);
  assert.match(html, /value="&quot; onfocus=&quot;alert\(1\)"/);
});
