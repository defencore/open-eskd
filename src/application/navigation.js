import * as C from '../domain/index.js';

import { preference } from '../storage/preferences.js';

export function createNavigation(context) {
  const { state } = context;
  const render = (...args) => context.render(...args);
  const persist = (...args) => context.persist(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function navigate(view) {
    state.view = view;
    context.refreshFileCheck?.().then(() => {
      if (state.view === 'documents') render();
    });
    preference('eskd-view', view);
    state.search = '';
    state.filter = '';
    render();
    window.scrollTo({ top: 0 });
  }

  function selectProject(id) {
    state.projectId = id;
    state.selected = null;
    state.batchId = null;
    state.productionSearch = '';
    state.productionLimit = 100;
    state.collapsed.clear();
    preference('eskd-project', id);
    navigate('structure');
    state.selected =
      snapshot().components.find((c) => c.parentId === null)?.id || null;
    render();
  }

  async function switchBranch(name) {
    if (!C.own(project().branches, name)) return;
    project().activeBranch = name;
    state.selected = null;
    state.batchId = null;
    state.productionSearch = '';
    state.productionLimit = 100;
    state.collapsed.clear();
    state.search = '';
    await persist();
    render();
  }

  return { navigate, selectProject, switchBranch };
}
