import { generateBash } from './filesystem/bash.js';
import { generatePowerShell } from './filesystem/powershell.js';
import * as C from '../domain/index.js';
import { hash, encoder } from './zip/index.js';

export const MAX_VERIFICATION_SIZE = 32 * 1024 * 1024;

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  return value;
}

export async function configurationFingerprint(
  project,
  snapshot = C.working(project),
) {
  return hash(
    encoder.encode(
      JSON.stringify(canonical({ projectId: project.id, snapshot })),
    ),
  );
}

export async function filesystemScripts(
  project,
  platform,
  placeholders = false,
) {
  C.validateProject(project);
  if (!['bash', 'powershell'].includes(platform))
    throw new Error('Choose Bash or PowerShell.');
  const inventory = C.fileInventory(C.working(project));
  const projectId = project.id;
  const fingerprint = await configurationFingerprint(project);
  return platform === 'powershell'
    ? generatePowerShell(projectId, inventory, fingerprint, placeholders)
    : generateBash(projectId, inventory, fingerprint, placeholders);
}

export async function acceptFileCheck(project, report) {
  const candidate = C.clone(project);
  candidate.fileCheck = report;
  C.validateProject(candidate);
  const fingerprint = await configurationFingerprint(project);
  if (report.fingerprint !== fingerprint)
    throw new Error(
      'The verification report belongs to a different configuration. Generate and run the current check script.',
    );
  const expected = C.fileInventory(C.working(project))
    .files.map((file) => file.path)
    .sort();
  const actual = report.files.map((file) => file.path).sort();
  if (!C.equal(expected, actual))
    throw new Error(
      'The verification report does not cover the expected files.',
    );
  project.fileCheck = C.clone(report);
}
