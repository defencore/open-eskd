import { SCHEMA, VERSION, TYPES, STATUSES, DOC_TYPES } from './constants.js';
import { TECHNOLOGIES, OPERATIONS } from './manufacturing.js';
import { WORKFLOWS, ORIGIN_BASES, ORIGIN_CONFIDENCE } from './provenance.js';
import {
  EVIDENCE_KINDS,
  VERIFICATION_NAMESPACE,
  VERIFICATION_OUTCOMES,
} from './verification-constants.js';

const string = (max = 10000, min = 0) => ({
  type: 'string',
  minLength: min,
  maxLength: max,
});
const ref = (name) => ({ $ref: '#/$defs/' + name });
const list = (items, max) => ({ type: 'array', items, maxItems: max });
const choice = (values) => ({ type: 'string', enum: values });
const nullable = (schema) => ({ anyOf: [schema, { type: 'null' }] });
const record = (properties, optional = [], extensions = true) => ({
  type: 'object',
  additionalProperties: false,
  properties: {
    ...properties,
    ...(extensions
      ? {
          extensions: ref(
            typeof extensions === 'string' ? extensions : 'extensions',
          ),
        }
      : {}),
  },
  required: Object.keys(properties).filter((key) => !optional.includes(key)),
});
const id = {
  ...string(100, 1),
  pattern:
    '^(?!__proto__$|constructor$|prototype$)[^\\s\\u0000-\\u001f\\u007f]+$',
};
const hash = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const date = {
  ...string(24, 20),
  pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?Z$',
};
const quantity = { type: 'number', exclusiveMinimum: 0, maximum: 1000000 };
const path = {
  ...string(800, 1),
  pattern: '^(?!/)(?!.*[\\\\\\u0000-\\u001f\\u007f<>:"|?*])[^/]+(?:/[^/]+)*$',
};
const dictionaries = (item, max) => ({
  type: 'object',
  propertyNames: id,
  additionalProperties: item,
  maxProperties: max,
});
const descriptions = Object.fromEntries(
  ['instructions', 'inputs', 'equipment', 'facility', 'check'].map((key) => [
    key,
    string(2000),
  ]),
);

