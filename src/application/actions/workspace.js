import { preference } from '../../storage/preferences.js';

export function createWorkspaceActions(context) {
  const { state } = context;
  const showModal = (...args) => context.showModal(...args);
  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const projectFields = (...args) => context.projectFields(...args);
  const newProjectModal = (...args) => context.newProjectModal(...args);
  const confirmation = (...args) => context.confirmation(...args);
  const helpModal = (...args) => context.helpModal(...args);
  const navigate = (...args) => context.navigate(...args);
  const selectProject = (...args) => context.selectProject(...args);

  const snapshot = (...args) => context.snapshot(...args);
  async function handleAction(name, el) {
    const id = el?.dataset.id;
    switch (name) {
      case 'nav':
        navigate(el.dataset.view);
        break;
      case 'language':
        state.lang = el.dataset.lang;
        preference('eskd-language', state.lang);
        render();
        break;
      case 'menu': {
        const open = document
          .querySelector('.sidebar')
          .classList.toggle('open');
        document.querySelector('.mobile-shade').classList.toggle('show', open);
        document
          .querySelector('.mobile-menu')
          .setAttribute('aria-expanded', String(open));
        break;
      }
      case 'download-license': {
        const license = document.querySelector('#license-text');
        context.download(
          license.content.textContent,
          'open-eskd-license.txt',
          'text/plain;charset=utf-8',
        );
        context.toast(context.t('licenseDownloaded'));
        break;
      }
      case 'settings':
        navigate('settings');
        break;
      case 'structure':
        navigate('structure');
        break;
      case 'documents':
        navigate('documents');
        break;
      case 'help':
        helpModal();
        break;
      case 'history':
        navigate('history');
        break;
      case 'open-project':
        selectProject(id);
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'decompose-project':
        context.newProjectModal('decomposition');
        break;
      case 'new-project':
        newProjectModal();
        break;
      case 'edit-project':
        showModal(
          'editProject',
          projectFields(snapshot().meta),
          'project-meta',
        );
        break;
      case 'import':
        document.querySelector('#import-input').click();
        break;
      case 'delete-project':
        confirmation('deleteProject', 'deleteProjectText', 'delete-project');
        break;
      default:
        return false;
    }
    return true;
  }

  return { handleAction };
}
