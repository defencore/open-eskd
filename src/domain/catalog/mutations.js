import { clone, uid, now } from '../objects.js';
import { assert, text } from '../constraints.js';
import { validateProject } from '../validation.js';
import { working } from '../project.js';
import { descendants } from '../structure.js';
import { CONTAINER_TYPES } from '../components.js';
import { remapManufacturing } from '../manufacturing-links.js';
import {
  catalogAssert,
  assertEditable,
  fragment,
  revisionsFor,
} from './fragments.js';
function paths(snapshot, rootId) {
  const map = new Map();
  function walk(id, path) {
    map.set(id, JSON.stringify(path));
    const counts = new Map();
    for (const c of snapshot.components.filter((c) => c.parentId === id)) {
      const n = counts.get(c.definitionId) || 0;
      counts.set(c.definitionId, n + 1);
      walk(c.id, [...path, [c.definitionId, n]]);
    }
  }
  walk(rootId, []);
  return map;
}

function insert(
  project,
  revisionId,
  parentId,
  quantity,
  { rootId = null, editable = false } = {},
) {
  const record = project.catalog[revisionId];
  catalogAssert(record, 'missing-revision', 'Missing component revision.');
  const s = working(project),
    template = record.snapshot;
  if (parentId) {
    assertEditable(s, parentId);
    assert(
      CONTAINER_TYPES.includes(
        s.components.find((c) => c.id === parentId)?.type,
      ),
      'Only assemblies, complexes and sets can contain components.',
    );
  }
  const templateRoot = template.components.find((c) => c.parentId === null);
  const old = rootId ? fragment(s, rootId) : null;
  const oldPaths = old ? paths(old, rootId) : new Map();
  const idsByPath = new Map([...oldPaths].map(([id, path]) => [path, id]));
  const newPaths = paths(template, templateRoot.id);
  const mapping = new Map(
    template.components.map((c) => [
      c.id,
      idsByPath.get(newPaths.get(c.id)) ||
        (c.id === templateRoot.id && rootId) ||
        uid(),
    ]),
  );
  const id = mapping.get(templateRoot.id);
  if (rootId) {
    const removed = descendants(s, rootId);
    s.components = s.components.filter((c) => !removed.has(c.id));
    s.documents = s.documents.filter((d) => !removed.has(d.componentId));
  }
  const documentSlots = new Map();
  const slot = (d) => JSON.stringify([d.name, d.path, d.componentId, d.kind]);
  for (const d of old?.documents || []) {
    const key = slot(d);
    if (!documentSlots.has(key)) documentSlots.set(key, []);
    documentSlots.get(key).push(d.id);
  }
  const documentMapping = new Map();
  const logicalSlot = (d) => JSON.stringify([d.componentId, d.kind]);
  const oldLogicalSlots = new Map();
  const newLogicalCounts = new Map();
  for (const d of old?.documents || []) {
    const key = logicalSlot(d);
    if (!oldLogicalSlots.has(key)) oldLogicalSlots.set(key, []);
    oldLogicalSlots.get(key).push(d.id);
  }
  for (const d of template.documents) {
    const key = logicalSlot({ ...d, componentId: mapping.get(d.componentId) });
    newLogicalCounts.set(key, (newLogicalCounts.get(key) || 0) + 1);
  }
  const usedDocuments = new Set();
  const revisionMapping = new Map(
    template.components.map((c) => [
      c.id,
      {
        revision: c.revision,
        before: c.source?.revisionId || null,
        after: editable ? c.source?.revisionId || null : revisionId,
      },
    ]),
  );
  const documents = template.documents.map((d) => {
    const copy = { ...clone(d), componentId: mapping.get(d.componentId) };
    const exact = documentSlots
      .get(slot(copy))
      ?.find((id) => !usedDocuments.has(id));
    const logical = logicalSlot(copy),
      candidates = oldLogicalSlots.get(logical) || [];
    const unambiguous =
      candidates.length === 1 &&
      newLogicalCounts.get(logical) === 1 &&
      !usedDocuments.has(candidates[0])
        ? candidates[0]
        : null;
    copy.id = exact || unambiguous || uid();
    usedDocuments.add(copy.id);
    documentMapping.set(d.id, copy.id);
    return copy;
  });
  for (const c of template.components) {
    const source = editable
      ? c.source && { ...c.source, rootId: mapping.get(c.source.rootId) }
      : { revisionId, componentId: c.id, rootId: id };
    s.components.push({
      ...clone(c),
      id: mapping.get(c.id),
      parentId: c.id === templateRoot.id ? parentId : mapping.get(c.parentId),
      quantity: c.id === templateRoot.id ? quantity : c.quantity,
      manufacturing: remapManufacturing(
        c.manufacturing,
        mapping,
        documentMapping,
        revisionMapping,
      ),
      source,
    });
  }
  s.documents.push(...documents);
  return id;
}

