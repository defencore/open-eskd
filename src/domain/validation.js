import { readiness } from './readiness.js';
import { validateExtensions } from './extensions.js';
import { assert, keys, text, validId, validDate } from './constraints.js';
import { validateSnapshot } from './snapshot-validation.js';
import { validateCatalog } from './catalog/validation.js';
import { validateProduction } from './production-validation.js';
import { validateFileCheck } from './file-check-validation.js';
import { SCHEMA, VERSION, STATUSES } from './constants.js';
import { own } from './objects.js';

export function validateProject(project) {
  assert(
    project && project.schema === SCHEMA && project.schemaVersion === VERSION,
    'Unsupported JSON format. Expected open-eskd schema version 6.',
  );
  keys(project, [
    'schema',
    'schemaVersion',
    'kind',
    'catalog',
    'id',
    'createdAt',
    'updatedAt',
    'activeBranch',
    'branches',
    'commits',
    'production',
    'fileCheck',
    'extensions',
  ]);
  assert(
    ['project', 'component'].includes(project.kind),
    'Invalid project kind.',
  );
  assert(validId(project.id), 'Invalid project ID.');
  assert(
    validDate(project.createdAt) && validDate(project.updatedAt),
    'Invalid project timestamp.',
  );
  assert(
    project.branches &&
      typeof project.branches === 'object' &&
      !Array.isArray(project.branches),
    'Invalid branches.',
  );
  assert(
    project.commits &&
      typeof project.commits === 'object' &&
      !Array.isArray(project.commits),
    'Invalid history.',
  );
  assert(
    Object.keys(project.branches).length > 0 &&
      Object.keys(project.branches).length <= 100 &&
      own(project.branches, project.activeBranch),
    'Invalid active branch.',
  );
  assert(
    Object.keys(project.commits).length > 0 &&
      Object.keys(project.commits).length <= 5000,
    'Invalid version count.',
  );
  validateExtensions(project.extensions);
  validateCatalog(project.catalog);
  for (const [id, commit] of Object.entries(project.commits)) {
    assert(
      validId(id) &&
        commit &&
        commit.id === id &&
        Array.isArray(commit.parents) &&
        commit.parents.length <= 2 &&
        new Set(commit.parents).size === commit.parents.length,
      'Invalid version record.',
    );
    keys(commit, [
      'id',
      'parents',
      'author',
      'message',
      'version',
      'status',
      'createdAt',
      'snapshot',
      'extensions',
    ]);
    validateExtensions(commit.extensions);
    assert(
      commit.parents.every((p) => own(project.commits, p) && p !== id),
      'Missing parent version.',
    );
    for (const [key, limit] of Object.entries({
      author: 200,
      message: 10000,
      version: 100,
    }))
      assert(
        text(commit[key], limit) && commit[key].trim(),
        'Invalid version metadata.',
      );
    assert(validDate(commit.createdAt), 'Invalid version timestamp.');
    assert(STATUSES.includes(commit.status), 'Invalid version status.');
    validateSnapshot(commit.snapshot, project.catalog);
    if (commit.status === 'released')
      assert(
        readiness(commit.snapshot).length === 0,
        'A released project version is incomplete.',
      );
  }
  const pending = new Map(
    Object.entries(project.commits).map(([id, record]) => [
      id,
      record.parents.length,
    ]),
  );
  const children = new Map(Object.keys(project.commits).map((id) => [id, []]));
  for (const record of Object.values(project.commits))
    record.parents.forEach((parent) => children.get(parent).push(record.id));
  const queue = [...pending.keys()].filter((id) => pending.get(id) === 0);
  let visited = 0;
  for (let i = 0; i < queue.length; i++) {
    visited++;
    for (const child of children.get(queue[i])) {
      pending.set(child, pending.get(child) - 1);
      if (pending.get(child) === 0) queue.push(child);
    }
  }
  assert(visited === pending.size, 'The version history contains a cycle.');
  for (const [name, branch] of Object.entries(project.branches)) {
    assert(
      text(name, 100) &&
        /^[\p{L}\p{N}._/-]+$/u.test(name) &&
        !['__proto__', 'constructor', 'prototype'].includes(name),
      'Invalid branch name.',
    );
    assert(branch && own(project.commits, branch.head), 'Missing branch head.');
    keys(branch, ['head', 'working']);
    validateSnapshot(branch.working, project.catalog);
  }
  validateProduction(project);
  validateFileCheck(project);
  return project;
}
