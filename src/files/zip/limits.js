export const MAX_SIZE = 200 * 1024 * 1024;
export const MAX_ENTRY_SIZE = 25 * 1024 * 1024;
export const entryLimit = (name) =>
  /(?:^|\/)project\.json$/.test(name) ? MAX_SIZE : MAX_ENTRY_SIZE;
export function limitError() {
  const error = new Error(
    'ZIP exceeds the 200 MB archive/expanded limit or 25 MB auxiliary-file limit. Export large manifests as JSON and generate reports separately.',
  );
  error.code = 'file-limit';
  return error;
}
