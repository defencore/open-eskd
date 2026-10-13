import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
import { operationDisplay } from './route-operation.js';

export function createOperationPlan(context) {
  const { state } = context;
  const t = (...args) => context.t(...args);
  function renderOperationPlan() {
    const s = context.snapshot(),
      query = state.manufacturingSearch.toLocaleLowerCase();
    const operationBody = operationDisplay(s, t);
    const placements = C.placementIndex(s);
    const tasks = C.operationPlan(s).filter(({ component: c, step }) =>
      [
        c.name,
        c.designation,
        c.material,
        c.manufacturer,
        step?.facility || '',
        step ? t('operation_' + step.operation) : '',
      ].some((value) => value.toLocaleLowerCase().includes(query)),
    );
    const unplanned = tasks.filter((task) => !task.step).length;
    const shown = tasks.slice(0, state.manufacturingLimit);
    const focused =
      shown.find((task) => task.component.id === state.selected) || shown[0];
    return `${context.manufacturingTools(tasks.length - unplanned, 'routeOperationsCount')}${unplanned ? `<p class="note-text">${esc(t('routeUnplannedCount'))}: ${unplanned}</p>` : ''}<p class="note-text manufacturing-order-note">${esc(t('operationsOrderHint'))}</p>${
      shown
        .map(
          ({
            component: c,
            step,
            index,
            quantity,
            stage,
            prerequisites,
            sequence,
          }) =>
            `<details class="panel production-card operation-card" data-component-id="${esc(c.id)}" data-operation-id="${esc(step?.id || '')}"${c.id === focused.component.id && (step?.id || '') === (focused.step?.id || '') ? ' open' : ''}><summary><span class="production-number">${sequence}</span><span><strong>${esc(step ? t('operation_' + step.operation) : t('routeNotDefined'))} · ${esc(C.placementLabel(c, placements, false))}</strong><small>${esc(c.name)} · ${esc(t('revision'))} ${esc(c.revision)} · ${quantity} ${esc(c.unit)}${step ? ' · ' + esc(t('routeStage')) + ' ' + stage : ''}</small></span></summary><div class="panel-body"><div class="production-card-actions">${context.button('selectedComponent', 'inspect', 'cube', false, `data-id="${esc(c.id)}"`)}${!c.source ? context.button('editProduction', 'edit-production', 'edit', false, `data-id="${esc(c.id)}"`) : ''}</div>${
              step
                ? `<h3>${esc(t('routePrevious'))}</h3>${
                    prerequisites.length
                      ? `<ul class="required-components">${C.prerequisiteLabels(
                          prerequisites,
                          placements,
                          t,
                        )
                          .map((label) => `<li>${esc(label)}</li>`)
                          .join('')}</ul>`
                      : `<p class="note-text">${esc(t('routeNoPrerequisites'))}</p>`
                  }<h3>${index + 1}. ${esc(t('operation_' + step.operation))}</h3><div class="operation-body">${operationBody(step, c)}</div>`
                : `<p class="note-text">${esc(t('routeNoOperations'))}</p>`
            }</div></details>`,
        )
        .join('') || `<p class="note-text">${esc(t('noResults'))}</p>`
    }${tasks.length > shown.length ? context.button('more', 'manufacturing-more', 'plus') : ''}`;
  }
  return { renderOperationPlan };
}
