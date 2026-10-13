import { validateExtensions } from './extensions.js';
import { assert, keys, validId, validDate, text } from './constraints.js';
import { validateSnapshot } from './snapshot-validation.js';
import { own } from './objects.js';
import {
  batchProgress,
  taskResult,
  productionPrerequisites,
  quantityAccepted,
} from './production-plan.js';
import { manufacturingIssues, operationKey } from './manufacturing-links.js';
import { validFilePath } from './file-paths.js';

export function validateBatch(batch, catalog) {
  keys(batch, [
    'id',
    'name',
    'mode',
    'quantity',
    'author',
    'createdAt',
    'commitId',
    'version',
    'branch',
    'snapshot',
    'results',
    'extensions',
  ]);
  validateExtensions(batch.extensions);
  assert(
    validId(batch.id) &&
      text(batch.name, 200) &&
      batch.name.trim() &&
      ['prototype', 'series'].includes(batch.mode) &&
      Number.isSafeInteger(batch.quantity) &&
      batch.quantity > 0 &&
      batch.quantity <= 1000000 &&
      text(batch.author, 200) &&
      batch.author.trim() &&
      validDate(batch.createdAt) &&
      validId(batch.commitId) &&
      text(batch.version, 100) &&
      text(batch.branch, 100),
    'Invalid production batch.',
  );
  validateSnapshot(batch.snapshot, catalog);
  assert(
    Array.isArray(batch.results) && batch.results.length <= 100000,
    'Invalid production result list.',
  );
  const progress = batchProgress(batch);
  const tasks = progress.byKey;
  assert(
    tasks.size > 0,
    'Define at least one operation before issuing a work order.',
  );
  assert(
    manufacturingIssues(batch.snapshot).length === 0,
    'Review changed operation references before issuing a work order.',
  );
  const seen = new Set();
  for (const event of batch.results) {
    keys(event, [
      'id',
      'createdAt',
      'componentId',
      'operationId',
      'accepted',
      'rejected',
      'operator',
      'notes',
      'evidencePath',
      'extensions',
    ]);
    validateExtensions(event.extensions);
    assert(
      validId(event.id) &&
        !seen.has(event.id) &&
        validDate(event.createdAt) &&
        tasks.has(operationKey(event.componentId, event.operationId)) &&
        Number.isFinite(event.accepted) &&
        event.accepted >= 0 &&
        Number.isFinite(event.rejected) &&
        event.rejected >= 0 &&
        event.rejected <= 1000000 &&
        event.accepted + event.rejected > 0 &&
        text(event.operator, 200) &&
        event.operator.trim() &&
        text(event.notes, 2000) &&
        (event.rejected === 0 || event.notes.trim()) &&
        (event.evidencePath === '' || validFilePath(event.evidencePath)),
      'Invalid production result. Add an inspection note for rejected units.',
    );
    seen.add(event.id);
  }
  for (const [key, task] of tasks) {
    const result = taskResult(batch, key, progress);
    assert(
      Number.isFinite(task.quantity) &&
        task.quantity <= Number.MAX_SAFE_INTEGER &&
        (result.accepted <= task.quantity ||
          quantityAccepted(task.quantity, result.accepted)),
      'Accepted quantity exceeds the work order quantity.',
    );
    for (const previous of productionPrerequisites(batch, task, progress))
      if (result.events.length)
        assert(
          quantityAccepted(
            taskResult(batch, previous.key, progress).accepted,
            previous.quantity,
          ),
          'Complete and accept prerequisite operations before recording downstream results.',
        );
  }
}

export function validateProduction(project) {
  assert(
    Array.isArray(project.production) && project.production.length <= 1000,
    'Invalid production batches.',
  );
  const ids = new Set();
  for (const batch of project.production) {
    validateBatch(batch, project.catalog);
    assert(
      !ids.has(batch.id) &&
        own(project.commits, batch.commitId) &&
        batch.version === project.commits[batch.commitId].version,
      'Duplicate batch or missing configuration baseline.',
    );
    ids.add(batch.id);
  }
}
