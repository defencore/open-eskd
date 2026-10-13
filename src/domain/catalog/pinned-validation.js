import { equal, own } from '../objects.js';
import { assert, keys, validId } from '../constraints.js';
import { childIndex } from '../structure.js';
import { DEFINITION_FIELDS } from '../components.js';
import { remapManufacturing } from '../manufacturing-links.js';

export function validatePinned(snapshot, catalog) {
  const roots = snapshot.components.filter((c) => c.source?.rootId === c.id);
  const rootMap = new Map(roots.map((root) => [root.id, root]));
  const placements = new Map(roots.map((root) => [root.id, []]));
  const children = childIndex(snapshot);
  const docsByComponent = new Map();
  for (const doc of snapshot.documents) {
    if (!docsByComponent.has(doc.componentId))
      docsByComponent.set(doc.componentId, []);
    docsByComponent.get(doc.componentId).push(doc);
  }
  function countDescendants(id) {
    let count = 0;
    const queue = [id];
    for (let i = 0; i < queue.length; i++) {
      count++;
      for (const c of children.get(queue[i]) || []) queue.push(c.id);
    }
    return count;
  }
  for (const c of snapshot.components)
    if (c.source) {
      keys(c.source, ['revisionId', 'componentId', 'rootId']);
      assert(
        validId(c.source.revisionId) &&
          validId(c.source.componentId) &&
          validId(c.source.rootId),
        'Invalid catalog reference.',
      );
      assert(
        own(catalog, c.source.revisionId),
        'Missing pinned component revision.',
      );
      assert(
        rootMap.get(c.source.rootId)?.source.revisionId === c.source.revisionId,
        'Missing pinned occurrence root.',
      );
      placements.get(c.source.rootId).push(c);
    }
  for (const root of roots) {
    const record = catalog[root.source.revisionId];
    const expectedRoot = record.snapshot.components.find(
      (c) => c.parentId === null,
    );
    assert(
      expectedRoot &&
        root.source.componentId === expectedRoot.id &&
        root.definitionId === record.itemId,
      'Invalid pinned revision root.',
    );
    const actual = placements.get(root.id);
    assert(
      actual.length === record.snapshot.components.length &&
        countDescendants(root.id) === actual.length,
      'Pinned component structure changed.',
    );
    const mapping = new Map(actual.map((c) => [c.source.componentId, c]));
    assert(
      mapping.size === actual.length,
      'Duplicate pinned component placement.',
    );
    const ids = new Set(actual.map((c) => c.id));
    const documents = [...ids].flatMap((id) => docsByComponent.get(id) || []);
    const signature = (d) =>
      JSON.stringify([
        d.name,
        d.path,
        d.componentId,
        d.kind,
        d.revision,
        d.sha256,
        d.required,
        d.extensions,
      ]);
    const documentSlots = new Map();
    for (const doc of documents) {
      const key = signature(doc);
      if (!documentSlots.has(key)) documentSlots.set(key, []);
      documentSlots.get(key).push(doc.id);
    }
    const documentMapping = new Map();
    const expectedDocs = record.snapshot.documents.map((d) => ({
      ...d,
      componentId: mapping.get(d.componentId)?.id,
    }));
    record.snapshot.documents.forEach((doc, index) =>
      documentMapping.set(
        doc.id,
        documentSlots.get(signature(expectedDocs[index]))?.shift(),
      ),
    );
    const componentMapping = new Map([...mapping].map(([id, c]) => [id, c.id]));
    const revisionMapping = new Map(
      record.snapshot.components.map((c) => [
        c.id,
        {
          revision: c.revision,
          before: c.source?.revisionId || null,
          after: record.id,
        },
      ]),
    );
    for (const expected of record.snapshot.components) {
      const c = mapping.get(expected.id);
      assert(
        c &&
          c.source.revisionId === record.id &&
          DEFINITION_FIELDS.every((field) =>
            equal(
              c[field],
              field === 'manufacturing'
                ? remapManufacturing(
                    expected[field],
                    componentMapping,
                    documentMapping,
                    revisionMapping,
                  )
                : expected[field],
            ),
          ),
        'Pinned component definition changed.',
      );
      if (expected.id !== expectedRoot.id)
        assert(
          c.parentId === mapping.get(expected.parentId)?.id &&
            c.quantity === expected.quantity,
          'Pinned component structure changed.',
        );
    }
    assert(
      equal(
        documents.map(signature).sort(),
        expectedDocs.map(signature).sort(),
      ),
      'Pinned component documentation changed.',
    );
  }
}
