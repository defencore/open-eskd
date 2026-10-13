import { clone } from '../objects.js';
import { assert } from '../constraints.js';
import { descendants } from '../structure.js';
import { routeError } from '../manufacturing-links.js';
export function catalogAssert(condition, code, message) {
  if (!condition) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }
}

export function fragment(snapshot, rootId) {
  const root = snapshot.components.find((c) => c.id === rootId);
  assert(root, 'Missing component.');
  const ids = descendants(snapshot, rootId);
  const docs = new Set(
    snapshot.documents.filter((d) => ids.has(d.componentId)).map((d) => d.id),
  );
  for (const c of snapshot.components.filter((c) => ids.has(c.id))) {
    for (const step of c.manufacturing.steps) {
      if (
        [...step.dependsOn, ...step.componentInputs].some(
          (ref) => !ids.has(ref.componentId),
        ) ||
        step.documents.some((ref) => !docs.has(ref.documentId))
      )
        throw routeError('route-external', c.designation);
    }
  }
  return {
    meta: {
      ...(snapshot.meta.workflow ? { workflow: snapshot.meta.workflow } : {}),
      name: root.name,
      designation: root.designation,
      owner: root.owner,
      description: root.notes,
    },
    components: snapshot.components
      .filter((c) => ids.has(c.id))
      .map((c) => ({
        ...clone(c),
        parentId: c.id === rootId ? null : c.parentId,
        quantity: c.id === rootId ? 1 : c.quantity,
      })),
    documents: clone(snapshot.documents.filter((d) => ids.has(d.componentId))),
  };
}

export function revisionsFor(project, itemId) {
  return Object.values(project.catalog)
    .filter((r) => r.itemId === itemId)
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
    );
}

export function assertEditable(snapshot, id, { remove = false } = {}) {
  if (!id) return;
  const c = snapshot.components.find((c) => c.id === id);
  catalogAssert(c, 'missing-component', 'Missing component.');
  catalogAssert(
    !c.source || (remove && c.source.rootId === c.id),
    'pinned-component',
    'This component belongs to a pinned revision. Create an editable revision first.',
  );
}
