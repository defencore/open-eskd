import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';

export function evidenceKind(path) {
  const extension = path.split('.').at(-1).toLowerCase();
  if (['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'].includes(extension))
    return 'video';
  if (['log', 'txt', 'jsonl', 'ndjson'].includes(extension)) return 'log';
  if (['pdf', 'docx', 'md', 'html'].includes(extension)) return 'protocol';
  if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(extension))
    return 'image';
  if (['csv', 'json', 'tsv', 'bin'].includes(extension)) return 'dataset';
  return 'other';
}

export function parseEvidencePaths(text, kind = 'auto', required = true) {
  const paths = text
    .split(/\r?\n/u)
    .map((value) => value.trim().replaceAll('\\', '/'))
    .filter(Boolean);
  C.assert(
    paths.length <= 1000,
    'A test run supports up to 1,000 evidence files.',
  );
  C.assert(
    new Set(paths.map((path) => path.toLowerCase().normalize('NFC'))).size ===
      paths.length,
    'Each evidence path must appear only once in a test run.',
  );
  return paths.map((path) => {
    C.assert(
      C.validFilePath(path),
      'Use portable relative evidence paths without parent traversal: ' + path,
    );
    return {
      id: C.uid(),
      title: path.split('/').at(-1),
      kind: kind === 'auto' ? evidenceKind(path) : kind,
      path,
      sha256: null,
      required,
      notes: '',
    };
  });
}

export function createVerificationEvidenceEditor(context) {
  const t = (key) => context.t(key);
  function evidenceRow(artifact) {
    const prefix = 'evidence-' + artifact.id + '-';
    const field = (key, label, value, extra = '', type = 'text') =>
      context.guidedField(
        label,
        prefix + key,
        value,
        `${extra} data-evidence-field="${key}"`,
        type,
      );
    return `<article class="evidence-draft" data-evidence-row data-id="${esc(artifact.id)}"><div class="evidence-draft-main">${field('path', 'filePath', artifact.path, 'required maxlength="800"')}${context.guidedSelect(
      'verificationEvidenceKind',
      prefix + 'kind',
      C.EVIDENCE_KINDS.map((value) => ({
        value,
        label: t('verificationArtifactKind_' + value),
      })),
      artifact.kind,
      'data-evidence-field="kind"',
    )}${context.iconButton('delete', 'verification-remove-evidence', 'trash')}</div><details><summary>${esc(t('verificationEvidenceMetadata'))}</summary><div class="form-grid">${field('title', 'verificationEvidenceTitle', artifact.title, 'required maxlength="300"')}${context.guidedSelect(
      'verificationEvidenceRequired',
      prefix + 'required',
      [
        { value: 'true', label: t('requiredFile') },
        { value: 'false', label: t('optionalFile') },
      ],
      String(artifact.required),
      'data-evidence-field="required"',
    )}</div>${field('sha256', 'fileHash', artifact.sha256 || '', 'maxlength="64" pattern="[a-f0-9]{64}"')}${context.guidedTextarea('verificationEvidenceNotes', prefix + 'notes', artifact.notes, '', 'maxlength="2000" data-evidence-field="notes"')}</details></article>`;
  }
  function verificationEvidenceEditor() {
    return `<section class="evidence-editor"><h3>${esc(t('verificationArtifacts'))}</h3><p class="muted">${esc(t('verificationBulkHint'))}</p>${context.guidedTextarea('verificationEvidencePaths', 'evidencePaths', '', '', 'maxlength="900000" rows="4" data-evidence-paths')}<div class="evidence-bulk-actions">${context.guidedSelect('verificationEvidenceKind', 'bulkEvidenceKind', [{ value: 'auto', label: t('verificationAutoKind') }, ...C.EVIDENCE_KINDS.map((value) => ({ value, label: t('verificationArtifactKind_' + value) }))], 'auto')}${context.guidedSelect(
      'verificationEvidenceRequired',
      'bulkEvidenceRequired',
      [
        { value: 'true', label: t('requiredFile') },
        { value: 'false', label: t('optionalFile') },
      ],
      'true',
    )}${context.button('verificationAddPaths', 'verification-add-paths', 'plus')}</div><div data-evidence-list></div></section>`;
  }
  function pendingPaths(form) {
    return parseEvidencePaths(
      form.elements.namedItem('evidencePaths').value,
      form.elements.namedItem('bulkEvidenceKind').value,
      form.elements.namedItem('bulkEvidenceRequired').value === 'true',
    );
  }
  function addVerificationPaths(form) {
    const artifacts = pendingPaths(form);
    const existing = readRows(form);
    C.assert(
      existing.length + artifacts.length <= 1000,
      t('verificationEvidenceLimit'),
    );
    C.assert(
      new Set(
        [...existing, ...artifacts].map((item) =>
          item.path.toLowerCase().normalize('NFC'),
        ),
      ).size ===
        existing.length + artifacts.length,
      t('verificationDuplicatePath'),
    );
    form
      .querySelector('[data-evidence-list]')
      .insertAdjacentHTML('beforeend', artifacts.map(evidenceRow).join(''));
    form.elements.namedItem('evidencePaths').value = '';
  }
  function readRows(form) {
    return [...form.querySelectorAll('[data-evidence-row]')].map((row) => {
      const get = (name) =>
        row.querySelector(`[data-evidence-field="${name}"]`).value.trim();
      return {
        id: row.dataset.id,
        title: get('title'),
        kind: get('kind'),
        path: get('path').replaceAll('\\', '/'),
        sha256: get('sha256') || null,
        required: get('required') === 'true',
        notes: get('notes'),
      };
    });
  }
  function readVerificationEvidence(form) {
    return [...readRows(form), ...pendingPaths(form)];
  }
  return {
    verificationEvidenceEditor,
    addVerificationPaths,
    readVerificationEvidence,
  };
}
