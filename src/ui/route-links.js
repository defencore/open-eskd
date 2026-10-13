import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
import { icon } from './icons.js';

export function createRouteLinks(context) {
  const t = (...args) => context.t(...args);
  let sequence = 0;
  const choose = { value: '', label: t('routeChooseLink') };
  const select = (...args) => context.guidedSelect(...args);
  const remove = () =>
    `<button type="button" class="icon-button" data-action="route-link-remove" aria-label="${esc(t('routeRemoveLink'))}">${icon('trash')}</button>`;
  const refresh = () =>
    `<button type="button" class="button small" data-action="route-link-refresh">${esc(t('routeAcceptRevision'))}</button>`;

  function linkRow(kind, ref = {}) {
    const n = ++sequence;
    let body;
    if (kind === 'dependency') {
      body = `<div class="form-grid">${select('routeDependencyComponent', `link-${n}-component`, [choose], ref.componentId || '', 'data-ref-component')}${select('routeDependencyOperation', `link-${n}-operation`, [{ value: ref.operationId || '', label: t('routeChooseLink') }], ref.operationId || '', 'data-ref-operation')}</div><div class="route-reference-status"><span data-ref-status></span>${refresh()}</div>`;
    } else if (kind === 'input') {
      body = `<div class="form-grid">${select('routeInputComponent', `link-${n}-component`, [choose], ref.componentId || '', 'data-ref-component')}${select(
        'routeInputUsage',
        `link-${n}-usage`,
        ['input', 'reference'].map((usage) => ({
          value: usage,
          label: t('routeUsage_' + usage),
        })),
        ref.usage || 'input',
        'data-ref-usage',
      )}${context.guidedField('routeInputQuantity', `link-${n}-quantity`, ref.quantity ?? 1, 'data-ref-quantity min="0" max="1000000" step="any" required', 'number')}</div><div class="route-reference-status"><span data-ref-status></span>${refresh()}</div>`;
    } else {
      body = `${select('routeDocument', `link-${n}-document`, [choose], ref.documentId || '', 'data-ref-document')}<div class="route-reference-status"><span data-ref-status></span>${refresh()}</div>`;
    }
    return `<div class="route-link-row" data-route-link="${kind}" data-target="${esc(ref.componentId || ref.documentId || '')}" data-revision="${esc(ref.revision || '')}" data-catalog-revision="${esc(ref.catalogRevisionId || '')}" data-path="${esc(ref.path || '')}" data-sha256="${esc(ref.sha256 || '')}"><div class="route-link-actions">${remove()}</div>${body}</div>`;
  }

  function routeLinks(step) {
    return `<details class="route-links"><summary>${esc(t('routeLinkedItems'))} <span class="muted" data-route-link-count>${step.dependsOn.length + step.componentInputs.length + step.documents.length}</span></summary>${[
      ['dependency', 'routeDependencies', step.dependsOn],
      ['input', 'routeComponentInputs', step.componentInputs],
      ['document', 'routeDocuments', step.documents],
    ]
      .map(
        ([kind, label, refs]) =>
          `<section class="route-link-section"><h4>${esc(t(label))}</h4><div data-route-links="${kind}">${refs.map((ref) => linkRow(kind, ref)).join('')}</div><button type="button" class="button" data-action="route-link-add" data-kind="${kind}">${icon('plus')}${esc(t('routeAdd_' + kind))}</button></section>`,
      )
      .join('')}</details>`;
  }

  function readRouteLinks(row) {
    const links = (kind) => [
      ...row.querySelectorAll(`[data-route-link=${kind}]`),
    ];
    return {
      dependsOn: links('dependency').map((link) => ({
        componentId: link.querySelector('[data-ref-component]').value,
        operationId: link.querySelector('[data-ref-operation]').value,
        revision: link.dataset.revision,
        catalogRevisionId: link.dataset.catalogRevision || null,
      })),
      componentInputs: links('input').map((link) => ({
        componentId: link.querySelector('[data-ref-component]').value,
        revision: link.dataset.revision,
        catalogRevisionId: link.dataset.catalogRevision || null,
        quantity: Number(link.querySelector('[data-ref-quantity]').value),
        usage: link.querySelector('[data-ref-usage]').value,
      })),
      documents: links('document').map((link) => ({
        documentId: link.querySelector('[data-ref-document]').value,
        revision: link.dataset.revision,
        path: link.dataset.path,
        sha256: link.dataset.sha256 || null,
      })),
    };
  }

  function replaceOptions(control, options, current) {
    if (current && !options.some((option) => option.value === current))
      options.push({ value: current, label: t('routeMissingLink') });
    control.innerHTML = options
      .map(
        (option) =>
          `<option value="${esc(option.value)}"${option.value === current ? ' selected' : ''}>${esc(option.label)}</option>`,
      )
      .join('');
  }

  function updateRouteLinks(form) {
    if (!form?.querySelector('[data-route-editor]')) return;
    const ownerId = form.dataset.routeComponentId;
    const original = context
      .snapshot()
      .components.find((c) => c.id === ownerId);
    const edited = {
      id: ownerId,
      definitionId: original?.definitionId || ownerId,
      parentId: form.elements.namedItem('parentId').value || null,
      revision: form.elements.namedItem('revision').value,
      designation: form.elements.namedItem('designation').value,
      name: form.elements.namedItem('name').value,
      manufacturing: {
        steps: [...form.querySelectorAll('[data-route-step]')].map((row) => ({
          id: row.dataset.id,
          operation: row.querySelector('[data-step-field=operation]').value,
        })),
      },
    };
    const components = context
      .snapshot()
      .components.map((c) => (c.id === ownerId ? edited : c));
    if (!original) components.push(edited);
    const placements = C.placementIndex({ components });
    const docLabels = C.documentLabels(
      { components, documents: context.snapshot().documents },
      placements,
      t('project'),
    );
    for (const step of form.querySelectorAll('[data-route-step]'))
      step.querySelector('[data-route-link-count]').textContent = String(
        step.querySelectorAll('[data-route-link]').length,
      );
    for (const row of form.querySelectorAll('[data-route-link]')) {
      const kind = row.dataset.routeLink;
      const selector = row.querySelector('[data-ref-component]');
      const targetId = selector?.value || row.dataset.target;
      if (selector)
        replaceOptions(
          selector,
          [
            { value: '', label: t('routeChooseLink') },
            ...components
              .filter((c) => kind === 'dependency' || c.id !== ownerId)
              .map((c) => ({
                value: c.id,
                label:
                  C.placementLabel(c, placements) +
                  ' · ' +
                  t('revision') +
                  ' ' +
                  c.revision,
              })),
          ],
          targetId,
        );
      const current = selector
        ? components.find((c) => c.id === selector.value)
        : context
            .snapshot()
            .documents.find((doc) => doc.id === row.dataset.target);
      if (kind === 'dependency') {
        const operations = current?.manufacturing.steps || [];
        const step = row.closest('[data-route-step]');
        const control = row.querySelector('[data-ref-operation]');
        replaceOptions(
          control,
          [
            { value: '', label: t('routeChooseLink') },
            ...operations.flatMap((op, index) =>
              op.id === step.dataset.id && current.id === ownerId
                ? []
                : [
                    {
                      value: op.id,
                      label: `${index + 1}. ${t('operation_' + op.operation)}`,
                    },
                  ],
            ),
          ],
          control.value,
        );
      }
      {
        if (kind === 'dependency' && current?.id === ownerId) {
          row.dataset.revision = current.revision;
          row.dataset.catalogRevision = '';
        }
        if (kind === 'document') {
          const control = row.querySelector('[data-ref-document]');
          replaceOptions(
            control,
            [
              { value: '', label: t('routeChooseLink') },
              ...context.snapshot().documents.map((doc) => ({
                value: doc.id,
                label:
                  docLabels.get(doc.id) +
                  ' · ' +
                  t('revision') +
                  ' ' +
                  doc.revision,
              })),
            ],
            row.dataset.target,
          );
        }
        const changed =
          current &&
          (current.revision !== row.dataset.revision ||
            (kind !== 'document'
              ? (current.source?.revisionId || '') !==
                row.dataset.catalogRevision
              : current.path !== row.dataset.path ||
                (current.sha256 || '') !== row.dataset.sha256));
        const status = row.querySelector('[data-ref-status]');
        status.textContent = current
          ? `${t('routeExpectedRevision')}: ${row.dataset.revision || '—'}${changed ? ' · ' + t('routeRevisionChanged') + ' (' + current.revision + ')' : ''}`
          : t('routeChooseLink');
        status.classList.toggle('reference-changed', Boolean(changed));
        row.querySelector('[data-action=route-link-refresh]').disabled =
          !changed;
      }
    }
  }

  function captureRevision(row, id) {
    row.dataset.target = id;
    const current =
      row.dataset.routeLink !== 'document'
        ? context.snapshot().components.find((c) => c.id === id)
        : context.snapshot().documents.find((d) => d.id === id);
    row.dataset.revision = current?.revision || '';
    row.dataset.catalogRevision = current?.source?.revisionId || '';
    row.dataset.path = current?.path || '';
    row.dataset.sha256 = current?.sha256 || '';
  }

  function handleRouteLinkChange(target) {
    const row = target.closest('[data-route-link]');
    if (!row) return;
    if (
      target.hasAttribute('data-ref-component') ||
      target.hasAttribute('data-ref-document')
    ) {
      captureRevision(row, target.value);
      if (row.dataset.routeLink === 'dependency')
        row.querySelector('[data-ref-operation]').value = '';
    }
  }

  function handleRouteLinkAction(action, button) {
    if (!action.startsWith('route-link-')) return false;
    const step = button.closest('[data-route-step]');
    if (action === 'route-link-add') {
      const kind = button.dataset.kind;
      const container = step.querySelector(`[data-route-links=${kind}]`);
      if (container.children.length >= (kind === 'document' ? 50 : 100))
        throw C.routeError('route-link-invalid');
      container.insertAdjacentHTML('beforeend', linkRow(kind));
    } else if (action === 'route-link-remove')
      button.closest('[data-route-link]').remove();
    else if (action === 'route-link-refresh') {
      const row = button.closest('[data-route-link]');
      captureRevision(row, row.dataset.target);
    } else return false;
    return true;
  }

  return {
    routeLinks,
    readRouteLinks,
    updateRouteLinks,
    handleRouteLinkChange,
    handleRouteLinkAction,
  };
}
