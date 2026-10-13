import { esc } from '../shared/html.js';
import { routeLinkLines } from '../domain/manufacturing-description.js';

export function routeLinksHTML(step, index, t) {
  const lines = routeLinkLines({ ...step, documents: [] }, index, t);
  const docs = step.documents.map((ref) => {
    const name = index.documentNames.get(ref.documentId) || ref.documentId;
    return `<li>${esc(t('routeDocuments'))}: <button type="button" class="text-link" data-action="preview-document" data-id="${esc(ref.documentId)}">${esc(name)}</button><span class="production-doc-name">${esc(name)}</span> · ${esc(t('revision'))} ${esc(ref.revision)}</li>`;
  });
  return lines.length || docs.length
    ? `<ul class="operation-references">${lines.map((line) => `<li>${esc(line)}</li>`).join('')}${docs.join('')}</ul>`
    : '';
}
