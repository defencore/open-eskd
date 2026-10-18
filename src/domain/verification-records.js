import { assert, validId } from './constraints.js';
import { own } from './objects.js';
import { VERIFICATION_NAMESPACE } from './verification-constants.js';

export function verificationRuns(project) {
  return project.extensions?.[VERIFICATION_NAMESPACE]?.runs || [];
}

export function verificationSnapshot(project, run) {
  assert(
    run && validId(run.commitId) && own(project.commits, run.commitId),
    'Missing verification configuration baseline.',
  );
  if (run.batchId !== null) {
    const batch = project.production.find((item) => item.id === run.batchId);
    assert(
      batch && batch.commitId === run.commitId && batch.branch === run.branch,
      'Verification configuration does not match the frozen work order.',
    );
    return batch.snapshot;
  }
  return project.commits[run.commitId].snapshot;
}

export function verificationFileReferences(project) {
  return verificationRuns(project).flatMap((run) => [
    ...(run.procedurePath
      ? [{ path: run.procedurePath, sha256: null, required: true }]
      : []),
    ...run.artifacts.map(({ path, sha256, required }) => ({
      path,
      sha256,
      required,
    })),
  ]);
}