export function useRevision(
  project,
  revisionId,
  parentId = null,
  quantity = 1,
) {
  const candidate = clone(project);
  const id = insert(candidate, revisionId, parentId, quantity);
  validateProject(candidate);
  return { project: candidate, id };
}

export function publishComponent(
  project,
  rootId,
  { label, author, message = '', status = 'draft' },
) {
  const candidate = clone(project),
    s = working(candidate);
  assertEditable(s, rootId);
  catalogAssert(
    text(label, 100) &&
      label.trim() &&
      text(author, 200) &&
      author.trim() &&
      text(message),
    'revision-fields',
    'Revision label and author are required.',
  );
  const root = s.components.find((c) => c.id === rootId);
  catalogAssert(
    !revisionsFor(candidate, root.definitionId).some(
      (r) => r.label === label.trim(),
    ),
    'revision-label',
    'This component revision label already exists.',
  );
  const parents = root.baseRevisionId ? [root.baseRevisionId] : [];
  const members = descendants(s, rootId);
  for (const c of s.components.filter((c) => members.has(c.id)))
    for (const step of c.manufacturing.steps)
      for (const ref of step.dependsOn) {
        if (
          ref.componentId === rootId &&
          ref.revision === root.revision &&
          ref.catalogRevisionId === null
        )
          ref.revision = label.trim();
      }
  root.baseRevisionId = null;
  root.revision = label.trim();
  const snapshot = fragment(s, rootId),
    record = {
      id: uid(),
      itemId: root.definitionId,
      parents,
      label: label.trim(),
      author: author.trim(),
      message,
      status,
      createdAt: now(),
      snapshot,
    };
  candidate.catalog[record.id] = record;
  insert(candidate, record.id, root.parentId, root.quantity, { rootId });
  validateProject(candidate);
  return { project: candidate, record };
}

export function checkoutComponent(project, rootId) {
  const candidate = clone(project),
    root = working(candidate).components.find((c) => c.id === rootId);
  catalogAssert(
    root?.source?.rootId === rootId,
    'pinned-root',
    'Select the root of a catalog component.',
  );
  insert(candidate, root.source.revisionId, root.parentId, root.quantity, {
    rootId,
    editable: true,
  });
  working(candidate).components.find((c) => c.id === rootId).baseRevisionId =
    root.source.revisionId;
  validateProject(candidate);
  return candidate;
}

export function updateOccurrence(project, rootId, revisionId) {
  const candidate = clone(project),
    root = working(candidate).components.find((c) => c.id === rootId);
  catalogAssert(
    root?.source?.rootId === rootId,
    'pinned-root',
    'Select the root of a catalog component.',
  );
  catalogAssert(
    candidate.catalog[revisionId]?.itemId === root.definitionId,
    'different-component',
    'Choose a revision of the same component.',
  );
  insert(candidate, revisionId, root.parentId, root.quantity, { rootId });
  validateProject(candidate);
  return candidate;
}

export function configureOccurrence(project, rootId, parentId, quantity) {
  const candidate = clone(project),
    root = working(candidate).components.find((c) => c.id === rootId);
  catalogAssert(
    root?.source?.rootId === rootId,
    'pinned-root',
    'Select the root of a catalog component.',
  );
  if (parentId) assertEditable(working(candidate), parentId);
  root.parentId = parentId;
  root.quantity = quantity;
  validateProject(candidate);
  return candidate;
}
