import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';

export function createProductionDialogs(context) {
  const t = (...args) => context.t(...args);
  function productionBatchModal() {
    context.showModal(
      'newBatch',
      `<p class="modal-description">${esc(t('batchFrozenHint'))}</p>${context.guidedField('batchName', 'name', '', 'required maxlength="200"')}${context.guidedSelect(
        'batchMode',
        'mode',
        ['prototype', 'series'].map((value) => ({ value, label: t(value) })),
        'prototype',
      )}${context.guidedField('batchQuantity', 'quantity', 1, 'required min="1" max="1000000" step="1"', 'number')}${context.guidedField('batchAuthor', 'author', context.author(), 'required maxlength="200"')}`,
      'production-batch',
      'issueBatch',
    );
  }
  function productionResultModal(el) {
    const batch = context
      .project()
      .production.find((b) => b.id === el.dataset.id);
    const task = C.batchTasks(batch).find(
      (task) =>
        task.component.id === el.dataset.component &&
        task.step.id === el.dataset.operation,
    );
    const previous = C.taskResult(batch, task.key);
    const remaining = task.quantity - previous.accepted;
    context.showModal(
      'recordResult',
      `<input type="hidden" name="batchId" value="${esc(batch.id)}"><input type="hidden" name="componentId" value="${esc(task.component.id)}"><input type="hidden" name="operationId" value="${esc(task.step.id)}"><p>${esc(C.placementLabel(task.component, C.placementIndex(batch.snapshot)))} · ${esc(t('operation_' + task.step.operation))}</p><p>${esc(task.step.check || t('checkNotDefined'))}</p><p>${esc(t('remainingQuantity'))}: ${remaining} ${esc(task.component.unit)}</p><div class="form-grid">${context.guidedField('acceptedQuantity', 'accepted', remaining, `required min="0" max="${remaining}" step="any"`, 'number')}${context.guidedField('rejectedQuantity', 'rejected', 0, 'required min="0" max="1000000" step="any"', 'number')}</div>${context.guidedField('resultOperator', 'operator', context.author(), 'required maxlength="200"')}${context.guidedTextarea('resultNotes', 'notes', '', '', 'maxlength="2000"')}${context.guidedField('evidencePath', 'evidencePath', '', 'maxlength="800"')}`,
      'production-result',
    );
  }
  return { productionBatchModal, productionResultModal };
}
