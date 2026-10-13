import * as C from '../../domain/index.js';
import { icon } from '../icons.js';
import { esc } from '../../shared/html.js';

export function createManufacturingView(context) {
  const t = (...args) => context.t(...args);
  const button = (...args) => context.button(...args);

  function facilityTables(snapshot, groups) {
    const placements = C.placementIndex(snapshot);
    const changed = new Set(
      C.manufacturingIssues(snapshot).map((issue) =>
        C.operationKey(issue.componentId, issue.operationId),
      ),
    );
    const docsByComponent = new Map();
    for (const doc of snapshot.documents) {
      if (!docsByComponent.has(doc.componentId))
        docsByComponent.set(doc.componentId, new Set());
      docsByComponent.get(doc.componentId).add(doc.id);
    }
    return (
      [...groups.entries()]
        .map(
          ([facility, tasks]) =>
            `<section class="panel manufacturing-facility"><div class="panel-header facility-header">${icon('factory')}<h2>${esc(facility || t('unassigned'))}</h2><small>${tasks.length} ${esc(t('manufacturingTasks'))}</small></div><div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('component'))}</th><th class="mobile-hide">${esc(t('material'))}</th><th class="numeric">${esc(t('quantityToProcess'))}</th><th class="mobile-hide">${esc(t('productionDocs'))}</th><th>${esc(t('status'))}</th></tr></thead><tbody>${tasks.map(({ component: c, step, index, quantity, sequence, stage, prerequisites }) => `<tr class="clickable" tabindex="0" data-action="inspect" data-id="${esc(c.id)}" data-operation-id="${esc(step?.id || '')}"><td><span class="component-name">${esc(c.name)}</span><span class="component-sub">${esc(C.placementLabel(c, placements, false))} · ${esc(t('revision'))} ${esc(c.revision)}</span><span class="component-sub">${step ? `${index + 1}. ${esc(t('operation_' + step.operation))}` : esc(c.process || t('routeNotDefined'))}</span>${step ? `<span class="component-sub">${esc(t('routeTaskNumber'))} ${sequence} · ${esc(t('routeStage'))} ${stage}</span>` : ''}${prerequisites.length ? `<span class="component-sub">${esc(t('routePrevious'))}: ${C.prerequisiteLabels(prerequisites, placements, t).slice(0, 3).map(esc).join('; ')}${prerequisites.length > 3 ? ' · +' + (prerequisites.length - 3) : ''}</span>` : ''}</td><td class="mobile-hide muted">${esc(c.material || '—')}</td><td class="numeric nowrap">${quantity} ${esc(c.unit)}</td><td class="mobile-hide">${new Set([...(docsByComponent.get(c.id) || []), ...(step?.documents.map((ref) => ref.documentId) || [])]).size}</td><td>${context.badge(c.status)}${step && changed.has(C.operationKey(c.id, step.id)) ? `<span class="component-sub reference-changed">${esc(t('routeChecksTitle'))}</span>` : ''}</td></tr>`).join('')}</tbody></table></div></section>`,
        )
        .join('') + `<p class="note-text">${esc(t('facilityPlanHint'))}</p>`
    );
  }

  function renderManufacturing() {
    const snapshot = context.snapshot();
    const groups = C.tasksByFacility(snapshot);
    const issues = C.readiness(snapshot);
    const mode = context.state.manufacturingMode;
    const tabs = `<div class="manufacturing-tabs">${button('productionOrder', 'manufacturing-mode', 'layers', mode === 'route', `data-mode="route" aria-pressed="${mode === 'route'}"`)}${button('operationsOrder', 'manufacturing-mode', 'layers', mode === 'operations', `data-mode="operations" aria-pressed="${mode === 'operations'}"`)}${button('byManufacturingLocation', 'manufacturing-mode', 'factory', mode === 'facilities', `data-mode="facilities" aria-pressed="${mode === 'facilities'}"`)}</div>`;
    const summary = `<div class="manufacturing-summary"><span><strong>${[...groups.keys()].filter(Boolean).length}</strong>${esc(t('facilities'))}</span><span><strong>${snapshot.components.length}</strong>${esc(t('items'))}</span><span><strong>${snapshot.components.filter((c) => c.manufacturing.steps.length).length}</strong>${esc(t('plannedRoutes'))}</span></div>`;
    return (
      context.titleRow(
        'manufacturing',
        button('exportBom', 'export-bom', 'download') +
          button('print', 'print', 'print'),
      ) +
      (issues.length
        ? `<div class="hint warning">${icon('alert')}<span>${esc(t('manufacturingWarning'))} ${context.link('checklist', 'checklist')}</span></div>`
        : '') +
      tabs +
      summary +
      (!snapshot.components.length
        ? `<section class="panel">${context.empty('noProduction', 'noComponentsText', 'add-component', 'addComponent', 'factory')}</section>`
        : mode === 'route'
          ? context.renderManufacturingPlan()
          : mode === 'operations'
            ? context.renderOperationPlan()
            : facilityTables(snapshot, groups))
    );
  }
  return { renderManufacturing };
}
