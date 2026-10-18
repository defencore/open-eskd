import * as C from '../domain/index.js';

import { preference } from '../storage/preferences.js';
import { isExampleProject } from './example-project.js';

const projectViews = new Set([
  'overview',
  'structure',
  'catalog',
  'documents',
  'history',
  'manufacturing',
  'production',
]);

export function availableView(view, project) {
  if (view === 'projects' || view === 'settings') return view;
  if (!project) return 'projects';
  if (view === 'exampleGuide' && isExampleProject(project)) return view;
  return projectViews.has(view) ? view : 'structure';
}

export function createNavigation(context) {
  const { state } = context;
  const render = (...args) => context.render(...args);
  const persist = (...args) => context.persist(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function navigate(view) {
    state.view = availableView(view, project());
    context.refreshFileCheck?.().then(() => {
      if (state.view === 'documents') render();
    });
    preference('eskd-view', state.view);
    state.search = '';
    state.filter = '';
    render();
    window.scrollTo({ top: 0 });
  }

  function selectProject(id, view = 'structure') {
    if (!state.projects.some((project) => project.id === id)) return;
    state.projectId = id;
    state.selected = null;
    state.batchId = null;
    state.productionSearch = '';
    state.productionLimit = 100;
    state.collapsed.clear();
    preference('eskd-project', id);
    state.selected =
      snapshot().components.find((c) => c.parentId === null)?.id || null;
    navigate(view);
  }

  function inspectComponent(id) {
    state.selected = snapshot().components.some(
      (component) => component.id === id,
    )
      ? id
      : null;
    if (state.view !== 'structure') navigate('structure');
    else render();
    if (window.matchMedia('(max-width:760px)').matches)
      document.querySelector('.inspector')?.scrollIntoView({ block: 'start' });
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

  return { navigate, selectProject, inspectComponent, switchBranch };
}
