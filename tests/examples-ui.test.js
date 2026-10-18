import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createComplexExample,
  COMPLEX_EXAMPLE_SECTIONS,
} from '../src/data/demo.js';
import { createContext } from '../src/bootstrap/context.js';
import { createState } from '../src/application/state.js';
import { composeFeatures } from '../src/bootstrap/features.js';
import { createExamplesController } from '../src/application/examples.js';
import {
  availableView,
  createNavigation,
} from '../src/application/navigation.js';
import { isExampleProject } from '../src/application/example-project.js';

test('the learning guide renders all destinations in both languages and tolerates deleted example elements', () => {
  for (const lang of ['en', 'ua']) {
    const state = createState();
    state.lang = lang;
    const project = createComplexExample(lang);
    state.projects = [project];
    state.projectId = project.id;
    const context = composeFeatures(createContext(state));
    let html = context.renderExampleGuide();
    for (const section of COMPLEX_EXAMPLE_SECTIONS) {
      assert(html.includes(`data-id="${section.id}"`));
      assert(!html.includes(section.titleKey));
      assert(!html.includes(section.descriptionKey));
    }
    assert(html.includes('data-view="production"'));
    assert(html.includes('data-view="history"'));
    context.snapshot().components = [];
    html = context.renderExampleGuide();
    assert(!html.includes('data-action="example-section"'));
  }
});

test('reopening the example preserves edits and imported example identity without a browser preference', async () => {
  const state = createState();
  state.lang = 'ua';
  const context = createContext(state);
  let creations = 0;
  let saves = 0;
  const selections = [];
  Object.assign(context, {
    persist: async () => {
      saves++;
    },
    selectProject: (...args) => {
      selections.push(args);
    },
  });
  const controller = createExamplesController(context, {
    createExample: async (lang) => {
      creations++;
      return createComplexExample(lang);
    },
  });
  await controller.handleAction('demo');
  state.projects[0].branches.main.working.meta.name = 'Edited example';
  await controller.handleAction('demo');
  assert.equal(creations, 1);
  assert.equal(saves, 1);
  assert.equal(
    state.projects[0].branches.main.working.meta.name,
    'Edited example',
  );
  assert.deepEqual(selections, [
    [state.projects[0].id, 'exampleGuide'],
    [state.projects[0].id, 'exampleGuide'],
  ]);
  assert(isExampleProject(state.projects[0]));
  assert.equal(
    availableView('exampleGuide', state.projects[0]),
    'exampleGuide',
  );
  assert.equal(availableView('exampleGuide', { extensions: {} }), 'structure');
  assert.equal(availableView('production', null), 'projects');
});

test('project selection resolves the root before its single navigation render', () => {
  const project = createComplexExample();
  const state = createState();
  state.projects = [project];
  const context = createContext(state);
  let rendered;
  let renders = 0;
  context.render = () => {
    rendered = state.selected;
    renders++;
  };
  const previousWindow = globalThis.window;
  globalThis.window = { scrollTo: () => {} };
  try {
    const navigation = createNavigation(context);
    navigation.selectProject(project.id, 'exampleGuide');
    assert.equal(rendered, 'system');
    assert.equal(renders, 1);
    assert.equal(state.view, 'exampleGuide');
    navigation.selectProject('missing');
    assert.equal(state.projectId, project.id);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('independently imported example copies remain selectable and rendering preserves workspace order', () => {
  const state = createState();
  state.lang = 'en';
  const first = createComplexExample();
  const second = createComplexExample();
  second.id = 'independent-example-copy';
  second.updatedAt = '2026-02-01T00:00:00.000Z';
  state.projects = [first, second];
  const context = composeFeatures(createContext(state));
  const html = context.renderProjects();
  for (const project of state.projects)
    assert(html.includes(`data-action="open-project" data-id="${project.id}"`));
  assert.deepEqual(
    state.projects.map((project) => project.id),
    [first.id, second.id],
  );
});

test('a guide section opens its selected inspector on narrow screens instead of leaving it below a long tree', async () => {
  const project = createComplexExample();
  const state = createState();
  state.projects = [project];
  state.projectId = project.id;
  state.view = 'exampleGuide';
  state.collapsed.add('system');
  const context = createContext(state);
  let selectedAtRender;
  let scrolled = false;
  context.render = () => {
    selectedAtRender = state.selected;
  };
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = {
    scrollTo: () => {},
    matchMedia: () => ({ matches: true }),
  };
  globalThis.document = {
    querySelector: () => ({
      scrollIntoView: () => {
        scrolled = true;
      },
    }),
  };
  try {
    Object.assign(context, createNavigation(context));
    const controller = createExamplesController(context);
    await controller.handleAction('example-section', {
      dataset: { id: 'software' },
    });
    assert.equal(selectedAtRender, 'flight-software');
    assert.equal(state.view, 'structure');
    assert.equal(state.collapsed.size, 0);
    assert(scrolled);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
