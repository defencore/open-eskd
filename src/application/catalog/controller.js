import * as C from '../../domain/index.js';
import * as E from '../../files/index.js';
import { importCatalog } from './workspace.js';

export function createCatalogController(context) {
  const { state, t } = context;
  async function apply(candidate, selectedId = null) {
    const old = context.project();
    state.projects[state.projects.indexOf(old)] = candidate;
    if (selectedId) state.selected = selectedId;
    await context.persist(candidate);
    context.closeModal();
    context.navigate('structure');
    context.success(t('updated'));
  }
  async function handleAction(name, el) {
    const id = el?.dataset.id;
    switch (name) {
      case 'catalog-inspect-use':
        context.closeModal();
        context.selectProject(el.dataset.project);
        state.selected = id;
        context.render();
        break;
      case 'catalog-publish':
        context.publishModal(id);
        break;
      case 'catalog-details':
        context.catalogDetails(el.dataset.item);
        break;
      case 'catalog-use':
        context.useModal(el.dataset.revision, el.dataset.project);
        break;
      case 'catalog-checkout':
        context.checkoutModal(id);
        break;
      case 'catalog-update':
        context.updateModal(id);
        break;
      case 'catalog-more':
        state.catalogLimit += 200;
        context.render();
        break;
      case 'catalog-export': {
        const project = state.projects.find((p) => p.id === el.dataset.project),
          record = project.catalog[el.dataset.revision],
          root = record.snapshot.components.find((c) => c.parentId === null);
        context.download(
          await E.archive(C.componentPackage(project, record.id)),
          `${root.designation}_${record.label}_component.zip`,
        );
        context.toast(t('exported'));
        break;
      }
      case 'catalog-import-package': {
        const candidate = importCatalog(context.project(), state.pendingImport);
        await apply(candidate);
        context.navigate('catalog');
        break;
      }
      default:
        return false;
    }
    return true;
  }
  async function handleForm(form, data, get) {
    switch (form.dataset.form) {
      case 'catalog-publish': {
        const result = C.publishComponent(context.project(), get('id'), {
          label: get('label'),
          author: get('author'),
          message: get('message'),
          status: data.get('release') === 'on' ? 'released' : 'draft',
        });
        await apply(result.project, get('id'));
        break;
      }
      case 'catalog-use': {
        const incoming = state.projects.find((p) => p.id === get('sourceId'));
        const result = C.useRevision(
          importCatalog(context.project(), incoming, get('revisionId')),
          get('revisionId'),
          get('parentId') || null,
          Number(get('quantity')),
        );
        await apply(result.project, result.id);
        break;
      }
      case 'catalog-placement':
        await apply(
          C.configureOccurrence(
            context.project(),
            get('id'),
            get('parentId') || null,
            Number(get('quantity')),
          ),
          get('id'),
        );
        break;
      case 'catalog-checkout':
        await apply(
          C.checkoutComponent(context.project(), get('id')),
          get('id'),
        );
        break;
      case 'catalog-update': {
        const choice = JSON.parse(get('choice'));
        C.assert(
          Array.isArray(choice) &&
            choice.length === 2 &&
            choice.every(C.validId),
          'Choose a valid component revision.',
        );
        context.updateReview(get('id'), ...choice);
        break;
      }
      case 'catalog-apply-update':
        await apply(
          C.updateOccurrence(
            importCatalog(
              context.project(),
              state.projects.find((p) => p.id === get('sourceId')),
              get('revisionId'),
            ),
            get('id'),
            get('revisionId'),
          ),
          get('id'),
        );
        break;
      default:
        return false;
    }
    return true;
  }
  return { handleAction, handleForm };
}
