import * as C from '../../domain/index.js';

import * as U from '../../application/project-tools.js';

export function createStructureActions(context) {
  const { state } = context;
  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const confirmation = (...args) => context.confirmation(...args);
  const componentModal = (...args) => context.componentModal(...args);
  const bulkModal = (...args) => context.bulkModal(...args);
  const t = (...args) => context.t(...args);
  const snapshot = (...args) => context.snapshot(...args);

  async function handleAction(name, el) {
    const id = el?.dataset.id;
    switch (name) {
      case 'clear-filters':
        state.search = '';
        state.filter = '';
        render();
        break;
      case 'expand-all':
        state.collapsed.clear();
        render();
        break;
      case 'collapse-all':
        state.collapsed = new Set(
          snapshot()
            .components.filter((c) =>
              snapshot().components.some((child) => child.parentId === c.id),
            )
            .map((c) => c.id),
        );
        render();
        break;
      case 'bulk-add':
        bulkModal();
        break;
      case 'add-child':
        state.selected = id;
        componentModal();
        break;
      case 'add-assembly':
        componentModal(null, {
          name: '',
          designation: U.nextDesignation(snapshot(), null),
          type: 'assembly',
          parentId: null,
          quantity: 1,
          unit: 'pcs',
          revision: 'A',
          status: 'draft',
          owner: state.author || snapshot().meta.owner,
          material: '',
          manufacturer: '',
          process: '',
          notes: '',
          manufacturing: C.manufacturing({ technology: 'assembly' }),
        });
        break;
      case 'edit-production':
        componentModal(id, null, 'production');
        break;
      case 'add-component':
        componentModal();
        break;
      case 'edit-component':
        componentModal(id);
        break;
      case 'duplicate-component': {
        const original = snapshot().components.find((c) => c.id === id),
          copy = C.clone(original);
        copy.name += ' · ' + t('copySuffix');
        let n = 2;
        while (
          snapshot().components.some(
            (c) => c.designation === original.designation + '-' + n,
          )
        )
          n++;
        copy.designation += '-' + n;
        copy.status = 'draft';
        componentModal(null, copy);
        break;
      }
      case 'inspect-close':
        closeModal();
        context.inspectComponent(id);
        break;
      case 'inspect':
        context.inspectComponent(id);
        break;
      case 'back-to-structure':
        document
          .querySelector('.structure-layout')
          ?.scrollIntoView({ block: 'start' });
        break;
      case 'toggle-tree':
        state.collapsed.has(id)
          ? state.collapsed.delete(id)
          : state.collapsed.add(id);
        render();
        break;
      case 'delete-component':
        confirmation(
          'deleteComponent',
          'deleteComponentText',
          'delete-component',
          id,
        );
        break;

      default:
        return false;
    }
    return true;
  }

  return { handleAction };
}
