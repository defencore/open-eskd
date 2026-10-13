import * as C from '../../domain/index.js';

import * as U from '../../application/project-tools.js';

export function createStructureForms(context) {
  const { state } = context;
  const success = (...args) => context.success(...args);

  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const componentModal = (...args) => context.componentModal(...args);
  const navigate = (...args) => context.navigate(...args);
  const persist = (...args) => context.persist(...args);
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);

  async function handleForm(form, data, get, submitter) {
    switch (form.dataset.form) {
      case 'component': {
        const p = project(),
          candidate = C.clone(p),
          s = C.working(candidate),
          id = get('id') || form.dataset.routeComponentId || C.uid();
        C.assertEditable(s, get('id') || null);
        C.assertEditable(s, get('parentId') || null);
        const original = s.components.find((c) => c.id === id);
        const c = C.component({
          ...original,
          definitionId: original?.definitionId || id,
          baseRevisionId: original?.baseRevisionId || null,
          id,
          parentId: get('parentId') || null,
          name: get('name'),
          designation: get('designation'),
          type: get('type'),
          quantity: Number(get('quantity')),
          unit: get('unit'),
          revision: get('revision'),
          status: get('status'),
          owner: get('owner'),
          material: get('material'),
          manufacturer: get('manufacturer'),
          process: get('process'),
          manufacturing: context.readManufacturing(form),
          notes: get('notes'),
          provenance: context.readProvenance(form),
        });
        const index = s.components.findIndex((x) => x.id === id);
        if (index >= 0) s.components[index] = c;
        else s.components.push(c);
        C.validateSnapshot(s, candidate.catalog);
        state.projects[state.projects.indexOf(p)] = candidate;
        state.selected = id;
        await persist(candidate);
        closeModal();
        navigate(
          form.dataset.returnView === 'manufacturing'
            ? 'manufacturing'
            : 'structure',
        );
        if (submitter?.name === 'addAnother')
          componentModal(null, {
            ...c,
            id: undefined,
            name: '',
            provenance: C.provenance(
              s.meta.workflow === 'decomposition' ? 'observed' : 'designed',
            ),
            designation: U.nextDesignation(s, c.parentId),
            quantity: 1,
            notes: '',
            manufacturing: C.manufacturing({
              technology: c.manufacturing.technology,
            }),
          });
        success(t('updated'));
        break;
      }
      case 'bulk': {
        const p = project(),
          candidate = U.addList(
            p,
            get('list'),
            get('parentId') || null,
            get('type'),
            state.author || snapshot().meta.owner,
          );
        state.projects[state.projects.indexOf(p)] = candidate;
        await persist(candidate);
        closeModal();
        navigate('structure');
        success(t('bulkAdded'));
        break;
      }
      case 'delete-component': {
        const p = project(),
          candidate = C.clone(p),
          s = C.working(candidate),
          ids = C.descendants(s, get('id'));
        C.assertEditable(s, get('id'), { remove: true });
        s.components = s.components.filter((c) => !ids.has(c.id));
        s.documents = s.documents.filter((d) => !ids.has(d.componentId));
        C.validateSnapshot(s, candidate.catalog);
        state.projects[state.projects.indexOf(p)] = candidate;
        state.selected = null;
        await persist(candidate);
        closeModal();
        render();
        success(t('deleted'));
        break;
      }

      default:
        return false;
    }
    return true;
  }

  return { handleForm };
}
