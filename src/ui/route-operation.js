import { manufacturingIssues, operationKey } from '../domain/index.js';
import { esc } from '../shared/html.js';
import { routeLinkIndex } from '../domain/manufacturing-description.js';
import { routeLinksHTML } from './route-link-display.js';

export function operationDisplay(snapshot, t) {
  const changed = new Set(
    manufacturingIssues(snapshot).map((issue) =>
      operationKey(issue.componentId, issue.operationId),
    ),
  );
  const index = routeLinkIndex(snapshot, t);
  const lines = (value) => esc(value).replace(/\n/g, '<br>');
  const detail = (label, value) =>
    `<div><dt>${esc(t(label))}</dt><dd>${value ? lines(value) : `<span class="muted">${esc(t('notSet'))}</span>`}</dd></div>`;
  return (step, c) =>
    `${changed.has(operationKey(c.id, step.id)) ? `<p class="reference-changed">${esc(t('routeReferencesChanged'))}</p>` : ''}${step.instructions ? `<p>${lines(step.instructions)}</p>` : `<p class="note-text">${esc(t('operationInstructionsMissing'))}</p>`}<dl>${detail('routeInputs', step.inputs)}${detail('routeEquipment', step.equipment)}${detail('routeFacility', step.facility || c.manufacturer)}${detail('routeCheck', step.check)}</dl>${routeLinksHTML(step, index, t)}`;
}
