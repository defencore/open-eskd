import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContext, attachFeature } from '../src/bootstrap/context.js';
import { composeFeatures } from '../src/bootstrap/features.js';
import { createDispatchers } from '../src/bootstrap/commands.js';
import { createState } from '../src/application/state.js';
import { createProject, working } from '../src/domain/index.js';

test('application features compose without replacing existing capabilities and read current state', () => {
  const state = createState();
  const context = createContext(state);
  composeFeatures(context);
  for (const name of [
    'render',
    'renderExampleGuide',
    'renderProduction',
    'productionBatchModal',
    'navigate',
    'importFile',
  ])
    assert.equal(typeof context[name], 'function', name);
  const project = createProject({ name: 'Current project' });
  state.projects.push(project);
  state.projectId = project.id;
  assert.equal(context.snapshot(), working(project));
  state.lang = 'en';
  assert.equal(context.t('projects'), 'My projects');
  assert.throws(
    () => attachFeature(context, () => ({ render: () => '' })),
    /Duplicate application capability/,
  );
});

test('concurrent commands cannot mutate state while an earlier command is pending and failure unlocks it', async () => {
  const context = { state: { busy: false }, t: (key) => key, toast: () => {} };
  let release;
  let calls = 0;
  const commands = createDispatchers(context, {
    actions: [
      async () => {
        calls++;
        await new Promise((resolve) => {
          release = resolve;
        });
        throw new Error('Rejected command');
      },
    ],
    forms: [],
  });
  const pending = commands.action('save');
  assert.equal(await commands.action('save'), false);
  assert.equal(calls, 1);
  release();
  await assert.rejects(pending, /Rejected command/);
  assert.equal(context.state.busy, false);
});

test('form dispatch restores prior button state and reports parsing errors without locking the workspace', async () => {
  const buttons = [{ disabled: false }, { disabled: true }];
  let reported;
  const context = {
    state: { busy: false },
    t: (key) => key,
    toast: () => {},
    formError: (error) => {
      reported = error.message;
    },
  };
  const commands = createDispatchers(context, {
    actions: [],
    forms: [],
    readForm: () => {
      throw new Error('Unreadable form');
    },
  });
  assert.equal(
    await commands.submitForm({ querySelectorAll: () => buttons }),
    false,
  );
  assert.equal(reported, 'Unreadable form');
  assert.deepEqual(
    buttons.map((button) => button.disabled),
    [false, true],
  );
  assert.equal(context.state.busy, false);
});

test('invalid stored language names cannot resolve to inherited dictionary properties', () => {
  const previousStorage = globalThis.localStorage;
  try {
    for (const language of [
      'constructor',
      '__proto__',
      'toString',
      'missing',
    ]) {
      globalThis.localStorage = {
        getItem: (key) => (key === 'eskd-language' ? language : null),
      };
      assert.equal(createState().lang, 'ua');
    }
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
