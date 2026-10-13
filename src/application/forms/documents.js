import * as C from '../../domain/index.js';
export function createDocumentsForms(context) {
  const { state } = context;
  const success = (...args) => context.success(...args);

  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const persist = (...args) => context.persist(...args);
  const t = (...args) => context.t(...args);
  async function updateDocument(id, mutation) {
    const p = context.project(),
      candidate = C.clone(p),
      snapshot = C.working(candidate);
    const doc = snapshot.documents.find((d) => d.id === id);
    if (doc) C.assertEditable(snapshot, doc.componentId);
    mutation(snapshot, doc);
    C.validateSnapshot(snapshot, candidate.catalog);
    state.projects[state.projects.indexOf(p)] = candidate;
    await persist(candidate);
    closeModal();
    render();
  }
  async function handleForm(form, data, get, submitter) {
    switch (form.dataset.form) {
      case 'document': {
        await updateDocument(get('id'), (snapshot, existing) => {
          C.assertEditable(snapshot, get('componentId') || null);
          const path = get('path');
          const value = {
            id: existing?.id || C.uid(),
            componentId: get('componentId') || null,
            name: path.split('/').at(-1),
            path,
            kind: get('kind'),
            revision: get('revision'),
            sha256: get('sha256') || null,
            required: get('required') === 'true',
          };
          if (existing) Object.assign(existing, value);
          else snapshot.documents.push(value);
        });
        success(t('updated'));
        break;
      }
      case 'delete-document':
        await updateDocument(get('id'), (snapshot) => {
          snapshot.documents = snapshot.documents.filter(
            (d) => d.id !== get('id'),
          );
        });
        success(t('deleted'));
        break;

      default:
        return false;
    }
    return true;
  }

  return { handleForm };
}
