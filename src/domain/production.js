import { validateBatch, validateProduction } from './production-validation.js';
import { clone, equal, uid, now } from './objects.js';
import { assert } from './constraints.js';
import { working, head } from './project.js';

export function createBatch(project, fields) {
  const batch = {
    ...(fields.extensions ? { extensions: clone(fields.extensions) } : {}),
    id: uid(),
    name: fields.name,
    mode: fields.mode,
    quantity: fields.quantity,
    author: fields.author,
    createdAt: now(),
    commitId: head(project).id,
    version: head(project).version,
    branch: project.activeBranch,
    snapshot: clone(working(project)),
    results: [],
  };
  assert(
    !project.production.some((item) => item.name === batch.name),
    'This batch name already exists.',
  );
  const candidate = { ...project, production: [...project.production, batch] };
  validateProduction(candidate);
  project.production.push(batch);
  return batch;
}

export function recordResult(project, batchId, fields) {
  const batch = project.production.find((item) => item.id === batchId);
  assert(batch, 'Missing production batch.');
  const event = {
    ...(fields.extensions ? { extensions: clone(fields.extensions) } : {}),
    id: uid(),
    createdAt: now(),
    componentId: fields.componentId,
    operationId: fields.operationId,
    accepted: fields.accepted,
    rejected: fields.rejected,
    operator: fields.operator,
    notes: fields.notes,
    evidencePath: fields.evidencePath || '',
  };
  const copy = clone(batch);
  copy.results.push(event);
  validateBatch(copy, project.catalog);
  batch.results.push(event);
  return event;
}

export function mergeProduction(target, incoming) {
  for (const batch of incoming.production) {
    const local = target.production.find((item) => item.id === batch.id);
    if (!local) {
      target.production.push(clone(batch));
      continue;
    }
    assert(
      equal({ ...local, results: [] }, { ...batch, results: [] }),
      'Production batch identity collision.',
    );
    for (const event of batch.results) {
      const existing = local.results.find((item) => item.id === event.id);
      assert(
        !existing || equal(existing, event),
        'Production result identity collision.',
      );
      if (!existing) local.results.push(clone(event));
    }
  }
}
