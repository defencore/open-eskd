import {
  routeLinkIndex,
  routeLinkLines,
} from '../domain/manufacturing-description.js';
import * as C from '../domain/index.js';
import * as E from '../files/index.js';
import { esc } from '../shared/html.js';

export function createProductionWorkspace(context) {
  const t = (...args) => context.t(...args);
  const state = context.state;
  const extra = (id) => `data-id="${esc(id)}"`;
  function renderProduction() {
    const p = context.project();
    const batch =
      p.production.find((batch) => batch.id === state.batchId) ||
      p.production.at(-1);
    return `${context.titleRow('production', context.button('newBatch', 'new-batch', 'plus', true))}<p class="hint">${esc(t('productionHint'))}</p>${
      p.production.length
        ? context.selectField(
            'productionBatch',
            'batchId',
            p.production.map((batch) => ({
              value: batch.id,
              label:
                batch.name + ' · ' + batch.version + ' · ' + batch.quantity,
            })),
            batch.id,
            'data-production-batch',
          ) + batchView(batch)
        : `<section class="panel">${context.empty('noBatches', 'noBatchesText')}</section>`
    }`;
  }
  function batchView(batch) {
    const progress = C.batchProgress(batch);
    const tasks = progress.tasks;
    const linkIndex = routeLinkIndex(batch.snapshot, t);
    const query = (state.productionSearch || '').toLowerCase();
    const filtered = tasks.filter((task) =>
      [
        task.component.name,
        task.component.designation,
        task.step.facility,
        task.component.manufacturer,
        t('operation_' + task.step.operation),
      ].some((value) => value.toLowerCase().includes(query)),
    );
    const facilities = [
      ...new Set(
        tasks.map(
          (task) => task.step.facility || task.component.manufacturer || '',
        ),
      ),
    ];
    const placements = C.placementIndex(batch.snapshot);
    const done = tasks.filter((task) => {
      const result = C.taskResult(batch, task.key, progress);
      return C.quantityAccepted(result.accepted, task.quantity);
    }).length;
    return `<section class="panel"><div class="panel-body"><h2>${esc(batch.name)}</h2><p>${esc(t(batch.mode))} · ${esc(t('batchQuantity'))}: ${batch.quantity} · ${esc(t('currentVersion'))}: ${esc(batch.version)} · ${esc(batch.branch)}</p><p>${done} / ${tasks.length} ${esc(t('operationsRecorded'))}</p><p class="note-text">${esc(t('batchSnapshotHint'))}</p><div class="title-actions">${context.button('batchReport', 'batch-report', 'file', false, extra(batch.id))}${facilities.map((facility) => context.button(t('facilityWorkOrder') + ' · ' + (facility || t('unassigned')), 'batch-report', 'download', false, `${extra(batch.id)} data-facility="${esc(facility)}"`)).join('')}</div></div></section><div class="workspace-toolbar"><label class="search"><input data-production-search value="${esc(state.productionSearch || '')}" placeholder="${esc(t('productionSearch'))}" aria-label="${esc(t('productionSearch'))}"></label><span>${filtered.length} ${esc(t('manufacturingTasks'))}</span></div><section class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('operation'))}</th><th>${esc(t('quantityToProcess'))}</th><th>${esc(t('acceptedQuantity'))}</th><th>${esc(t('rejectedQuantity'))}</th><th></th></tr></thead><tbody>${filtered
      .slice(0, state.productionLimit || 100)
      .map((task) => {
        const result = C.taskResult(batch, task.key, progress);
        const complete = C.quantityAccepted(result.accepted, task.quantity);
        let blocked;
        try {
          blocked = C.productionPrerequisites(batch, task, progress).some(
            (previous) =>
              !C.quantityAccepted(
                C.taskResult(batch, previous.key, progress).accepted,
                previous.quantity,
              ),
          );
        } catch {
          blocked = true;
        }
        return `<tr><td><strong>${task.sequence}. ${esc(t('operation_' + task.step.operation))}</strong><small class="component-sub">${esc(C.placementLabel(task.component, placements))} · ${esc(task.step.facility || task.component.manufacturer)}</small><details class="production-instruction"><summary>${esc(t('operationInstruction'))}</summary><p>${esc(task.step.instructions || t('notSet'))}</p><p>${esc(t('stock'))}: ${esc(task.component.manufacturing.stock || '—')}</p><p>${esc(t('preparation'))}: ${esc(task.component.manufacturing.preparation || '—')}</p><p>${esc(t('routeEquipment'))}: ${esc(task.step.equipment || '—')}</p><p>${esc(t('routeCheck'))}: ${esc(task.step.check || t('checkNotDefined'))}</p><ul>${routeLinkLines(
          task.step,
          linkIndex,
          t,
        )
          .map((line) => `<li>${esc(line)}</li>`)
          .join(
            '',
          )}</ul><p>${esc(t('routePrevious'))}: ${esc(C.prerequisiteLabels(task.prerequisites, placements, t).join('; ') || '—')}</p></details>${result.events.length ? `<details><summary>${esc(t('resultHistory'))}</summary>${result.events.map((event) => `<p>${esc(context.fmtDate(event.createdAt))} · ${esc(event.operator)} · +${event.accepted} / −${event.rejected}<br>${esc(event.notes)}${event.evidencePath ? `<br><code>${esc(event.evidencePath)}</code>` : ''}</p>`).join('')}</details>` : ''}</td><td>${task.quantity} ${esc(task.component.unit)}</td><td>${result.accepted}</td><td>${result.rejected}</td><td>${complete ? esc(t('operationComplete')) : blocked ? `<span class="muted">${esc(t('waitingPrerequisites'))}</span>` : context.button('recordResult', 'record-result', 'check', false, `${extra(batch.id)} data-component="${esc(task.component.id)}" data-operation="${esc(task.step.id)}"`)}</td></tr>`;
      })
      .join(
        '',
      )}</tbody></table></div>${filtered.length > (state.productionLimit || 100) ? `<div class="panel-footer">${context.button('productionMore', 'production-more')}</div>` : ''}</section>`;
  }
  function batchModal() {
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
  function resultModal(el) {
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
  async function handleProductionAction(name, el) {
    switch (name) {
      case 'production-more':
        state.productionLimit = (state.productionLimit || 100) + 100;
        context.render();
        break;
      case 'new-batch':
        batchModal();
        break;
      case 'record-result':
        resultModal(el);
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
  async function handleProductionForm(form, data, get) {
    if (!['production-batch', 'production-result'].includes(form.dataset.form))
      return false;
    const p = context.project(),
      candidate = C.clone(p);
    if (form.dataset.form === 'production-batch') {
      const batch = C.createBatch(candidate, {
        name: get('name'),
        mode: get('mode'),
        quantity: Number(get('quantity')),
        author: get('author'),
      });
      state.batchId = batch.id;
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
    await context.persist(candidate);
    context.closeModal();
    context.render();
    context.success(t('updated'));
    return true;
  }
  return { renderProduction, handleProductionAction, handleProductionForm };
}
