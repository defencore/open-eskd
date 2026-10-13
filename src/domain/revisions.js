import { readiness } from './readiness.js';
import { STATUSES } from './constants.js';
import { clone, uid, now, own } from './objects.js';
import { assert, text } from './constraints.js';
import { validateSnapshot } from './snapshot-validation.js';
import { working } from './project.js';

export function commit(
  project,
  { author, message, version, status = 'draft', parents },
) {
  assert(
    Object.keys(project.commits).length < 5000,
    'The project has reached the 5000-version limit.',
  );
  assert(
    text(author, 200) &&
      text(message) &&
      text(version, 100) &&
      author.trim() &&
      message.trim() &&
      version.trim(),
    'Author, version and change description are required.',
  );
  assert(
    text(author, 200) &&
      text(message) &&
      text(version, 100) &&
      STATUSES.includes(status),
    'Invalid version metadata.',
  );
  if (parents)
    assert(
      Array.isArray(parents) &&
        parents.length <= 2 &&
        new Set(parents).size === parents.length &&
        parents.every((id) => own(project.commits, id)),
      'Invalid parent versions.',
    );
  assert(
    !Object.values(project.commits).some((c) => c.version === version),
    'This version label already exists.',
  );
  validateSnapshot(working(project), project.catalog);
  assert(
    status !== 'released' || readiness(working(project)).length === 0,
    'Complete the manufacturing checklist before releasing a version.',
  );
  const id = uid();
  const branch = project.branches[project.activeBranch];
  const record = {
    id,
    parents: parents || [branch.head],
    author,
    message,
    version,
    status,
    createdAt: now(),
    snapshot: clone(branch.working),
  };
  project.commits[id] = record;
  branch.head = id;
  project.updatedAt = now();
  return record;
}

export function createBranch(
  project,
  name,
  from = project.branches[project.activeBranch].head,
) {
  assert(
    Object.keys(project.branches).length < 100,
    'The project has reached the 100-branch limit.',
  );
  assert(
    /^[\p{L}\p{N}._/-]{1,100}$/u.test(name) &&
      !['__proto__', 'constructor', 'prototype'].includes(name),
    'Use letters, numbers, dots, dashes or slashes for branch names.',
  );
  assert(!own(project.branches, name), 'This branch already exists.');
  assert(own(project.commits, from), 'Missing source version.');
  project.branches[name] = {
    head: from,
    working: clone(project.commits[from].snapshot),
  };
  project.activeBranch = name;
}

export function commonAncestor(project, left, right) {
  function ancestors(start) {
    const distances = new Map();
    const queue = [[start, 0]];
    for (let i = 0; i < queue.length; i++) {
      const [id, distance] = queue[i];
      if (distances.has(id)) continue;
      distances.set(id, distance);
      project.commits[id].parents.forEach((p) => queue.push([p, distance + 1]));
    }
    return distances;
  }
  const a = ancestors(left),
    b = ancestors(right);
  return [...a.keys()]
    .filter((id) => b.has(id))
    .sort(
      (x, y) =>
        a.get(x) + b.get(x) - (a.get(y) + b.get(y)) || x.localeCompare(y),
    )[0];
}
