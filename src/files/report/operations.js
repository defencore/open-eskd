import { taskResult } from '../../domain/production-plan.js';
import { placementLabel, prerequisiteLabels } from '../../domain/placements.js';
import { relativeFileUrl } from '../../domain/file-paths.js';
import { routeLinkLines } from '../../domain/manufacturing-description.js';
import { esc } from '../../shared/html.js';
import { reportFields } from './documents.js';

function reportResult(result, t) {
  if (!result) return '';
  return `<p>${esc(t('acceptedQuantity'))}: ${result.accepted} · ${esc(t('rejectedQuantity'))}: ${result.rejected}</p>${result.events.map((event) => `<p>${esc(event.createdAt)} · ${esc(event.operator)} · +${event.accepted} / −${event.rejected}<br>${esc(event.notes)}${event.evidencePath ? `<br><a href="${esc(relativeFileUrl(event.evidencePath))}">${esc(event.evidencePath)}</a>` : ''}</p>`).join('')}`;
}

export function reportOperations({ tasks, batch, progress, t, index }) {
  return tasks
    .map((task) => {
      const result = batch ? taskResult(batch, task.key, progress) : null;
      return `<article><h3>${task.sequence}. ${esc(placementLabel(task.component, index.placements, false))} · ${esc(t('operation_' + task.step.operation))}</h3><p>${esc(t('quantityToProcess'))}: ${task.quantity} ${esc(task.component.unit)} · ${esc(task.step.facility || task.component.manufacturer || t('unassigned'))}</p><p>${esc(t('routePrevious'))}: ${esc(prerequisiteLabels(task.prerequisites, index.placements, t).join('; ') || '—')}</p>${reportFields(
        [
          ['routeInstructions', task.step.instructions],
          ['routeInputs', task.step.inputs],
          ['routeEquipment', task.step.equipment],
          ['routeCheck', task.step.check],
        ],
        t,
      )}<ul>${routeLinkLines(task.step, index, t, true)
        .map((line) => `<li>${esc(line)}</li>`)
        .join('')}</ul>${reportResult(result, t)}</article>`;
    })
    .join('');
}
