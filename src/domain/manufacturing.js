import {
  validKeys as allowed,
  text as validText,
  validId,
} from './constraints.js';
import { validateExtensions } from './extensions.js';
import { uid } from './objects.js';
import { validateOperationLinks } from './manufacturing-links.js';
export {
  productionOrder,
  operationPlan,
  tasksByFacility,
} from './manufacturing-order.js';

export const TECHNOLOGIES = [
  'printing3d',
  'milling',
  'turning',
  'casting',
  'laserCutting',
  'sheetMetal',
  'assembly',
  'purchase',
  'other',
];
export const OPERATIONS = [
  'prepare',
  'cutStock',
  'printing3d',
  'milling',
  'turning',
  'drilling',
  'casting',
  'laserCutting',
  'bending',
  'postProcess',
  'deburr',
  'heatTreatment',
  'surfaceTreatment',
  'assembly',
  'pressFit',
  'fitting',
  'fastening',
  'inspect',
  'test',
  'pack',
  'purchase',
  'other',
];
const templates = {
  printing3d: ['prepare', 'printing3d', 'postProcess', 'inspect'],
  milling: ['prepare', 'cutStock', 'milling', 'deburr', 'inspect'],
  turning: ['prepare', 'cutStock', 'turning', 'deburr', 'inspect'],
  casting: ['prepare', 'casting', 'postProcess', 'inspect'],
  laserCutting: ['prepare', 'laserCutting', 'deburr', 'inspect'],
  sheetMetal: ['prepare', 'cutStock', 'bending', 'inspect'],
  assembly: ['prepare', 'assembly', 'inspect', 'test'],
  purchase: ['purchase', 'inspect'],
  other: ['prepare', 'other', 'inspect'],
};

export function manufacturing(fields = {}) {
  return { technology: '', stock: '', preparation: '', steps: [], ...fields };
}

export function operation(fields = {}) {
  return {
    id: uid(),
    operation: 'prepare',
    instructions: '',
    inputs: '',
    equipment: '',
    facility: '',
    check: '',
    dependsOn: [],
    componentInputs: [],
    documents: [],
    ...fields,
  };
}

export function templateOperations(technology) {
  if (!TECHNOLOGIES.includes(technology))
    throw new Error('Select a manufacturing technology.');
  return [...templates[technology]];
}

export function routeTemplate(technology) {
  return templateOperations(technology).map((kind) =>
    operation({ operation: kind }),
  );
}

export function validateManufacturing(route) {
  const text = (value) => validText(value, 2000);
  if (
    !allowed(route, [
      'technology',
      'stock',
      'preparation',
      'steps',
      'extensions',
    ]) ||
    !(route.technology === '' || TECHNOLOGIES.includes(route.technology)) ||
    !text(route.stock) ||
    !text(route.preparation) ||
    !Array.isArray(route.steps) ||
    route.steps.length > 100
  )
    throw new Error('Invalid manufacturing route.');
  const ids = new Set();
  validateExtensions(route.extensions);
  for (const step of route.steps) {
    if (
      !allowed(step, [
        'id',
        'operation',
        'instructions',
        'inputs',
        'equipment',
        'facility',
        'check',
        'dependsOn',
        'componentInputs',
        'documents',
        'extensions',
      ]) ||
      !validId(step.id) ||
      ids.has(step.id) ||
      !OPERATIONS.includes(step.operation) ||
      !['instructions', 'inputs', 'equipment', 'facility', 'check'].every(
        (field) => text(step[field]),
      )
    )
      throw new Error('Invalid manufacturing operation.');
    ids.add(step.id);
    validateExtensions(step.extensions);
    validateOperationLinks(step);
  }
}
