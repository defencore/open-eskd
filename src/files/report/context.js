import * as C from '../../domain/index.js';
import { translate } from '../../i18n/index.js';
import { routeLinkIndex } from '../../domain/manufacturing-description.js';
import { configurationFingerprint } from '../filesystem.js';
import { verificationReportRuns } from './verification.js';

export async function reportContext(project, language, batch, facility) {
  C.validateProject(project);
  C.assert(
    ['en', 'ua'].includes(language),
    'Choose English or Ukrainian for the report.',
  );
  C.assert(
    facility === null || C.text(facility, 2000),
    'Invalid facility filter.',
  );
  if (batch !== null)
    C.assert(
      project.production.some((record) => C.equal(record, batch)),
      'Choose a batch from this project.',
    );
  project = C.clone(project);
  batch = batch === null ? null : C.clone(batch);
  const t = (key) => translate(language, key),
    snapshot = batch ? batch.snapshot : C.clone(C.working(project)),
    version = batch ? batch.version : C.head(project).version,
    branch = batch ? batch.branch : project.activeBranch,
    fileCheck = C.clone(project.fileCheck),
    fingerprint = await configurationFingerprint(project, snapshot),
    currentCheck = fileCheck?.fingerprint === fingerprint ? fileCheck : null,
    progress = batch ? C.batchProgress(batch) : null,
    plan = batch
      ? progress.tasks
      : C.operationPlan(snapshot).filter((task) => task.step),
    tasks =
      facility === null
        ? plan
        : plan.filter(
            (task) =>
              (task.step.facility || task.component.manufacturer || '') ===
              facility,
          ),
    relevant = new Set(
      tasks.flatMap((task) => [
        task.component.id,
        ...task.step.componentInputs.map((ref) => ref.componentId),
      ]),
    ),
    docIds = new Set(
      tasks.flatMap((task) => task.step.documents.map((ref) => ref.documentId)),
    ),
    documents =
      facility === null
        ? snapshot.documents
        : snapshot.documents.filter(
            (doc) => relevant.has(doc.componentId) || docIds.has(doc.id),
          ),
    components = C.flatten(snapshot).filter(
      (c) => facility === null || relevant.has(c.id),
    ),
    issues = C.readiness(snapshot).filter(
      (issue) => facility === null || relevant.has(issue.componentId),
    ),
    documentsByComponent = new Map();
  for (const doc of documents) {
    if (!documentsByComponent.has(doc.componentId))
      documentsByComponent.set(doc.componentId, []);
    documentsByComponent.get(doc.componentId).push(doc);
  }
  return {
    version,
    branch,
    hadFileCheck: fileCheck !== null,
    language,
    batch,
    facility,
    t,
    snapshot,
    fingerprint,
    currentCheck,
    checks: new Map(
      (currentCheck?.files || []).map((file) => [file.path, file.status]),
    ),
    progress,
    tasks,
    documents,
    documentsByComponent,
    components,
    issues,
    verificationRuns: verificationReportRuns(project, batch, facility),
    index: routeLinkIndex(snapshot, t),
    heading: batch ? batch.name : snapshot.meta.name,
  };
}
