import { verificationRuns, verificationSnapshot } from '../domain/index.js';

export function filterVerificationRuns(
  project,
  { query = '', outcome = '', componentId = '', batchId = '' } = {},
) {
  const search = query.trim().toLocaleLowerCase();
  return verificationRuns(project)
    .filter((run) => {
      if (outcome && run.outcome !== outcome) return false;
      if (componentId && run.componentId !== componentId) return false;
      if (batchId && run.batchId !== batchId) return false;
      if (!search) return true;
      const snapshot = verificationSnapshot(project, run);
      const component = snapshot.components.find(
        (item) => item.id === run.componentId,
      );
      return [
        run.name,
        run.testCase,
        run.operator,
        run.summary,
        run.procedurePath,
        component?.name || '',
        component?.designation || '',
        project.commits[run.commitId].version,
        ...run.artifacts.flatMap((artifact) => [
          artifact.title,
          artifact.path,
          artifact.notes,
        ]),
      ].some((value) => value.toLocaleLowerCase().includes(search));
    })
    .sort(
      (a, b) =>
        new Date(b.performedAt) - new Date(a.performedAt) ||
        a.id.localeCompare(b.id),
    );
}

export function filterVerificationArtifacts(
  run,
  { query = '', kind = '' } = {},
) {
  const search = query.trim().toLocaleLowerCase();
  return run.artifacts.filter(
    (artifact) =>
      (!kind || artifact.kind === kind) &&
      [
        artifact.title,
        artifact.path,
        artifact.notes,
        artifact.sha256 || '',
      ].some((value) => value.toLocaleLowerCase().includes(search)),
  );
}
