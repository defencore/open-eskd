import * as C from '../domain/index.js';

export function projectFileInventory(project, snapshot = C.working(project)) {
  return C.fileInventory(snapshot, C.verificationFileReferences(project));
}
