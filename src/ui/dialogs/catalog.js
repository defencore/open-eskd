import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';
import {
  workspaceRevisions,
  whereUsed,
  importCatalog,
} from '../../application/catalog/workspace.js';

export function createCatalogDialogs(context) {
  const { state, t } = context;
  function parents(excludedId = null) {
    const s = context.snapshot(),
      excluded = excludedId ? C.descendants(s, excludedId) : new Set();
    return [
      { value: '', label: t('root') },
      ...C.flatten(s)
        .filter(
          (c) =>
            C.CONTAINER_TYPES.includes(c.type) &&
            !c.source &&
            !excluded.has(c.id),
        )
        .map((c) => ({ value: c.id, label: c.designation + ' · ' + c.name })),
    ];
  }
  function suggestedLabel(itemId, current = 'A') {
    const used = new Set(
      workspaceRevisions(state.projects, state.projectId)
        .filter((e) => e.record.itemId === itemId)
        .map((e) => e.record.label),
    );
    let label = /^[A-Y]$/.test(current)
      ? String.fromCharCode(current.charCodeAt(0) + 1)
      : current + '-next';
    if (!used.has(current)) return current;
    const base = label;
    let n = 2;
    while (used.has(label)) label = base + '-' + n++;
    return label;
  }
  function publishModal(id) {
    const c = context.snapshot().components.find((c) => c.id === id);
    C.assertEditable(context.snapshot(), id);
    context.showModal(
      'catalogPublish',
      `<p class="modal-description">${esc(t('catalogPublishHint'))}</p><p><strong>${esc(c.designation + ' · ' + c.name)}</strong></p><input name="id" type="hidden" value="${esc(id)}">${context.field('catalogRevisionLabel', 'label', suggestedLabel(c.definitionId, c.revision), 'maxlength="100" required')}${context.field('author', 'author', context.author(), 'maxlength="200" required')}${context.textarea('changeDescription', 'message')}<details class="form-section"><summary>${esc(t('releaseSection'))}</summary><label class="field checkbox"><input type="checkbox" name="release"><span>${esc(t('releaseBlockedHint'))}</span></label></details>`,
      'catalog-publish',
      'catalogPublish',
    );
  }
  function usageHTML(uses) {
    return `<div class="divider"></div><h3>${esc(t('catalogWhereUsed'))}</h3><p class="note-text">${esc(t('catalogWhereUsedHint'))}</p>${uses.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('project'))}</th><th>${esc(t('revision'))}</th><th>${esc(t('totalQuantity'))}</th><th></th></tr></thead><tbody>${uses.map((use) => `<tr><td>${esc(use.projectName)}<small class="component-sub">${esc(use.parent || t('root'))}</small></td><td>${esc(use.revision)}<small class="component-sub">${esc(t(use.pinned ? 'catalogPinned' : 'catalogLocal'))}</small></td><td>${use.quantity}</td><td>${context.button('goTo', 'catalog-inspect-use', 'arrow', false, `data-project="${esc(use.projectId)}" data-id="${esc(use.componentId)}"`)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="note-text">${esc(t('catalogUnused'))}</p>`}`;
  }
  function catalogDetails(itemId) {
    const entries = workspaceRevisions(state.projects, state.projectId).filter(
      (e) => e.record.itemId === itemId,
    );
    C.assert(entries.length, 'Missing component.');
    const uses = whereUsed(state.projects, itemId);
    const root = entries[0].record.snapshot.components.find(
      (c) => c.parentId === null,
    );
    context.showModal(
      'catalogDetails',
      `<h3>${esc(root.designation + ' · ' + root.name)}</h3><p class="modal-description">${esc(t('catalogDetailsHint'))}</p>${entries.map((e) => `<article class="catalog-revision"><div><strong>${esc(e.record.label)}</strong> ${context.badge(e.record.status)}<small>${esc(e.record.author)} · ${context.fmtDate(e.record.createdAt)} · ${esc(e.projectName)}</small><p>${esc(e.record.message)}</p><span>${e.record.snapshot.components.length} ${esc(t('componentCount'))} · ${e.record.snapshot.documents.length} ${esc(t('files'))}</span></div><div class="catalog-buttons">${context.button('catalogUse', 'catalog-use', 'plus', true, `data-revision="${esc(e.record.id)}" data-project="${esc(e.projectId)}"`)}${context.button('catalogExport', 'catalog-export', 'download', false, `data-revision="${esc(e.record.id)}" data-project="${esc(e.projectId)}"`)}</div></article>`).join('')}${usageHTML(uses)}`,
    );
  }
  function useModal(revisionId, sourceId) {
    const incoming = state.projects.find((p) => p.id === sourceId),
      record = incoming.catalog[revisionId],
      root = record.snapshot.components.find((c) => c.parentId === null);
    context.showModal(
      'catalogUse',
      `<p class="modal-description">${esc(root.designation + ' · ' + root.name)} · ${esc(record.label)}<br>${esc(t('catalogPinHint'))}</p><input type="hidden" name="sourceId" value="${esc(sourceId)}"><input type="hidden" name="revisionId" value="${esc(revisionId)}">${context.guidedSelect('parent', 'parentId', parents(), context.defaultParent() || '')}${context.guidedField('quantity', 'quantity', 1, 'min="0" max="1000000" step="any" required', 'number')}`,
      'catalog-use',
      'add',
    );
  }
  function occurrenceModal(id) {
    const root = context.snapshot().components.find((c) => c.id === id);
    if (root.source.rootId !== id) {
      context.toast(t('catalogNestedLocked'), true);
      return;
    }
    context.showModal(
      'catalogPlacement',
      `<p class="modal-description">${esc(t('catalogPlacementHint'))}</p><input type="hidden" name="id" value="${esc(id)}">${context.guidedSelect('parent', 'parentId', parents(id), root.parentId || '')}${context.guidedField('quantity', 'quantity', root.quantity, 'min="0" max="1000000" step="any" required', 'number')}`,
      'catalog-placement',
    );
  }
  function checkoutModal(id) {
    context.showModal(
      'catalogCheckout',
      `<p class="modal-description">${esc(t('catalogCheckoutHint'))}</p><input type="hidden" name="id" value="${esc(id)}">`,
      'catalog-checkout',
      'catalogCheckout',
    );
  }
  function updateModal(id) {
    const root = context.snapshot().components.find((c) => c.id === id);
    const entries = workspaceRevisions(state.projects, state.projectId).filter(
      (e) =>
        e.record.itemId === root.definitionId &&
        e.record.id !== root.source.revisionId,
    );
    if (!entries.length) {
      context.toast(t('catalogNoUpdates'));
      return;
    }
    context.showModal(
      'catalogUpdate',
      `<p class="modal-description">${esc(t('catalogUpdateHint'))}</p><p>${esc(t('catalogPinned'))}: <strong>${esc(root.revision)}</strong></p><input type="hidden" name="id" value="${esc(id)}">${context.selectField(
        'catalogSelectRevision',
        'choice',
        entries.map((e) => ({
          value: JSON.stringify([e.projectId, e.record.id]),
          label:
            e.record.label + ' · ' + e.record.author + ' · ' + e.projectName,
        })),
        JSON.stringify([entries[0].projectId, entries[0].record.id]),
      )}`,
      'catalog-update',
      'prepareMerge',
    );
  }
  function updateReview(id, sourceId, revisionId) {
    const candidate = C.updateOccurrence(
      importCatalog(
        context.project(),
        state.projects.find((p) => p.id === sourceId),
        revisionId,
      ),
      id,
      revisionId,
    );
    const before = C.fragment(context.snapshot(), id),
      after = C.fragment(C.working(candidate), id);
    context.showModal(
      'catalogUpdateReview',
      `<p class="modal-description">${esc(t('catalogUpdateReviewHint'))}</p>${context.diffHTML(C.diff(before, after).filter((change) => change.kind !== 'meta'))}<input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="sourceId" value="${esc(sourceId)}"><input type="hidden" name="revisionId" value="${esc(revisionId)}">`,
      'catalog-apply-update',
      'catalogApplyUpdate',
    );
  }
  function componentImportDialog(incoming) {
    state.pendingImport = incoming;
    context.showModal(
      'catalogImportPackage',
      `<p class="modal-description">${esc(t('catalogImportPackageHint'))}</p><strong>${esc(C.working(incoming).meta.name)}</strong><div class="catalog-buttons" style="margin-top:18px">${context.button('catalogImportInto', 'catalog-import-package', 'box', true)}${context.button('catalogOpenStandalone', 'import-copy', 'folder')}</div>`,
    );
  }
  function catalogInspector(c) {
    if (!c.source)
      return `<div class="inspector-section"><h3>${esc(t('catalogLocal'))}</h3><p>${esc(t('catalogLocalHint'))}</p>${context.button('catalogPublish', 'catalog-publish', 'box', false, `data-id="${esc(c.id)}"`)}</div>`;
    const root = c.source.rootId === c.id;
    return `<div class="inspector-section"><h3>${esc(t('catalogPinned'))}: ${esc(c.revision)}</h3><p>${esc(t(root ? 'catalogPinnedHint' : 'catalogNestedLocked'))}</p><div class="catalog-buttons">${root ? context.button('catalogCheckout', 'catalog-checkout', 'edit', false, `data-id="${esc(c.id)}"`) + context.button('catalogUpdate', 'catalog-update', 'history', false, `data-id="${esc(c.id)}"`) + context.button('catalogExport', 'catalog-export', 'download', false, `data-revision="${esc(c.source.revisionId)}" data-project="${esc(state.projectId)}"`) : context.button('catalogGoRoot', 'inspect', 'arrow', false, `data-id="${esc(c.source.rootId)}"`)}</div></div>`;
  }
  return {
    publishModal,
    catalogDetails,
    useModal,
    occurrenceModal,
    checkoutModal,
    updateModal,
    updateReview,
    componentImportDialog,
    catalogInspector,
  };
}
