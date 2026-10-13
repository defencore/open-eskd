import * as C from '../domain/index.js';

export function createProject(meta, assembly = true, rootType = 'assembly') {
  const project = C.createProject(meta);
  if (assembly && (meta.designation || '').trim()) {
    const snapshot = C.working(project);
    snapshot.components.push(
      C.component({
        id: C.uid(),
        parentId: null,
        name: meta.name,
        designation: meta.designation,
        type: rootType,
        quantity: 1,
        unit: 'pcs',
        status: 'draft',
        revision: 'A',
        owner: meta.owner || '',
        material: '',
        manufacturer: '',
        process: '',
        notes: '',
        provenance: C.provenance(
          meta.workflow === 'decomposition' ? 'observed' : 'designed',
        ),
      }),
    );
    project.commits[project.branches.main.head].snapshot = C.clone(snapshot);
  }
  C.validateProject(project);
  return project;
}
