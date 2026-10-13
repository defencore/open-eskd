import { assert, keys, validDate } from './constraints.js';
import { validFilePath } from './file-paths.js';
export function validateFileCheck(project) {
  if (project.fileCheck !== null) {
    const check = project.fileCheck;
    keys(check, ['schema', 'projectId', 'fingerprint', 'checkedAt', 'files']);
    assert(
      check.schema === 'open-eskd-file-check-1' &&
        check.projectId === project.id &&
        /^[a-f0-9]{64}$/.test(check.fingerprint) &&
        validDate(check.checkedAt) &&
        Array.isArray(check.files) &&
        check.files.length <= 10000,
      'Invalid file verification report.',
    );
    const paths = new Set();
    for (const file of check.files) {
      keys(file, ['path', 'status']);
      assert(
        validFilePath(file.path) &&
          !paths.has(file.path) &&
          [
            'present',
            'verified',
            'missing',
            'placeholder',
            'empty',
            'mismatch',
            'unsafe',
            'unreadable',
            'hash-unavailable',
          ].includes(file.status),
        'Invalid file verification entry.',
      );
      paths.add(file.path);
    }
  }
}
