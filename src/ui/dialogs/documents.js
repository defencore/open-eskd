import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';

export function createDocumentsDialogs(context) {
  const t = (...args) => context.t(...args);
  function documentModal(id = null, componentId = null) {
    const s = context.snapshot();
    const existing = s.documents.find((d) => d.id === id);
    const c = s.components.find(
      (c) => c.id === (existing?.componentId || componentId),
    );
    const d = existing || {
      id: '',
      name: '',
      path: C.suggestedPath(c),
      componentId: c?.id || null,
      kind: 'drawing',
      revision: c?.revision || 'A',
      sha256: null,
      required: true,
    };
    C.assertEditable(s, d.componentId);
    context.showModal(
      existing ? 'editDocument' : 'addReference',
      `<input type="hidden" name="id" value="${esc(d.id)}"><p class="modal-description">${esc(t('referenceHint'))}</p>${context.guidedSelect(
        'component',
        'componentId',
        [
          { value: '', label: t('projectLevel') },
          ...C.flatten(s)
            .filter((c) => !c.source)
            .map((c) => ({
              value: c.id,
              label: c.designation + ' · ' + c.name,
            })),
        ],
        d.componentId || '',
      )}${context.guidedSelect(
        'documentType',
        'kind',
        C.DOC_TYPES.map((value) => ({ value, label: t(value) })),
        d.kind,
      )}<div class="form-grid">${context.guidedField('filePath', 'path', d.path, 'maxlength="800" required')}${context.guidedField('documentRevision', 'revision', d.revision, 'maxlength="100" required')}</div><button type="button" class="button small" data-action="suggest-file-path">${esc(t('suggestFilePath'))}</button>${context.guidedField('fileHash', 'sha256', d.sha256 || '', 'maxlength="64" pattern="[a-f0-9]{64}"')}${context.guidedSelect(
        'fileRequirement',
        'required',
        [
          { value: 'true', label: t('requiredFile') },
          { value: 'false', label: t('optionalFile') },
        ],
        String(d.required),
      )}`,
      'document',
    );
  }
  function previewDocument(id) {
    const d = context.snapshot().documents.find((d) => d.id === id);
    context.showModal(
      'fileReference',
      `<p>${esc(t('localReferencePreview'))}</p><pre class="text-preview">${esc(d.path)}</pre><p>${esc(t('revision'))}: ${esc(d.revision)}</p><p>${esc(d.sha256 || t('noFileHash'))}</p>${context.button('copyPath', 'copy-file-path', 'copy', false, `data-id="${esc(id)}"`)}`,
    );
  }
  return { documentModal, previewDocument };
}
