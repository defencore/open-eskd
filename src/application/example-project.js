import {
  EXAMPLE_NAMESPACE,
  EXAMPLE_VERSION,
} from '../data/complex-example/constants.js';

export function isExampleProject(project) {
  return (
    project?.extensions?.['org.openeskd.example']?.id === 'inspection-complex'
  );
}

export function isCurrentExampleProject(project) {
  return (
    isExampleProject(project) &&
    project.extensions[EXAMPLE_NAMESPACE].version === EXAMPLE_VERSION
  );
}
