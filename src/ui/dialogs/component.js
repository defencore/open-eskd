import * as C from '../../domain/index.js';

import * as U from '../../application/project-tools.js';

import { esc } from '../../shared/html.js';

export function createComponentDialogs(context) {
  const { state, modal } = context;

  const field = (...args) => context.suggestedField(...args);
  const textarea = (...args) => context.guidedTextarea(...args);
  const selectField = (...args) => context.guidedSelect(...args);
  const showModal = (...args) => context.showModal(...args);
  const t = (...args) => context.t(...args);
  const snapshot = (...args) => context.snapshot(...args);

  function defaultParent() {
    const s = snapshot(),
      selected = s.components.find((c) => c.id === state.selected);
    if (selected?.source)
      return (
        s.components.find((c) => c.id === selected.source.rootId)?.parentId ||
        null
      );
    if (selected)
      return ['assembly', 'complex', 'set'].includes(selected.type)
        ? selected.id
        : selected.parentId;
    return (
      s.components.find(
        (c) =>
          c.parentId === null &&
          !c.source &&
          ['assembly', 'complex', 'set'].includes(c.type),
      )?.id || null
    );
  }

  function componentModal(id = null, source = null, section = '') {
    const s = snapshot(),
      current = id ? s.components.find((c) => c.id === id) : null,
      parentId = defaultParent();
    if (current?.source) {
      context.occurrenceModal(id);
      return;
    }
    C.assertEditable(s, parentId);
    const c = current ||
      source || {
        name: '',
        designation: U.nextDesignation(s, parentId),
        type: s.components.length ? 'part' : 'assembly',
        quantity: 1,
        status: 'draft',
        parentId,
        revision: 'A',
        unit: 'pcs',
        material: '',
        manufacturer: '',
        owner: state.author || s.meta.owner,
        process: '',
        notes: '',
        manufacturing: C.manufacturing(),
        provenance: C.provenance(
          s.meta.workflow === 'decomposition' ? 'observed' : 'designed',
        ),
      };
    const routeComponentId = id || C.uid();
    const route = C.clone(c.manufacturing);
    if (!id && c.id)
      for (const step of route.steps)
        for (const ref of step.dependsOn)
          if (ref.componentId === c.id) {
            ref.componentId = routeComponentId;
            if (
              ref.revision === c.revision &&
              ref.catalogRevisionId === (c.source?.revisionId || null)
            )
              ref.catalogRevisionId = null;
          }
    const excluded = id ? C.descendants(s, id) : new Set();
    const parents = [
      { value: '', label: t('root') },
      ...C.flatten(s)
        .filter(
          (x) =>
            ['assembly', 'complex', 'set'].includes(x.type) &&
            !excluded.has(x.id) &&
            !x.source,
        )
        .map((x) => ({
          value: x.id,
          label: '— '.repeat(x.depth) + x.designation + ' · ' + x.name,
        })),
    ];
    showModal(
      id ? 'editComponent' : 'addComponent',
      `<p class="modal-description">${esc(t(!id && source?.id ? 'similarElementHint' : 'basicInfoHint'))}</p><p class="form-guide-intro">${esc(t('formGuideIntro'))}</p><input type="hidden" name="id" value="${esc(id || '')}"><div class="form-grid">${field('name', 'name', c.name, 'maxlength="200" required')}${field('designation', 'designation', c.designation, 'maxlength="200" required')}${selectField(
        'type',
        'type',
        C.TYPES.map((v) => ({ value: v, label: t(v) })),
        c.type,
      )}${selectField('parent', 'parentId', parents, c.parentId || '')}${field('quantity', 'quantity', c.quantity, 'min="0" max="1000000" step="any" required', 'number')}${field('unit', 'unit', c.unit || 'pcs', 'maxlength="100" required')}</div>${context.provenanceFields(c)}<details class="form-section"${section === 'production' ? ' open' : ''}><summary>${esc(t('productionInfo'))}</summary><div class="form-grid">${field('owner', 'owner', c.owner, 'maxlength="200"')}${field('material', 'material', c.material, 'maxlength="200"')}${field('manufacturer', 'manufacturer', c.manufacturer, 'maxlength="200"')}${selectField('technology', 'technology', [{ value: '', label: t('technologyChoose') }, ...C.TECHNOLOGIES.map((tech) => ({ value: tech, label: t('technology_' + tech) }))], c.manufacturing.technology)}${field('process', 'process', c.process, 'maxlength="1000"')}${textarea('notes', 'notes', c.notes, 'full')}</div>${context.routeFields(route)}</details><details class="form-section"><summary>${esc(t('versionInfo'))}</summary><div class="form-grid">${field('revision', 'revision', c.revision || 'A', 'maxlength="100" required')}${selectField(
        'status',
        'status',
        C.STATUSES.map((v) => ({ value: v, label: t(v) })),
        c.status,
      )}</div></details>`,
      'component',
      id ? 'save' : 'add',
    );
    modal.querySelector('form').dataset.routeComponentId = routeComponentId;
    modal.querySelector('form').dataset.returnView =
      id && state.view === 'manufacturing' ? 'manufacturing' : 'structure';
    context.updateRouteEditor(modal.querySelector('form'));
    if (!id)
      modal.querySelector('[name=designation]').dataset.suggested =
        c.designation;
    if (!id)
      modal
        .querySelector('.modal-footer button[type=submit]')
        .insertAdjacentHTML(
          'beforebegin',
          `<button type="submit" name="addAnother" class="button">${esc(t('addAnother'))}</button>`,
        );
  }

  function bulkModal() {
    const s = snapshot(),
      parent = defaultParent();
    const parents = [
      { value: '', label: t('root') },
      ...C.flatten(s)
        .filter(
          (c) => !c.source && ['assembly', 'complex', 'set'].includes(c.type),
        )
        .map((c) => ({ value: c.id, label: c.designation + ' · ' + c.name })),
    ];
    showModal(
      'bulkTitle',
      `<p class="modal-description">${esc(t('bulkHint'))}</p><div class="form-grid">${selectField('parent', 'parentId', parents, parent || '')}${selectField(
        'bulkDefaultType',
        'type',
        C.TYPES.map((type) => ({ value: type, label: t(type) })),
        'part',
      )}</div>${textarea('bulkInput', 'list', '', '', `data-bulk-input maxlength="5000000" required placeholder="${esc(t('bulkPlaceholder'))}" spellcheck="false"`)}<div class="bulk-preview" data-bulk-preview></div>`,
      'bulk',
      'add',
    );
    updateBulkPreview();
  }

  function updateBulkPreview() {
    const input = modal.querySelector('[data-bulk-input]'),
      preview = modal.querySelector('[data-bulk-preview]');
    if (!input || !preview) return;
    const result = U.parseList(input.value, snapshot());
    modal.querySelector('button[type=submit]').disabled =
      result.errors.length > 0 || result.rows.length === 0;
    preview.innerHTML = `<h3>${esc(t('bulkPreview'))}</h3>${result.errors.length ? `<div class="form-error">${result.errors.map((error) => `${error.line ? esc(t('bulkLine')) + ' ' + error.line + ': ' : ''}${esc(t('bulk_' + error.code))}${error.value ? ' — ' + esc(error.value) : ''}`).join('<br>')}</div>` : ''}${
      result.rows.length
        ? `<p class="note-text">${esc(t('bulkReady'))}: ${result.rows.length}</p><div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('designation'))}</th><th>${esc(t('name'))}</th><th>${esc(t('quantity'))}</th></tr></thead><tbody>${result.rows
            .slice(0, 20)
            .map(
              (row) =>
                `<tr><td class="code">${esc(row.designation)}</td><td>${esc(row.name)}</td><td>${row.quantity}</td></tr>`,
            )
            .join(
              '',
            )}</tbody></table></div>${result.rows.length > 20 ? `<p class="note-text">+ ${result.rows.length - 20} ${esc(t('more'))}</p>` : ''}`
        : `<p class="note-text">${esc(t('bulkEmpty'))}</p>`
    }`;
  }

  return { defaultParent, componentModal, bulkModal, updateBulkPreview };
}
