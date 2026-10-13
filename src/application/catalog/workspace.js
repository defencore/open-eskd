import { flatten } from '../../domain/structure.js';
import {
  mergeCatalog,
  clone,
  validateProject,
  componentPackage,
} from '../../domain/index.js';

export function workspaceRevisions(projects, activeId) {
  const result = new Map();
  const ordered = [...projects].sort(
    (a, b) => Number(b.id === activeId) - Number(a.id === activeId),
  );
  for (const project of ordered)
    for (const record of Object.values(project.catalog)) {
      if (!result.has(record.id))
        result.set(record.id, {
          record,
          projectId: project.id,
          projectName: project.branches[project.activeBranch].working.meta.name,
        });
    }
  return [...result.values()].sort(
    (a, b) =>
      b.record.createdAt.localeCompare(a.record.createdAt) ||
      b.record.label.localeCompare(a.record.label, undefined, {
        numeric: true,
      }) ||
      b.record.id.localeCompare(a.record.id),
  );
}
export function importCatalog(project, incoming, revisionId = null) {
  validateProject(incoming);
  const candidate = mergeCatalog(
    clone(project),
    revisionId ? componentPackage(incoming, revisionId) : incoming,
  );
  validateProject(candidate);
  return candidate;
}

export function whereUsed(projects, itemId) {
  const result = [];
  for (const project of projects) {
    const snapshot = project.branches[project.activeBranch].working;
    for (const c of flatten(snapshot).filter(
      (c) => c.definitionId === itemId,
    )) {
      const parent = snapshot.components.find((p) => p.id === c.parentId);
      result.push({
        projectId: project.id,
        projectName: snapshot.meta.name,
        componentId: c.id,
        revision: c.revision,
        quantity: c.totalQuantity,
        parent: parent?.designation || '',
        pinned: Boolean(c.source),
      });
    }
  }
  return result;
}
