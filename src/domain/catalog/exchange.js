import { clone, equal, own } from '../objects.js';
import { assert } from '../constraints.js';
import { validateProject } from '../validation.js';
import { catalogAssert } from './fragments.js';
export function mergeCatalog(target, incoming) {
  for (const [id, record] of Object.entries(incoming.catalog)) {
    catalogAssert(
      !own(target.catalog, id) || equal(target.catalog[id], record),
      'catalog-collision',
      'The same catalog revision ID has different content.',
    );
    if (!own(target.catalog, id)) target.catalog[id] = clone(record);
  }
  return target;
}

export function componentPackage(project, revisionId) {
  validateProject(project);
  const record = project.catalog[revisionId];
  assert(record, 'Missing component revision.');
  const selected = new Set();
  const queue = [revisionId];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    if (selected.has(id)) continue;
    selected.add(id);
    const r = project.catalog[id];
    queue.push(...r.parents);
    for (const c of r.snapshot.components) {
      if (c.source) queue.push(c.source.revisionId);
      if (c.baseRevisionId) queue.push(c.baseRevisionId);
    }
  }
  const result = {
    schema: project.schema,
    schemaVersion: project.schemaVersion,
    kind: 'component',
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.createdAt,
    activeBranch: 'main',
    catalog: {},
    production: [],
    fileCheck: null,
    branches: {},
    commits: {},
  };
  for (const id of selected) {
    result.catalog[id] = clone(project.catalog[id]);
  }
  const snapshot = clone(record.snapshot),
    commitId = record.id;
  result.branches.main = { head: commitId, working: snapshot };
  result.commits[commitId] = {
    id: commitId,
    parents: [],
    author: record.author,
    message: record.message.trim() || 'Component revision ' + record.label,
    version: record.label,
    status: record.status,
    createdAt: record.createdAt,
    snapshot: clone(snapshot),
  };
  validateProject(result);
  return result;
}
