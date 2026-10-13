import * as C from '../../domain/index.js';

import * as U from '../../application/project-tools.js';

export function createProjectForms(context) {
  const { state, modal } = context;
  const success = (...args) => context.success(...args);
  const toast = (...args) => context.toast(...args);
  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const navigate = (...args) => context.navigate(...args);
  const selectProject = (...args) => context.selectProject(...args);
  const persist = (...args) => context.persist(...args);
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  async function handleForm(form, data, get, submitter) {
    switch (form.dataset.form) {
      case 'new-project': {
        const p = U.createProject(
          {
            name: get('name'),
            designation: get('designation'),
            description: get('description'),
            owner: get('owner'),
            workflow: get('workflow') || 'design',
          },
          data.get('createRoot') === 'on',
          get('rootType') || 'assembly',
        );
        C.validateProject(p);
        state.projects.push(p);
        await persist(p);
        closeModal();
        selectProject(p.id);
        success(
          t(
            C.working(p).components[0]?.type === 'part'
              ? 'partProjectCreated'
              : C.working(p).components.length
                ? 'projectCreated'
                : 'projectCreatedEmpty',
          ),
        );
        break;
      }
      case 'project-meta': {
        const p = project(),
          candidate = C.clone(p);
        C.working(candidate).meta = {
          ...C.working(candidate).meta,
          name: get('name'),
          designation: get('designation'),
          description: get('description'),
          owner: get('owner'),
          workflow:
            get('workflow') || C.working(candidate).meta.workflow || 'design',
        };
        C.validateProject(candidate);
        state.projects[state.projects.indexOf(p)] = candidate;
        await persist(candidate);
        if (modal.open) closeModal();
        render();
        success(t('savedSettings'));
        break;
      }
      case 'delete-project': {
        const id = project().id;
        await context.removeProject(id);
        state.projects = state.projects.filter((p) => p.id !== id);
        state.projectId = state.projects[0]?.id || null;
        closeModal();
        navigate('projects');
        toast(t('projectDeleted'));
        break;
      }
      default:
        return false;
    }
    return true;
  }

  return { handleForm };
}
