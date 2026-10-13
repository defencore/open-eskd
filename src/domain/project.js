import { SCHEMA, VERSION } from './constants.js';
import { clone, equal, uid, now } from './objects.js';

export function createProject(meta) {
  const snapshot = {
    meta: {
      name: meta.name,
      designation: meta.designation || '',
      description: meta.description || '',
      owner: meta.owner || '',
      workflow: meta.workflow || 'design',
    },
    components: [],
    documents: [],
  };
  const id = uid();
  const commitId = uid();
  const date = now();
  return {
    schema: SCHEMA,
    schemaVersion: VERSION,
    kind: 'project',
    catalog: {},
    id,
    createdAt: date,
    updatedAt: date,
    activeBranch: 'main',
    branches: { main: { head: commitId, working: clone(snapshot) } },
    commits: {
      [commitId]: {
        id: commitId,
        parents: [],
        author: meta.owner || 'Engineer',
        message: 'Project created',
        version: '0.1.0',
        status: 'draft',
        createdAt: date,
        snapshot: clone(snapshot),
      },
    },
    production: [],
    fileCheck: null,
  };
}

export function working(project) {
  return project.branches[project.activeBranch].working;
}

export function head(project) {
  return project.commits[project.branches[project.activeBranch].head];
}

export function dirty(project) {
  return !equal(working(project), head(project).snapshot);
}
