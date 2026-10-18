import * as C from '../domain/index.js';
import * as E from '../files/index.js';

export function createProductionController(context) {
  const t = (...args) => context.t(...args);
  const state = context.state;
  async function handleAction(name, el) {
    switch (name) {
      case 'production-more':
        state.productionLimit = (state.productionLimit || 100) + 100;
        context.render();
        break;
      case 'new-batch':
        context.productionBatchModal();
        break;
      case 'record-result':
        context.productionResultModal(el);
        break;
      case 'batch-report': {
        const batch = context
          .project()
          .production.find((b) => b.id === el.dataset.id);
        context.download(
          await E.projectReport(
            context.project(),
            state.lang,
            batch,
            Object.hasOwn(el.dataset, 'facility') ? el.dataset.facility : null,
          ),
          'work-order_' +
            E.safeName(batch.name) +
            (Object.hasOwn(el.dataset, 'facility')
              ? '_' + E.safeName(el.dataset.facility || 'unassigned')
              : '') +
            '.html',
          'text/html;charset=utf-8',
        );
        break;
      }
      default:
        return false;
    }
    return true;
  }
  async function handleForm(form, data, get) {
    if (!['production-batch', 'production-result'].includes(form.dataset.form))
      return false;
    const p = context.project(),
      candidate = C.clone(p);
    let batchId = state.batchId;
    if (form.dataset.form === 'production-batch') {
      const batch = C.createBatch(candidate, {
        name: get('name'),
        mode: get('mode'),
        quantity: Number(get('quantity')),
        author: get('author'),
      });
      batchId = batch.id;
    } else
      C.recordResult(candidate, get('batchId'), {
        componentId: get('componentId'),
        operationId: get('operationId'),
        accepted: Number(get('accepted')),
        rejected: Number(get('rejected')),
        operator: get('operator'),
        notes: get('notes'),
        evidencePath: get('evidencePath'),
      });
    C.validateProject(candidate);
    state.projects[state.projects.indexOf(p)] = candidate;
    state.batchId = batchId;
    await context.persist(candidate);
    context.closeModal();
    context.render();
    context.success(t('updated'));
    return true;
  }
  return { handleAction, handleForm };
}
