import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
import { icon } from './icons.js';

export function createManufacturingEditor(context) {
  const t = (...args) => context.t(...args);
  const stepFields = [
    'operation',
    'instructions',
    'inputs',
    'equipment',
    'facility',
    'check',
  ];
  const labels = {
    instructions: 'routeInstructions',
    inputs: 'routeInputs',
    equipment: 'routeEquipment',
    facility: 'routeFacility',
    check: 'routeCheck',
  };

  function stepHTML(step, open = false) {
    return `<details class="route-step" data-route-step data-id="${esc(step.id)}"${step.extensions ? ` data-step-extensions="${esc(JSON.stringify(step.extensions))}"` : ''}${open ? ' open' : ''}><summary><span data-step-number></span> · <span data-step-title>${esc(t('operation_' + step.operation))}</span></summary><div class="route-step-body"><div class="route-step-actions">${['up', 'down', 'remove'].map((action) => `<button type="button" class="icon-button" data-action="route-${action}" data-id="${esc(step.id)}" aria-label="${esc(t('route_' + action))}" title="${esc(t('route_' + action))}">${icon(action === 'remove' ? 'trash' : 'arrow')}</button>`).join('')}</div>${context.guidedSelect(
      'routeOperation',
      'step-' + step.id + '-operation',
      C.OPERATIONS.map((op) => ({ value: op, label: t('operation_' + op) })),
      step.operation,
      'data-step-field="operation"',
    )}<div class="form-grid">${stepFields
      .slice(1)
      .map((field) =>
        field === 'instructions'
          ? context.guidedTextarea(
              labels[field],
              'step-' + step.id + '-' + field,
              step[field],
              'full',
              'data-step-field="instructions" maxlength="2000"',
            )
          : context.suggestedField(
              labels[field],
              'step-' + step.id + '-' + field,
              step[field],
              `data-step-field="${field}" maxlength="2000"`,
            ),
      )
      .join('')}</div>${context.routeLinks(step)}</div></details>`;
  }

  function routeFields(route) {
    return `<details class="form-section route-editor" data-route-editor${route.extensions ? ` data-route-extensions="${esc(JSON.stringify(route.extensions))}"` : ''}><summary>${esc(t('manufacturingRoute'))} <span class="muted" data-route-count>${route.steps.length}</span></summary><div class="form-grid">${context.suggestedField('stock', 'stock', route.stock, 'maxlength="2000"')}${context.guidedTextarea('preparation', 'preparation', route.preparation, '', 'maxlength="2000"')}</div><div class="route-toolbar"><button type="button" class="button" data-action="route-template">${icon('layers')}${esc(t('routeTemplate'))}</button><button type="button" class="button" data-action="route-add">${icon('plus')}${esc(t('routeAdd'))}</button></div><p class="note-text">${esc(t('routeTemplateHint'))}</p><div data-route-validation role="status" aria-live="polite"></div><div data-route-steps>${route.steps.map((step) => stepHTML(step)).join('')}</div><p class="note-text" data-route-empty${route.steps.length ? ' hidden' : ''}>${esc(t('routeEmpty'))}</p></details>`;
  }

  function readManufacturing(form) {
    const get = (name) =>
      String(form.elements.namedItem(name)?.value || '').trim();
    const editor = form.querySelector('[data-route-editor]');
    return C.manufacturing({
      ...(editor?.dataset.routeExtensions
        ? { extensions: JSON.parse(editor.dataset.routeExtensions) }
        : {}),
      technology: get('technology'),
      stock: get('stock'),
      preparation: get('preparation'),
      steps: [...form.querySelectorAll('[data-route-step]')].map((row) =>
        C.operation({
          ...(row.dataset.stepExtensions
            ? { extensions: JSON.parse(row.dataset.stepExtensions) }
            : {}),
          id: row.dataset.id,
          ...context.readRouteLinks(row),
          ...Object.fromEntries(
            stepFields.map((field) => [
              field,
              row.querySelector(`[data-step-field=${field}]`).value.trim(),
            ]),
          ),
        }),
      ),
    });
  }

  function updateRouteEditor(form) {
    const editor = form?.querySelector('[data-route-editor]');
    if (!editor) return;
    const rows = [...editor.querySelectorAll('[data-route-step]')];
    rows.forEach((row, index) => {
      row.querySelector('[data-step-number]').textContent = String(index + 1);
      row.querySelector('[data-step-title]').textContent = t(
        'operation_' + row.querySelector('[data-step-field=operation]').value,
      );
      row.querySelector('[data-action=route-up]').disabled = index === 0;
      row.querySelector('[data-action=route-down]').disabled =
        index === rows.length - 1;
    });
    editor.querySelector('[data-route-count]').textContent = String(
      rows.length,
    );
    editor.querySelector('[data-route-empty]').hidden = rows.length > 0;
    editor.querySelector('[data-action=route-template]').disabled =
      rows.length > 0 || !form.elements.namedItem('technology').value;
    editor.querySelector('[data-action=route-add]').disabled =
      rows.length >= 100;
    context.updateRouteLinks(form);
    const preview = editor.querySelector('[data-route-validation]');
    const formError = form.querySelector('.form-error');
    try {
      const route = readManufacturing(form);
      C.validateManufacturing(route);
      const s = C.clone(context.snapshot());
      const id = form.dataset.routeComponentId;
      const component = s.components.find((c) => c.id === id);
      if (component) {
        component.manufacturing = route;
        component.revision = form.elements.namedItem('revision').value;
        component.parentId = form.elements.namedItem('parentId').value || null;
      } else
        s.components.push(
          C.component({
            id,
            name: form.elements.namedItem('name').value,
            designation: form.elements.namedItem('designation').value,
            parentId: form.elements.namedItem('parentId').value || null,
            manufacturing: route,
          }),
        );
      C.operationPlan(s);
      const issues = C.manufacturingIssues(s).filter(
        (issue) => issue.componentId === id,
      );
      preview.className = issues.length
        ? 'route-validation reference-changed'
        : 'route-validation';
      preview.textContent = t(
        issues.length ? 'routeReferencesChanged' : 'routeLinksValid',
      );
      if (formError?.dataset.code?.startsWith('route-')) {
        formError.textContent = '';
        formError.dataset.code = '';
      }
    } catch (error) {
      preview.className = 'route-validation reference-changed';
      preview.textContent = context.errorMessage(error);
      if (formError?.dataset.code?.startsWith('route-'))
        formError.textContent = preview.textContent;
    }
  }

  async function handleRouteAction(action, button) {
    if (!action.startsWith('route-')) return false;
    const form = button.closest('form');
    const editor = form.querySelector('[data-route-editor]');
    const container = editor.querySelector('[data-route-steps]');
    const rows = [...container.querySelectorAll('[data-route-step]')];
    context.dismissInfoTooltip();
    if (context.handleRouteLinkAction(action, button)) {
      updateRouteEditor(form);
      return true;
    } else if (action === 'route-add') {
      if (rows.length >= 100)
        throw new Error('A route can contain up to 100 operations.');
      container.insertAdjacentHTML('beforeend', stepHTML(C.operation(), true));
    } else if (action === 'route-template') {
      if (rows.length)
        throw new Error('A template can only be applied to an empty route.');
      container.innerHTML = C.routeTemplate(
        form.elements.namedItem('technology').value,
      )
        .map((step, index) => stepHTML(step, index === 0))
        .join('');
    } else {
      const row = rows.find((r) => r.dataset.id === button.dataset.id);
      if (!row) throw new Error('Missing manufacturing operation.');
      if (action === 'route-remove') row.remove();
      else if (action === 'route-up' && row.previousElementSibling)
        container.insertBefore(row, row.previousElementSibling);
      else if (action === 'route-down' && row.nextElementSibling)
        container.insertBefore(row.nextElementSibling, row);
      else return false;
    }
    editor.open = true;
    updateRouteEditor(form);
    return true;
  }

  return {
    routeFields,
    readManufacturing,
    updateRouteEditor,
    handleRouteAction,
  };
}
