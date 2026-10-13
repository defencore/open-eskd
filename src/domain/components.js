import { uid } from './objects.js';
import { manufacturing } from './manufacturing.js';

export const CONTAINER_TYPES = ['assembly', 'complex', 'set'];
export const DEFINITION_FIELDS = [
  'definitionId',
  'baseRevisionId',
  'name',
  'designation',
  'type',
  'unit',
  'revision',
  'status',
  'owner',
  'material',
  'manufacturer',
  'process',
  'manufacturing',
  'notes',
  'provenance',
  'extensions',
];

export function component(fields) {
  const { id: providedId, definitionId: providedDefinition, ...data } = fields;
  const id = providedId || uid();
  return {
    id,
    definitionId: providedDefinition || id,
    source: null,
    baseRevisionId: null,
    parentId: null,
    name: '',
    designation: '',
    type: 'part',
    quantity: 1,
    unit: 'pcs',
    revision: 'A',
    status: 'draft',
    owner: '',
    material: '',
    manufacturer: '',
    process: '',
    manufacturing: manufacturing(),
    notes: '',
    ...data,
  };
}
