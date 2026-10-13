import { createProvenanceEditor } from './ui/provenance-editor.js';
import { createFileWorkspace } from './ui/file-workspace.js';
import { createProductionWorkspace } from './ui/production-workspace.js';
import { createCatalogView } from './ui/views/catalog.js';
import { createCatalogDialogs } from './ui/dialogs/catalog.js';
import { createCatalogController } from './application/catalog/controller.js';
import './styles/index.css';
import * as C from './domain/index.js';
import { createState } from './application/state.js';
import { createPersistence } from './application/persistence.js';
import { openDatabase, ProjectStore } from './storage/projects.js';
import { readPreference } from './storage/preferences.js';
import { translate } from './i18n/index.js';
import { demoProject } from './data/demo.js';
import { esc } from './shared/html.js';
import { createShell } from './ui/shell.js';
import { createEvents } from './ui/events.js';
import { createFeedback } from './ui/feedback.js';
import { createDialog } from './ui/dialog.js';
import { createComponents } from './ui/components.js';
import { createFormGuidance } from './ui/form-guidance.js';
import { createInfoTooltips } from './ui/info-tooltip.js';
import { createFormPresets } from './ui/form-presets.js';
import { createManufacturingEditor } from './ui/manufacturing-editor.js';
import { createRouteLinks } from './ui/route-links.js';
import { createOperationPlan } from './ui/operation-plan.js';
import { createManufacturingPlan } from './ui/manufacturing-plan.js';
import { createValueFormatting } from './ui/value-formatting.js';
import { createWorkflow } from './ui/workflow.js';
import { createDocumentsDialogs } from './ui/dialogs/documents.js';
import { createMergeDialogs } from './ui/dialogs/merge.js';
import { createComponentDialogs } from './ui/dialogs/component.js';
import { createProjectDialogs } from './ui/dialogs/project.js';
import { createRevisionDialogs } from './ui/dialogs/revision.js';
import { createDocumentsView } from './ui/views/documents.js';
import { createProjectsView } from './ui/views/projects.js';
import { createHistoryView } from './ui/views/history.js';
import { createOverviewView } from './ui/views/overview.js';
import { createStructureView } from './ui/views/structure.js';
import { createManufacturingView } from './ui/views/manufacturing.js';
import { createSettingsView } from './ui/views/settings.js';
import { createNavigation } from './application/navigation.js';
import { createExchange } from './application/exchange.js';
import { createDocumentsActions } from './application/actions/documents.js';
import { createExchangeActions } from './application/actions/exchange.js';
import { createWorkspaceActions } from './application/actions/workspace.js';
import { createHistoryActions } from './application/actions/history.js';
import { createStructureActions } from './application/actions/structure.js';
import { createDocumentsForms } from './application/forms/documents.js';
import { createHistoryForms } from './application/forms/history.js';
import { createProjectForms } from './application/forms/project.js';
import { createStructureForms } from './application/forms/structure.js';
import { createSettingsForms } from './application/forms/settings.js';

