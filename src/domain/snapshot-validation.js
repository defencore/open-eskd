import { validateExtensions } from './extensions.js';
import { WORKFLOWS } from './provenance.js';
import { assert, keys, text } from './constraints.js';
import { validateComponents } from './component-validation.js';
import { validateDocuments } from './document-validation.js';
import { fileInventory } from './file-paths.js';
import { operationPlan } from './manufacturing.js';
import { validatePinned } from './catalog/pinned-validation.js';

export function validateSnapshot(snapshot, catalog = {}) {
  assert(
    snapshot &&
      snapshot.meta &&
      text(snapshot.meta.name, 200) &&
      snapshot.meta.name.trim(),
    'A project name is required.',
  );
  keys(snapshot, ['meta', 'components', 'documents']);
  keys(snapshot.meta, [
    'name',
    'designation',
    'description',
    'owner',
    'workflow',
    'extensions',
  ]);
  assert(
    snapshot.meta.workflow === undefined ||
      WORKFLOWS.includes(snapshot.meta.workflow),
    'Invalid project workflow.',
  );
  validateExtensions(snapshot.meta.extensions);
  for (const [key, limit] of Object.entries({
    designation: 200,
    description: 10000,
    owner: 200,
  }))
    assert(text(snapshot.meta[key], limit), `Invalid project field: ${key}.`);
  assert(
    Array.isArray(snapshot.components) && snapshot.components.length <= 10000,
    'Invalid component list.',
  );
  assert(
    Array.isArray(snapshot.documents) && snapshot.documents.length <= 10000,
    'Invalid document list.',
  );
  const ids = validateComponents(snapshot, catalog);
  validateDocuments(snapshot, ids);
  fileInventory(snapshot);
  operationPlan(snapshot);
  validatePinned(snapshot, catalog);
  return snapshot;
}
