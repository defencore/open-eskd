import { icon } from '../icons.js';
import { esc } from '../../shared/html.js';
export function createDocumentsView(context) {
  const t = (...args) => context.t(...args);
  function renderDocuments() {
    const s = context.snapshot(),
      q = context.state.search.toLowerCase();
    const docs = s.documents.filter((d) =>
      [d.name, d.path].some((value) => value.toLowerCase().includes(q)),
    );
    return `${context.titleRow('documents', context.button('addReference', 'add-files', 'plus', true))}${context.workflowBar(1)}<p class="hint">${esc(t('referenceHint'))}</p>${context.fileWorkspace()}<div class="workspace-toolbar"><label class="search">${icon('search')}<input data-search="documents" placeholder="${esc(t('searchDocuments'))}" aria-label="${esc(t('searchDocuments'))}" value="${esc(context.state.search)}"></label><span>${s.documents.length} ${esc(t('files'))}</span></div><section class="panel">${docs.length ? documentTable(docs) : context.empty('noDocuments', 'noDocumentsText')}</section>`;
  }
  function documentTable(docs, s = context.snapshot(), historical = false) {
    return `<div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('filePath'))}</th><th>${esc(t('documentType'))}</th><th class="optional">${esc(t('component'))}</th><th>${esc(t('revision'))}</th><th>${esc(t('fileRequirement'))}</th><th></th></tr></thead><tbody>${docs
      .map((d) => {
        const c = s.components.find((c) => c.id === d.componentId);
        return `<tr><td><strong>${esc(d.name)}</strong><small class="component-sub code">${esc(d.path)}</small></td><td>${esc(t(d.kind))}</td><td class="optional">${esc(c?.designation || t('projectLevel'))}</td><td>${esc(d.revision)}</td><td>${esc(t(d.required ? 'requiredFile' : 'optionalFile'))}</td><td><div class="table-actions">${historical ? '' : context.iconButton('preview', 'preview-document', 'info', d.id) + (!c?.source ? context.iconButton('edit', 'edit-document', 'edit', d.id) + context.iconButton('delete', 'delete-document', 'trash', d.id) : '')}</div></td></tr>`;
      })
      .join('')}</tbody></table></div>`;
  }
  return { renderDocuments, documentTable };
}