async function start() {
  const state = createState();
  const context = {
    state,
    reportError: (scope, error) =>
      console.error('Open ESKD ' + scope + ':', error.name, error.message),
    modal: document.querySelector('#modal'),
    demoProject,
    t: (key) => translate(state.lang, key),
    project: () => state.projects.find((p) => p.id === state.projectId),
    snapshot: () =>
      context.project()
        ? C.working(context.project())
        : { meta: {}, components: [], documents: [] },
    author: () => state.author || context.t('engineer'),
    fmtDate: (value) =>
      new Intl.DateTimeFormat(state.lang === 'ua' ? 'uk-UA' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value)),
    fmtSize: (size) =>
      size >= 1048576
        ? `${(size / 1048576).toFixed(1)} MB`
        : size >= 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${size} B`,
  };
  Object.assign(context, createCatalogView(context));
  Object.assign(context, createCatalogDialogs(context));
  Object.assign(context, createFileWorkspace(context));
  Object.assign(context, createProductionWorkspace(context));
  Object.assign(context, createShell(context));
  Object.assign(context, createEvents(context));
  Object.assign(context, createFeedback(context));
  Object.assign(context, createDialog(context));
  Object.assign(context, createComponents(context));
  Object.assign(context, createFormGuidance(context));
  Object.assign(context, createProvenanceEditor(context));
  Object.assign(context, createInfoTooltips(context));
  Object.assign(context, createFormPresets(context));
  Object.assign(context, createManufacturingEditor(context));
  Object.assign(context, createRouteLinks(context));
  Object.assign(context, createManufacturingPlan(context));
  Object.assign(context, createOperationPlan(context));
  Object.assign(context, createValueFormatting(context));
  Object.assign(context, createWorkflow(context));
  Object.assign(context, createDocumentsDialogs(context));
  Object.assign(context, createMergeDialogs(context));
  Object.assign(context, createComponentDialogs(context));
  Object.assign(context, createProjectDialogs(context));
  Object.assign(context, createRevisionDialogs(context));
  Object.assign(context, createDocumentsView(context));
  Object.assign(context, createProjectsView(context));
  Object.assign(context, createHistoryView(context));
  Object.assign(context, createOverviewView(context));
  Object.assign(context, createStructureView(context));
  Object.assign(context, createManufacturingView(context));
  Object.assign(context, createSettingsView(context));
  Object.assign(context, createNavigation(context));
  Object.assign(context, createExchange(context));

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
  Object.assign(context, createPersistence(context, store));
  const catalogController = createCatalogController(context);
  const actions = [
    context.handleFileAction,
    context.handleProductionAction,
    context.handleRouteAction,
    context.handleManufacturingAction,
    catalogController.handleAction,
    createDocumentsActions(context).handleAction,
    createExchangeActions(context).handleAction,
    createWorkspaceActions(context).handleAction,
    createHistoryActions(context).handleAction,
    createStructureActions(context).handleAction,
  ];
  const forms = [
    context.handleProductionForm,
    catalogController.handleForm,
    createDocumentsForms(context).handleForm,
    createHistoryForms(context).handleForm,
    createProjectForms(context).handleForm,
    createStructureForms(context).handleForm,
    createSettingsForms(context).handleForm,
  ];

  context.action = async (name, element) => {
    if (state.busy) {
      context.toast(context.t('busy'));
      return;
    }
    state.busy = true;
    try {
      if (name === 'recover-browser')
        return await context.recoverBrowserChanges();
      if (name === 'retry-save') {
        await context.persist();
        context.render();
        return;
      }
      if (name === 'recover-records') {
        context.download(
          JSON.stringify(state.rejected, null, 2),
          'open-eskd-recovery.json',
          'application/json',
        );
        return;
      }
      for (const handle of actions) if (await handle(name, element)) return;
    } finally {
      state.busy = false;
    }
  };
  context.submitForm = async (form, submitter) => {
    state.busy = true;
    const data = new FormData(form),
      get = (name) => String(data.get(name) || '').trim();
    const buttons = [...form.querySelectorAll('button[type=submit]')];
    buttons.forEach((button) => (button.disabled = true));
    try {
      for (const handle of forms)
        if (await handle(form, data, get, submitter)) return;
    } catch (error) {
      context.formError(error);
    } finally {
      state.busy = false;
      buttons.forEach((button) => (button.disabled = false));
    }
  };
  state.demoId = readPreference('eskd-demo', null);
  const preferred = readPreference('eskd-project', null);
  state.projectId = state.projects.some((p) => p.id === preferred)
    ? preferred
    : state.projects[0]?.id || null;
  if (
    !state.projectId ||
    ![
      'projects',
      'overview',
      'structure',
      'catalog',
      'documents',
      'history',
      'manufacturing',
      'production',
      'settings',
    ].includes(state.view)
  )
    state.view = 'projects';
  if (state.projectId)
    state.selected =
      context.snapshot().components.find((c) => c.parentId === null)?.id ||
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
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
start().catch((error) => {
  document.querySelector('#app').innerHTML =
    `<div class="boot">Open ESKD<span>${esc(error.message)}</span></div>`;
});
