import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
import { operationDisplay } from './route-operation.js';

export function createManufacturingPlan(context) {
  const { state } = context;
  const t = (...args) => context.t(...args);
  let printState = null;
  const lines = (value) => esc(value).replace(/\n/g, '<br>');
  function manufacturingTools(count, label = 'routeItemsCount') {
    return `<div class="manufacturing-plan-tools"><label class="search"><input data-manufacturing-search value="${esc(state.manufacturingSearch)}" placeholder="${esc(t('manufacturingSearch'))}" aria-label="${esc(t('manufacturingSearch'))}"></label><span class="note-text">${esc(t(label))}: ${count}</span></div>`;
  }

  function renderManufacturingPlan() {
    const s = context.snapshot();
    const operationBody = operationDisplay(s, t);
    const childrenByParent = C.childIndex(s),
      placements = C.placementIndex(s);
    const docsByComponent = new Map();
    for (const doc of s.documents) {
      if (!docsByComponent.has(doc.componentId))
        docsByComponent.set(doc.componentId, []);
      docsByComponent.get(doc.componentId).push(doc);
    }
    const totals = new Map(C.flatten(s).map((c) => [c.id, c.totalQuantity]));
    const query = state.manufacturingSearch.toLocaleLowerCase();
    const ordered = C.productionOrder(s).filter((c) =>
      [
        c.name,
        c.designation,
        c.manufacturer,
        ...c.manufacturing.steps.map((step) => step.facility),
        c.material,
        c.manufacturing.technology
          ? t('technology_' + c.manufacturing.technology)
          : '',
      ].some((value) => value.toLocaleLowerCase().includes(query)),
    );
    const shown = ordered.slice(0, state.manufacturingLimit);
    const selectedShown = shown.some((c) => c.id === state.selected);
    const detail = (label, value) =>
      `<div><dt>${esc(t(label))}</dt><dd>${value ? lines(value) : `<span class="muted">${esc(t('notSet'))}</span>`}</dd></div>`;
    return `${manufacturingTools(ordered.length)}<p class="note-text manufacturing-order-note">${esc(t('productionOrderHint'))}</p>${
      shown.length
        ? shown
            .map((c, index) => {
              const route = c.manufacturing;
              const children = childrenByParent.get(c.id) || [];
              const documents = docsByComponent.get(c.id) || [];
              return `<details class="panel production-card"${c.id === state.selected || (!selectedShown && index === 0) ? ' open' : ''}><summary><span class="production-number">${index + 1}</span><span><strong>${esc(C.placementLabel(c, placements))}</strong><small>${esc(t('revision'))} ${esc(c.revision)} · ${totals.get(c.id)} ${esc(c.unit)} · ${esc(c.manufacturer || t('unassigned'))}</small></span>${context.badge(c.status)}</summary><div class="panel-body"><div class="production-card-actions">${context.button('selectedComponent', 'inspect', 'cube', false, `data-id="${esc(c.id)}"`)}${!c.source ? context.button('editProduction', 'edit-production', 'edit', false, `data-id="${esc(c.id)}"`) : `<span class="note-text">${esc(t('catalogPinned'))}: ${esc(c.revision)}</span>`}</div><h3>${esc(t('beforeStarting'))}</h3><dl class="route-preparation">${detail('technology', route.technology ? t('technology_' + route.technology) : '')}${detail('material', c.material)}${detail('stock', route.stock)}${detail('preparation', route.preparation)}${detail('process', c.process)}</dl>${children.length ? `<h4>${esc(t('requiredComponents'))}</h4><ul class="required-components">${children.map((child) => `<li>${esc(C.placementLabel(child, placements))} <strong>${child.quantity} ${esc(child.unit)}</strong></li>`).join('')}</ul><p class="note-text">${esc(t('requiredComponentsHint'))}</p>` : ''}<h4>${esc(t('productionDocs'))}</h4>${documents.length ? `<ul class="required-documents">${documents.map((doc) => `<li><button type="button" class="text-link" data-action="preview-document" data-id="${esc(doc.id)}">${esc(doc.name)}</button><span class="production-doc-name">${esc(doc.name)}</span> · ${esc(t('revision'))} ${esc(doc.revision)}</li>`).join('')}</ul>` : `<p class="note-text">${esc(t('noFilesForComponent'))}</p>`}<h3 class="route-heading">${esc(t('manufacturingRoute'))}</h3>${route.steps.length ? `<ol class="operation-plan">${route.steps.map((step) => `<li><h4>${esc(t('operation_' + step.operation))}</h4>${operationBody(step, c)}</li>`).join('')}</ol>` : `<p class="note-text">${esc(t('routeEmpty'))}</p>`}</div></details>`;
            })
            .join('')
        : `<p class="note-text">${esc(t('noResults'))}</p>`
    }${ordered.length > shown.length ? context.button('more', 'manufacturing-more', 'plus') : ''}`;
  }

  async function handleManufacturingAction(name, element) {
    if (name === 'manufacturing-mode') {
      if (!['route', 'operations', 'facilities'].includes(element.dataset.mode))
        return false;
      state.manufacturingMode = element.dataset.mode;
      context.render();
      return true;
    }
    if (name === 'manufacturing-more') {
      state.manufacturingLimit += 50;
      context.render();
      return true;
    }
    return false;
  }

  function updateManufacturingSearch(input) {
    state.manufacturingSearch = input.value;
    state.manufacturingLimit = 50;
    const position = input.selectionStart;
    context.render();
    const replacement = document.querySelector('[data-manufacturing-search]');
    replacement.focus();
    replacement.setSelectionRange(position, position);
  }

  function prepareManufacturingPrint() {
    if (printState) return;
    if (
      state.view !== 'manufacturing' ||
      !['route', 'operations'].includes(state.manufacturingMode)
    )
      return;
    printState = {
      limit: state.manufacturingLimit,
      expanded: [
        ...document.querySelectorAll('.production-card, .operation-card'),
      ].map((card) => card.open),
    };
    state.manufacturingLimit = Infinity;
    context.render();
    document
      .querySelectorAll('.production-card, .operation-card')
      .forEach((card) => {
        card.open = true;
      });
  }

  function restoreManufacturingPrint() {
    if (!printState) return;
    state.manufacturingLimit = printState.limit;
    context.render();
    document
      .querySelectorAll('.production-card, .operation-card')
      .forEach((card, index) => {
        card.open = printState.expanded[index] || false;
      });
    printState = null;
  }

  return {
    renderManufacturingPlan,
    manufacturingTools,
    handleManufacturingAction,
    updateManufacturingSearch,
    prepareManufacturingPrint,
    restoreManufacturingPrint,
  };
}
