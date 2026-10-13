import * as C from '../domain/index.js';
import { esc } from '../shared/html.js';
export function createProvenanceEditor(context) {
  const t = (...args) => context.t(...args);
  function provenanceFields(component) {
    const decomposition = context.snapshot().meta.workflow === 'decomposition';
    const value =
      component.provenance ||
      C.provenance(decomposition ? 'observed' : 'designed');
    return `<details class="form-section"${decomposition ? ' open' : ''}><summary>${esc(t('provenanceTitle'))}</summary><div class="form-grid">${context.guidedSelect(
      'provenanceBasis',
      'provenanceBasis',
      C.ORIGIN_BASES.map((value) => ({ value, label: t('origin_' + value) })),
      value.basis,
    )}${context.guidedSelect(
      'provenanceConfidence',
      'provenanceConfidence',
      C.ORIGIN_CONFIDENCE.map((value) => ({
        value,
        label: t('confidence_' + value),
      })),
      value.confidence,
    )}</div>${context.guidedField('provenanceReference', 'provenanceReference', value.reference, 'maxlength="1000"')}${context.guidedTextarea('provenanceNotes', 'provenanceNotes', value.notes, '', 'maxlength="2000"')}</details>`;
  }
  function provenanceSummary(component) {
    const value = component.provenance;
    if (!value) return '';
    return `<details class="inspector-section"><summary>${esc(t('provenanceTitle'))} · ${esc(t('confidence_' + value.confidence))}</summary><dl>${[
      ['provenanceBasis', t('origin_' + value.basis)],
      ['provenanceReference', value.reference],
      ['provenanceNotes', value.notes],
    ]
      .map(
        ([label, text]) =>
          `<dt>${esc(t(label))}</dt><dd>${esc(text || t('notSet'))}</dd>`,
      )
      .join('')}</dl></details>`;
  }
  function readProvenance(form) {
    const get = (name) =>
      String(form.elements.namedItem(name)?.value || '').trim();
    return {
      basis: get('provenanceBasis'),
      confidence: get('provenanceConfidence'),
      reference: get('provenanceReference'),
      notes: get('provenanceNotes'),
    };
  }
  return { provenanceFields, readProvenance, provenanceSummary };
}
