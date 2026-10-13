import Ajv2020 from 'ajv/dist/2020.js';
import { projectSchema } from '../../src/domain/schema.js';
import { validateProject } from '../../src/domain/validation.js';

const validateStructure = new Ajv2020({
  allErrors: true,
  strict: true,
}).compile(projectSchema);

export function checkConformance(project) {
  if (!validateStructure(project))
    return {
      valid: false,
      errors: validateStructure.errors.map((error) => ({
        stage: 'structure',
        path: error.instancePath || '/',
        rule: error.keyword,
        message: error.message,
      })),
    };
  try {
    validateProject(project);
    return { valid: true, schemaVersion: project.schemaVersion, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          stage: 'semantics',
          path: '/',
          rule: error.code || 'validation',
          message: error.message,
        },
      ],
    };
  }
}
