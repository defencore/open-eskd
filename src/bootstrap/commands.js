import { createCatalogController } from '../application/catalog/controller.js';
import { createProductionController } from '../application/production.js';
import { createExamplesController } from '../application/examples.js';
import { createDocumentsActions } from '../application/actions/documents.js';
import { createExchangeActions } from '../application/actions/exchange.js';
import { createWorkspaceActions } from '../application/actions/workspace.js';
import { createHistoryActions } from '../application/actions/history.js';
import { createStructureActions } from '../application/actions/structure.js';
import { createDocumentsForms } from '../application/forms/documents.js';
import { createHistoryForms } from '../application/forms/history.js';
import { createProjectForms } from '../application/forms/project.js';
import { createStructureForms } from '../application/forms/structure.js';
import { createSettingsForms } from '../application/forms/settings.js';

export function createDispatchers(
  context,
  { actions, forms, readForm = (form) => new FormData(form) },
) {
  const { state } = context;
  function acquire() {
    if (state.busy) {
      context.toast(context.t('busy'));
      return false;
    }
    state.busy = true;
    return true;
  }
  async function action(name, element) {
    if (!acquire()) return false;
    try {
      if (name === 'recover-browser') {
        await context.recoverBrowserChanges();
        return true;
      }
      if (name === 'retry-save') {
        await context.persist();
        context.render();
        return true;
      }
      if (name === 'recover-records') {
        context.download(
          JSON.stringify(state.rejected, null, 2),
          'open-eskd-recovery.json',
          'application/json',
        );
        return true;
      }
      for (const handle of actions)
        if (await handle(name, element)) return true;
      return false;
    } finally {
      state.busy = false;
    }
  }
  async function submitForm(form, submitter) {
    if (!acquire()) return false;
    let buttons = [];
    try {
      buttons = [...form.querySelectorAll('button[type=submit]')].map(
        (button) => ({ button, disabled: button.disabled }),
      );
      buttons.forEach(({ button }) => (button.disabled = true));
      const data = readForm(form);
      const get = (name) => String(data.get(name) || '').trim();
      for (const handle of forms)
        if (await handle(form, data, get, submitter)) return true;
      return false;
    } catch (error) {
      context.formError(error);
      return false;
    } finally {
      state.busy = false;
      buttons.forEach(({ button, disabled }) => (button.disabled = disabled));
    }
  }
  return { action, submitForm };
}

export function createCommands(context) {
  const catalog = createCatalogController(context);
  const production = createProductionController(context);
  return createDispatchers(context, {
    actions: [
      context.handleFileAction,
      production.handleAction,
      context.handleRouteAction,
      context.handleManufacturingAction,
      catalog.handleAction,
      createExamplesController(context).handleAction,
      createDocumentsActions(context).handleAction,
      createExchangeActions(context).handleAction,
      createWorkspaceActions(context).handleAction,
      createHistoryActions(context).handleAction,
      createStructureActions(context).handleAction,
    ],
    forms: [
      production.handleForm,
      catalog.handleForm,
      createDocumentsForms(context).handleForm,
      createHistoryForms(context).handleForm,
      createProjectForms(context).handleForm,
      createStructureForms(context).handleForm,
      createSettingsForms(context).handleForm,
    ],
  });
}
