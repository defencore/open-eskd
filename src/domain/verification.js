import { assert } from './constraints.js';
import { clone, equal, uid, now } from './objects.js';
import { VERIFICATION_NAMESPACE } from './verification-constants.js';
import { verificationRuns } from './verification-records.js';
import { validateVerification } from './verification-validation.js';
import { validateExtensions } from './extensions.js';

export * from './verification-constants.js';
export * from './verification-records.js';
export * from './verification-validation.js';

export function recordVerificationRun(project, fields) {
  validateVerification(project);
  const run = { id: uid(), ...clone(fields) };
  const profile = {
    version: 1,
    runs: [...verificationRuns(project).map(clone), run],
  };
  const extensions = {
    ...project.extensions,
    [VERIFICATION_NAMESPACE]: profile,
  };
  validateExtensions(extensions, { verification: true });
  validateVerification({ ...project, extensions });
  project.extensions = extensions;
  project.updatedAt = now();
  return clone(run);
}

export function mergeVerification(target, incoming) {
  if (incoming.extensions?.[VERIFICATION_NAMESPACE] === undefined) return;
  validateVerification(target);
  validateVerification(incoming);
  const runs = verificationRuns(target).map(clone);
  const identities = new Map(runs.map((run) => [run.id, run]));
  for (const run of verificationRuns(incoming)) {
    const local = identities.get(run.id);
    assert(
      !local || equal(local, run),
      'Verification run identity collision. Existing evidence cannot be overwritten.',
    );
    if (!local) {
      const copy = clone(run);
      runs.push(copy);
      identities.set(copy.id, copy);
    }
  }
  const extensions = {
    ...target.extensions,
    [VERIFICATION_NAMESPACE]: { version: 1, runs },
  };
  validateExtensions(extensions, { verification: true });
  validateVerification({ ...target, extensions });
  target.extensions = extensions;
}
