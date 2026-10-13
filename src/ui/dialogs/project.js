import * as C from '../../domain/index.js';
import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createProjectDialogs(context) {
  const { state } = context;
  const field = (...args) => context.suggestedField(...args);
  const selectField = (...args) => context.guidedSelect(...args);
  const textarea = (...args) => context.guidedTextarea(...args);
  const showModal = (...args) => context.showModal(...args);
  const t = (...args) => context.t(...args);

  function projectFields(meta = {}) {
    return `${field('projectName', 'name', meta.name || '', 'maxlength="200" required')}${field('projectDesignation', 'designation', meta.designation || '', 'maxlength="200"')}${selectField(
      'projectWorkflow',
      'workflow',
      C.WORKFLOWS.map((value) => ({ value, label: t('workflow_' + value) })),
      meta.workflow || 'design',
    )}${textarea('description', 'description', meta.description || '')}${field('projectOwner', 'owner', meta.owner || state.author, 'maxlength="200"')}`;
  }

  function newProjectModal(workflow = 'design') {
    showModal(
      workflow === 'decomposition' ? 'decomposeProject' : 'newProject',
      `<p class="modal-description">${esc(t(workflow === 'decomposition' ? 'decompositionDescription' : 'newProjectDescription'))}</p><p class="form-guide-intro">${esc(t('formGuideIntro'))}</p><div class="form-grid">${field('projectName', 'name', '', `maxlength="200" required placeholder="${esc(t('projectNamePlaceholder'))}"`)}${field('projectDesignation', 'designation', '', `maxlength="200" required placeholder="${esc(t('designationPlaceholder'))}"`)}</div>${selectField(
        'projectWorkflow',
        'workflow',
        C.WORKFLOWS.map((value) => ({ value, label: t('workflow_' + value) })),
        workflow,
      )}<div class="form-grid">${selectField(
        'rootType',
        'rootType',
        ['assembly', 'part', 'complex', 'set'].map((value) => ({
          value,
          label: t(value),
        })),
        'assembly',
      )}${context.rootCheckbox()}</div><details class="form-section"><summary>${esc(t('projectDetails'))}</summary>${field('projectOwner', 'owner', state.author, 'maxlength="200"')}${textarea('description', 'description')}</details>`,
      'new-project',
      'newProject',
    );
  }

  function confirmation(title, description, form, id = '') {
    showModal(
      title,
      `<p class="modal-description">${esc(t(description))}</p><input name="id" type="hidden" value="${esc(id)}">`,
      form,
      'confirmDelete',
    );
  }

  function helpModal() {
    showModal(
      'helpTitle',
      `<section class="help-section"><h3>${esc(t('helpNew'))}</h3><p>${esc(t('helpNewText')).replace(/\n/g, '<br>')}</p></section><section class="help-section"><h3>${esc(t('helpExisting'))}</h3><p>${esc(t('helpExistingText')).replace(/\n/g, '<br>')}</p></section><div class="hint">${icon('info')}<span>${esc(t('automaticSaveHint'))}</span></div>`,
    );
  }

  return { projectFields, newProjectModal, confirmation, helpModal };
}
