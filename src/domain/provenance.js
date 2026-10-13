import { assert, keys, text } from './constraints.js';
export const ORIGIN_BASES = ['designed', 'observed', 'supplier', 'unspecified'];
export const ORIGIN_CONFIDENCE = ['unverified', 'measured', 'documented'];
export const WORKFLOWS = ['design', 'decomposition'];
export function provenance(basis = 'designed') {
  return { basis, confidence: 'unverified', reference: '', notes: '' };
}
export function validateProvenance(value) {
  if (value === undefined) return;
  keys(value, ['basis', 'confidence', 'reference', 'notes']);
  assert(
    ORIGIN_BASES.includes(value.basis) &&
      ORIGIN_CONFIDENCE.includes(value.confidence) &&
      text(value.reference, 1000) &&
      text(value.notes, 2000),
    'Invalid component provenance.',
  );
}
