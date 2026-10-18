import { relativeFileUrl } from '../../domain/file-paths.js';
import { esc } from '../../shared/html.js';

export function reportDocumentLinks(documents, { t, checks }) {
  return documents
    .map(
      (doc) =>
        `<li><a href="${esc(relativeFileUrl(doc.path))}">${esc(doc.name)}</a> · ${esc(t('revision'))} ${esc(doc.revision)} · <code>${esc(doc.path)}</code> · ${esc(t('fileStatus_' + (checks.get(doc.path) || 'unknown')))}${doc.required ? '' : ' · ' + esc(t('optionalFile'))}</li>`,
    )
    .join('');
}

export function reportFields(fields, t) {
  return `<dl>${fields.map(([key, value]) => `<dt>${esc(t(key))}</dt><dd>${esc(value || '—')}</dd>`).join('')}</dl>`;
}
