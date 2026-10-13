import * as C from '../domain/index.js';
import { inferKind } from './names.js';

export function registerDocuments(project, paths, componentId = null) {
  const candidate = C.clone(project),
    snapshot = C.working(candidate);
  C.assertEditable(snapshot, componentId);
  for (const path of paths) {
    snapshot.documents.push({
      id: C.uid(),
      name: path.split('/').at(-1),
      path,
      componentId,
      kind: inferKind(path),
      revision: 'A',
      sha256: null,
      required: true,
    });
  }
  C.validateProject(candidate);
  return candidate;
}
