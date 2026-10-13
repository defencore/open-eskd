import { validateProject } from '../domain/index.js';
import { MAX_SIZE } from './zip/limits.js';
import { encoder } from './zip/binary.js';
export function json(project) {
  validateProject(project);
  const value = JSON.stringify(project, null, 2);
  if (encoder.encode(value).length > MAX_SIZE)
    throw new Error('JSON exceeds the 200 MB size limit.');
  return value;
}
