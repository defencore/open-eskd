import { validateExtensions } from '../extensions.js';
import { own } from '../objects.js';
import { assert, text, keys, validId, validDate } from '../constraints.js';
import { validateSnapshot } from '../snapshot-validation.js';
import { readiness } from '../readiness.js';

export function validateCatalog(catalog) {
  assert(
    catalog &&
      typeof catalog === 'object' &&
      !Array.isArray(catalog) &&
      Object.keys(catalog).length <= 5000,
    'Invalid component catalog.',
  );
  for (const [id, record] of Object.entries(catalog)) {
    keys(record, [
      'id',
      'itemId',
      'parents',
      'label',
      'author',
      'message',
      'status',
      'createdAt',
      'snapshot',
      'extensions',
    ]);
    validateExtensions(record.extensions);
    assert(
      validId(id) && record.id === id && validId(record.itemId),
      'Invalid catalog revision identity.',
    );
    assert(
      text(record.label, 100) &&
        record.label.trim() &&
        text(record.author, 200) &&
        record.author.trim() &&
        text(record.message) &&
        validDate(record.createdAt) &&
        ['draft', 'review', 'released'].includes(record.status),
      'Invalid catalog revision metadata.',
    );
    assert(
      Array.isArray(record.parents) &&
        record.parents.length <= 1 &&
        record.parents.every(
          (id) =>
            validId(id) &&
            own(catalog, id) &&
            catalog[id].itemId === record.itemId &&
            id !== record.id,
        ),
      'Invalid component revision ancestry.',
    );
    validateSnapshot(record.snapshot, catalog);
    const roots = record.snapshot.components.filter((c) => c.parentId === null);
    assert(
      roots.length === 1 &&
        roots[0].definitionId === record.itemId &&
        roots[0].quantity === 1 &&
        roots[0].source === null &&
        roots[0].revision === record.label,
      'Invalid catalog revision structure.',
    );
    assert(
      !record.snapshot.components
        .slice()
        .filter((c) => c.id !== roots[0].id)
        .some((c) => c.definitionId === record.itemId),
      'A component cannot contain itself.',
    );
    if (record.status === 'released')
      assert(
        readiness(record.snapshot).length === 0,
        'A released catalog revision is incomplete.',
      );
  }
  const pending = new Map(
    Object.values(catalog).map((r) => [r.id, r.parents.length]),
  );
  const dependents = new Map(Object.keys(catalog).map((id) => [id, []]));
  for (const record of Object.values(catalog))
    for (const parent of record.parents) dependents.get(parent).push(record.id);
  const queue = [...pending.keys()].filter((id) => pending.get(id) === 0);
  for (let i = 0; i < queue.length; i++)
    for (const child of dependents.get(queue[i])) {
      pending.set(child, pending.get(child) - 1);
      if (pending.get(child) === 0) queue.push(child);
    }
  assert(queue.length === pending.size, 'Catalog revision ancestry cycle.');
  const visiting = new Set(),
    visited = new Set();
  function visit(id, itemPath = new Set(), depth = 0) {
    assert(
      depth <= 64 && !visiting.has(id),
      'Catalog dependency cycle or depth limit.',
    );
    const record = catalog[id];
    assert(
      record && !itemPath.has(record.itemId),
      'A component cannot depend on itself.',
    );
    if (visited.has(id)) return;
    const next = new Set([...itemPath, record.itemId]);
    visiting.add(id);
    for (const childId of new Set(
      record.snapshot.components
        .filter((c) => c.source)
        .map((c) => c.source.revisionId),
    ))
      visit(childId, next, depth + 1);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of Object.keys(catalog)) visit(id);
}
