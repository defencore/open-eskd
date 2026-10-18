import { uid } from '../domain/objects.js';
import { createComplexExample } from './complex-example/index.js';

export {
  createComplexExample,
  COMPLEX_EXAMPLE_IDS,
  COMPLEX_EXAMPLE_SECTIONS,
} from './complex-example/index.js';

export async function demoProject(lang = 'en') {
  const project = createComplexExample(lang);
  project.id = uid();
  return project;
}