// Structural constraints are portable JSON Schema. Graph, Unicode, path-byte and aggregate rules are semantic checks.
export const projectSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: `https://eskd.defencore.com/schema/project-v${VERSION}.json`,
  title: 'Open ESKD project manifest',
  description:
    'Client-independent engineering configuration, external file references and production records. See the conformance specification for semantic requirements.',
  ...record(
    {
      schema: { const: SCHEMA },
      schemaVersion: { const: VERSION },
      kind: choice(['project', 'component']),
      id,
      createdAt: date,
      updatedAt: date,
      activeBranch: id,
      branches: { ...dictionaries(ref('branch'), 100), minProperties: 1 },
      commits: { ...dictionaries(ref('commit'), 5000), minProperties: 1 },
      catalog: dictionaries(ref('catalogRevision'), 5000),
      production: list(ref('batch'), 1000),
      fileCheck: nullable(ref('fileCheck')),
    },
    [],
    'projectExtensions',
  ),
  $defs: {
    extensions: {
      type: 'object',
      maxProperties: 16,
      propertyNames: {
        ...string(120, 3),
        pattern: '^(?:[a-z][a-z0-9-]*\\.)+[a-z][a-z0-9-]*$',
        not: { const: VERIFICATION_NAMESPACE },
      },
      additionalProperties: ref('jsonValue'),
    },
    projectExtensions: {
      type: 'object',
      maxProperties: 16,
      propertyNames: {
        ...string(120, 3),
        pattern: '^(?:[a-z][a-z0-9-]*\\.)+[a-z][a-z0-9-]*$',
      },
      properties: {
        [VERIFICATION_NAMESPACE]: ref('verification'),
      },
      additionalProperties: ref('jsonValue'),
    },
    verification: record(
      {
        version: { const: 1 },
        runs: list(ref('verificationRun'), 1000),
      },
      [],
      false,
    ),
    verificationRun: record(
      {
        id,
        name: string(300, 1),
        testCase: string(200, 1),
        procedurePath: { anyOf: [{ const: '' }, path] },
        performedAt: date,
        operator: string(200, 1),
        componentId: nullable(id),
        commitId: id,
        branch: string(100, 1),
        batchId: nullable(id),
        operationId: nullable(id),
        retestOf: nullable(id),
        outcome: choice(VERIFICATION_OUTCOMES),
        summary: string(10000),
        artifacts: list(ref('verificationArtifact'), 1000),
      },
      [],
      false,
    ),
    verificationArtifact: record(
      {
        id,
        title: string(300, 1),
        kind: choice(EVIDENCE_KINDS),
        path,
        sha256: nullable(hash),
        required: { type: 'boolean' },
        notes: string(2000),
      },
      [],
      false,
    ),
    jsonValue: {
      anyOf: [
        ...['null', 'boolean', 'number', 'string'].map((type) => ({ type })),
        { type: 'array', items: ref('jsonValue') },
        {
          type: 'object',
          propertyNames: {
            not: { enum: ['__proto__', 'prototype', 'constructor'] },
          },
          additionalProperties: ref('jsonValue'),
        },
      ],
    },
    provenance: record(
      {
        basis: choice(ORIGIN_BASES),
        confidence: choice(ORIGIN_CONFIDENCE),
        reference: string(1000),
        notes: string(2000),
      },
      [],
      false,
    ),
    meta: record(
      {
        name: string(200, 1),
        designation: string(200),
        description: string(),
        owner: string(200),
        workflow: choice(WORKFLOWS),
      },
      ['workflow'],
    ),
    snapshot: record(
      {
        meta: ref('meta'),
        components: list(ref('component'), 10000),
        documents: list(ref('document'), 10000),
      },
      [],
      false,
    ),
    source: record({ revisionId: id, componentId: id, rootId: id }, [], false),
    component: record(
      {
        id,
        definitionId: id,
        source: nullable(ref('source')),
        baseRevisionId: nullable(id),
        parentId: nullable(id),
        name: string(200, 1),
        designation: string(200, 1),
        type: choice(TYPES),
        quantity,
        unit: string(100, 1),
        revision: string(100, 1),
        status: choice(STATUSES),
        owner: string(200),
        material: string(200),
        manufacturer: string(200),
        process: string(1000),
        manufacturing: ref('manufacturing'),
        notes: string(),
        provenance: ref('provenance'),
      },
      ['provenance'],
    ),
    document: record({
      id,
      name: string(300, 1),
      path,
      componentId: nullable(id),
      kind: choice(DOC_TYPES),
      revision: string(100, 1),
      sha256: nullable(hash),
      required: { type: 'boolean' },
    }),
    dependency: record(
      {
        componentId: id,
        operationId: id,
        revision: string(100),
        catalogRevisionId: nullable(id),
      },
      [],
      false,
    ),
    input: record(
      {
        componentId: id,
        revision: string(100),
        catalogRevisionId: nullable(id),
        quantity,
        usage: choice(['input', 'reference']),
      },
      [],
      false,
    ),
    documentLink: record(
      { documentId: id, revision: string(100), path, sha256: nullable(hash) },
      [],
      false,
    ),
    operation: record({
      id,
      operation: choice(OPERATIONS),
      ...descriptions,
      dependsOn: list(ref('dependency'), 100),
      componentInputs: list(ref('input'), 100),
      documents: list(ref('documentLink'), 50),
    }),
    manufacturing: record({
      technology: choice(['', ...TECHNOLOGIES]),
      stock: string(2000),
      preparation: string(2000),
      steps: list(ref('operation'), 100),
    }),
    branch: record({ head: id, working: ref('snapshot') }, [], false),
    commit: record({
      id,
      parents: list(id, 2),
      author: string(200, 1),
      message: string(10000, 1),
      version: string(100, 1),
      status: choice(STATUSES),
      createdAt: date,
      snapshot: ref('snapshot'),
    }),
    catalogRevision: record({
      id,
      itemId: id,
      parents: list(id, 1),
      label: string(100, 1),
      author: string(200, 1),
      message: string(),
      status: choice(STATUSES),
      createdAt: date,
      snapshot: ref('snapshot'),
    }),
    batch: record({
      id,
      name: string(200, 1),
      mode: choice(['prototype', 'series']),
      quantity: { type: 'integer', minimum: 1, maximum: 1000000 },
      author: string(200, 1),
      createdAt: date,
      commitId: id,
      version: string(100),
      branch: string(100),
      snapshot: ref('snapshot'),
      results: list(ref('result'), 100000),
    }),
    result: record({
      id,
      createdAt: date,
      componentId: id,
      operationId: id,
      accepted: { type: 'number', minimum: 0 },
      rejected: { type: 'number', minimum: 0, maximum: 1000000 },
      operator: string(200, 1),
      notes: string(2000),
      evidencePath: { anyOf: [{ const: '' }, path] },
    }),
    fileCheck: record(
      {
        schema: { const: 'open-eskd-file-check-1' },
        projectId: id,
        fingerprint: hash,
        checkedAt: date,
        files: list(ref('fileCheckEntry'), 21000),
      },
      [],
      false,
    ),
    fileCheckEntry: record(
      {
        path,
        status: choice([
          'present',
          'verified',
          'missing',
          'placeholder',
          'empty',
          'mismatch',
          'unsafe',
          'unreadable',
          'hash-unavailable',
        ]),
      },
      [],
      false,
    ),
  },
};
