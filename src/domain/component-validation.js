import { validateProvenance } from './provenance.js';
import { validateExtensions } from './extensions.js';
import { assert, keys, text, validId } from './constraints.js';
import { TYPES, STATUSES } from './constants.js';
import { own } from './objects.js';
import { validateManufacturing } from './manufacturing.js';

export function validateComponents(snapshot, catalog) {
  const ids = new Set();
  const designations = new Map();
  for (const c of snapshot.components) {
    assert(
      c && validId(c.id) && !ids.has(c.id),
      'Component IDs must be unique.',
    );
    keys(c, [
      'id',
      'definitionId',
      'source',
      'baseRevisionId',
      'parentId',
      'name',
      'designation',
      'type',
      'quantity',
      'status',
      'revision',
      'material',
      'manufacturer',
      'process',
      'manufacturing',
      'owner',
      'notes',
      'unit',
      'provenance',
      'extensions',
    ]);
    validateProvenance(c.provenance);
    validateExtensions(c.extensions);
    ids.add(c.id);
    validateManufacturing(c.manufacturing);
    assert(
      text(c.name, 200) &&
        c.name.trim() &&
        text(c.designation, 200) &&
        c.designation.trim(),
      'Component name and designation are required.',
    );
    assert(
      !designations.has(c.designation.trim().toLowerCase()) ||
        designations.get(c.designation.trim().toLowerCase()) === c.definitionId,
      `Duplicate designation: ${c.designation}.`,
    );
    assert(
      validId(c.definitionId) &&
        (c.source === null || typeof c.source === 'object'),
      'Invalid component definition or reference.',
    );
    designations.set(c.designation.trim().toLowerCase(), c.definitionId);
    assert(
      c.baseRevisionId === null ||
        (own(catalog, c.baseRevisionId) &&
          catalog[c.baseRevisionId].itemId === c.definitionId),
      'Invalid component revision base.',
    );
    assert(
      TYPES.includes(c.type) && STATUSES.includes(c.status),
      'Invalid component type or status.',
    );
    assert(
      Number.isFinite(c.quantity) && c.quantity > 0 && c.quantity <= 1000000,
      'Quantity must be greater than zero.',
    );
    assert(c.parentId === null || text(c.parentId, 100), 'Invalid parent ID.');
    for (const [key, limit] of Object.entries({
      revision: 100,
      material: 200,
      manufacturer: 200,
      process: 1000,
      owner: 200,
      notes: 10000,
      unit: 100,
    }))
      assert(text(c[key], limit), `Invalid component field: ${key}.`);
    assert(
      c.revision.trim() && c.unit.trim(),
      'Component revision and unit are required.',
    );
  }
  const byId = new Map(snapshot.components.map((c) => [c.id, c]));
  for (const c of snapshot.components) {
    assert(
      c.parentId === null || ids.has(c.parentId),
      `Missing parent of ${c.designation}.`,
    );
    if (c.parentId)
      assert(
        ['assembly', 'complex', 'set'].includes(byId.get(c.parentId).type),
        'Only assemblies, complexes and sets can contain components.',
      );
    const visited = new Set([c.id]);
    let total = c.quantity;
    let parent = c.parentId;
    while (parent) {
      assert(!visited.has(parent), 'The component structure contains a cycle.');
      visited.add(parent);
      assert(
        visited.size <= 64,
        'The component structure exceeds the 64-level depth limit.',
      );
      assert(
        byId.get(parent).definitionId !== c.definitionId,
        'A component cannot contain itself.',
      );
      total *= byId.get(parent).quantity;
      assert(
        Number.isFinite(total) && total > 0 && total <= Number.MAX_SAFE_INTEGER,
        'Total quantity exceeds the supported numeric range.',
      );
      parent = byId.get(parent).parentId;
    }
  }
  return ids;
}
