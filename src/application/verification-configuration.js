import * as C from '../domain/index.js';

function branchForCommit(project, commitId) {
  const branches = [
    project.activeBranch,
    ...Object.keys(project.branches)
      .filter((name) => name !== project.activeBranch)
      .sort(),
  ];
  for (const name of branches) {
    const pending = [project.branches[name].head];
    const seen = new Set();
    while (pending.length) {
      const id = pending.pop();
      if (id === commitId) return name;
      if (seen.has(id)) continue;
      seen.add(id);
      pending.push(...project.commits[id].parents);
    }
  }
  return 'detached';
}

export function verificationConfiguration(project, value) {
  C.assert(typeof value === 'string', 'Choose a saved test configuration.');
  if (value.startsWith('batch:')) {
    const batch = project.production.find((item) => item.id === value.slice(6));
    C.assert(batch, 'Choose an existing production batch.');
    return {
      snapshot: batch.snapshot,
      commitId: batch.commitId,
      branch: batch.branch,
      batchId: batch.id,
    };
  }
  C.assert(value.startsWith('commit:'), 'Choose a saved test configuration.');
  const commitId = value.slice(7);
  C.assert(
    Object.hasOwn(project.commits, commitId),
    'Choose a saved test configuration.',
  );
  return {
    snapshot: project.commits[commitId].snapshot,
    commitId,
    branch: branchForCommit(project, commitId),
    batchId: null,
  };
}
