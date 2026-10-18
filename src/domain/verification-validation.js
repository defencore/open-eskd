import {
  assert,
  keys,
  text,
  validDate,
  validHash,
  validId,
} from './constraints.js';
import { fileInventory, validFilePath } from './file-paths.js';
import { working } from './project.js';
import { validateExtensions } from './extensions.js';
import {
  verificationSnapshot,
  verificationFileReferences,
} from './verification-records.js';
import {
  EVIDENCE_KINDS,
  VERIFICATION_NAMESPACE,
  VERIFICATION_OUTCOMES,
  VERIFICATION_MAX_BYTES,
} from './verification-constants.js';

function nullableId(value) {
  return value === null || validId(value);
}

function validateRun(project, run) {
  keys(run, [
    'id',
    'name',
    'testCase',
    'procedurePath',
    'performedAt',
    'operator',
    'componentId',
    'commitId',
    'branch',
    'batchId',
    'operationId',
    'retestOf',
    'outcome',
    'summary',
    'artifacts',
  ]);
  assert(
    validId(run.id) &&
      text(run.name, 300) &&
      run.name.trim() &&
      text(run.testCase, 200) &&
      run.testCase.trim() &&
      (run.procedurePath === '' || validFilePath(run.procedurePath)) &&
      validDate(run.performedAt) &&
      text(run.operator, 200) &&
      run.operator.trim() &&
      nullableId(run.componentId) &&
      validId(run.commitId) &&
      text(run.branch, 100) &&
      /^[\p{L}\p{N}._/-]+$/u.test(run.branch) &&
      !['__proto__', 'constructor', 'prototype'].includes(run.branch) &&
      nullableId(run.batchId) &&
      nullableId(run.operationId) &&
      nullableId(run.retestOf) &&
      VERIFICATION_OUTCOMES.includes(run.outcome) &&
      text(run.summary, 10000) &&
      Array.isArray(run.artifacts) &&
      run.artifacts.length <= 1000,
    'Invalid verification run.',
  );
  const snapshot = verificationSnapshot(project, run);
  const component = snapshot.components.find(
    (item) => item.id === run.componentId,
  );
  assert(
    run.componentId === null || component,
    'Missing component in the verification configuration.',
  );
  assert(
    run.operationId === null ||
      component?.manufacturing.steps.some(
        (item) => item.id === run.operationId,
      ),
    'Missing operation in the verification configuration.',
  );
  const ids = new Set(),
    paths = new Set();
  for (const artifact of run.artifacts) {
    keys(artifact, [
      'id',
      'title',
      'kind',
      'path',
      'sha256',
      'required',
      'notes',
    ]);
    assert(
      validId(artifact.id) &&
        !ids.has(artifact.id) &&
        text(artifact.title, 300) &&
        artifact.title.trim() &&
        EVIDENCE_KINDS.includes(artifact.kind) &&
        validFilePath(artifact.path) &&
        !paths.has(artifact.path.toLowerCase().normalize('NFC')) &&
        (artifact.sha256 === null || validHash(artifact.sha256)) &&
        typeof artifact.required === 'boolean' &&
        text(artifact.notes, 2000),
      'Invalid or duplicate verification artifact.',
    );
    ids.add(artifact.id);
    paths.add(artifact.path.toLowerCase().normalize('NFC'));
  }
}

export function validateVerification(project) {
  const profile = project.extensions?.[VERIFICATION_NAMESPACE];
  if (profile === undefined) return;
  validateExtensions(
    { [VERIFICATION_NAMESPACE]: profile },
    { verification: true },
  );
  keys(profile, ['version', 'runs']);
  assert(
    profile.version === 1 &&
      Array.isArray(profile.runs) &&
      profile.runs.length <= 1000 &&
      new TextEncoder().encode(JSON.stringify(profile)).length <=
        VERIFICATION_MAX_BYTES,
    'Invalid verification profile or profile limit exceeded.',
  );
  const runs = new Map();
  let artifacts = 0;
  for (const run of profile.runs) {
    validateRun(project, run);
    assert(!runs.has(run.id), 'Duplicate verification run ID.');
    runs.set(run.id, run);
    artifacts += run.artifacts.length;
  }
  assert(artifacts <= 10000, 'The verification artifact limit is 10000.');
  for (const run of profile.runs) {
    if (run.retestOf === null) continue;
    const previous = runs.get(run.retestOf);
    assert(
      previous &&
        previous.testCase === run.testCase &&
        previous.componentId === run.componentId,
      'A retest must reference the same test case and component.',
    );
    const ancestors = new Set([run.id]);
    let current = previous;
    while (current) {
      assert(
        !ancestors.has(current.id),
        'Verification retests contain a cycle.',
      );
      ancestors.add(current.id);
      current = current.retestOf === null ? null : runs.get(current.retestOf);
    }
  }
  fileInventory(working(project), verificationFileReferences(project));
}
