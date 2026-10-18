import { createState } from '../application/state.js';
import { createPersistence } from '../application/persistence.js';
import { availableView } from '../application/navigation.js';
import { openDatabase, ProjectStore } from '../storage/projects.js';
import { readPreference } from '../storage/preferences.js';
import { createContext, attachFeature } from './context.js';
import { composeFeatures } from './features.js';
import { createCommands } from './commands.js';

export async function start() {
  const state = createState();
  const context = createContext(state, {
    modal: document.querySelector('#modal'),
  });
  composeFeatures(context);
  let store;
  try {
    store = new ProjectStore(await openDatabase());
    const loaded = await store.load();
    state.projects = loaded.projects;
    state.rejected = loaded.rejected;
  } catch {
    state.storageMode = 'session';
    state.saveState = 'sessionOnly';
  }
  attachFeature(context, () => createPersistence(context, store));
  attachFeature(context, createCommands);
  const preferred = readPreference('eskd-project', null);
  state.projectId = state.projects.some((project) => project.id === preferred)
    ? preferred
    : state.projects[0]?.id || null;
  state.view = availableView(state.view, context.project());
  state.selected =
    context.snapshot().components.find((item) => item.parentId === null)?.id ||
    null;
  await context.refreshFileCheck();
  context.bindEvents();
  context.render();
  // The standalone build has no service worker or network-dependent resources.
  if (
    !__STANDALONE__ &&
    location.protocol !== 'file:' &&
    'serviceWorker' in navigator
  )
    navigator.serviceWorker
      .register('./sw.js?build=' + document.documentElement.dataset.build)
      .catch(() => {});
  return context;
}
