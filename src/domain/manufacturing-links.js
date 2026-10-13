import {
  text,
  validId as id,
  validKeys as keys,
  validHash as hash,
} from './constraints.js';
import { validFilePath } from './file-paths.js';
import { clone } from './objects.js';

const messages = {
  'route-link-invalid':
    'Choose valid, unique operation links and positive input quantities.',
  'route-component-missing':
    'An operation refers to a missing input component. Remove or replace the link before deleting the component.',
  'route-operation-missing':
    'An operation prerequisite is missing. Remove or replace the dependency before deleting the operation.',
  'route-document-missing':
    'An operation refers to a missing document. Remove or replace the link before deleting the document.',
  'route-cycle':
    'The operation dependencies contain a cycle. Check prerequisite order and assembly inputs.',
  'route-external':
    'Publish the containing assembly: this route links to components or documents outside the selected component.',
};

export function routeError(code, info = '') {
  const error = new Error(messages[code] + (info ? ' — ' + info : ''));
  error.code = code;
  error.info = info;
  return error;
}

export const operationKey = (componentId, operationId) =>
  JSON.stringify([componentId, operationId]);

export function operationReference(component, operation) {
  return {
    componentId: component.id,
    operationId: operation.id,
    revision: component.revision,
    catalogRevisionId: component.source?.revisionId || null,
  };
}

export function inputReference(component, quantity = 1, usage = 'input') {
  return {
    componentId: component.id,
    revision: component.revision,
    catalogRevisionId: component.source?.revisionId || null,
    quantity,
    usage,
  };
}

export function documentReference(document) {
  return {
    documentId: document.id,
    revision: document.revision,
    path: document.path,
    sha256: document.sha256,
  };
}

export function validateOperationLinks(step) {
  const validList = (list, max, valid, identity) =>
    Array.isArray(list) &&
    list.length <= max &&
    list.every(valid) &&
    new Set(list.map(identity)).size === list.length;
  if (
    !validList(
      step.dependsOn,
      100,
      (ref) =>
        keys(ref, [
          'componentId',
          'operationId',
          'revision',
          'catalogRevisionId',
        ]) &&
        id(ref.componentId) &&
        id(ref.operationId) &&
        text(ref.revision, 100) &&
        (ref.catalogRevisionId === null || id(ref.catalogRevisionId)),
      (ref) => operationKey(ref.componentId, ref.operationId),
    ) ||
    !validList(
      step.componentInputs,
      100,
      (ref) =>
        keys(ref, [
          'componentId',
          'revision',
          'catalogRevisionId',
          'quantity',
          'usage',
        ]) &&
        id(ref.componentId) &&
        text(ref.revision, 100) &&
        (ref.catalogRevisionId === null || id(ref.catalogRevisionId)) &&
        Number.isFinite(ref.quantity) &&
        ref.quantity > 0 &&
        ref.quantity <= 1000000 &&
        ['input', 'reference'].includes(ref.usage),
      (ref) => ref.componentId,
    ) ||
    !validList(
      step.documents,
      50,
      (ref) =>
        keys(ref, ['documentId', 'revision', 'path', 'sha256']) &&
        id(ref.documentId) &&
        text(ref.revision, 100) &&
        (ref.sha256 === null || hash(ref.sha256)) &&
        validFilePath(ref.path),
      (ref) => ref.documentId,
    )
  )
    throw routeError('route-link-invalid');
}

export function validateManufacturingLinks(snapshot) {
  const components = new Map(snapshot.components.map((c) => [c.id, c]));
  const documents = new Set(snapshot.documents.map((d) => d.id));
  const operations = new Set(
    snapshot.components.flatMap((c) =>
      c.manufacturing.steps.map((step) => operationKey(c.id, step.id)),
    ),
  );
  for (const c of snapshot.components) {
    for (const [index, step] of c.manufacturing.steps.entries()) {
      validateOperationLinks(step);
      const info = `${c.designation} · ${index + 1}`;
      for (const ref of step.dependsOn)
        if (!operations.has(operationKey(ref.componentId, ref.operationId)))
          throw routeError('route-operation-missing', info);
      for (const ref of step.componentInputs)
        if (!components.has(ref.componentId))
          throw routeError('route-component-missing', info);
      for (const ref of step.documents)
        if (!documents.has(ref.documentId))
          throw routeError('route-document-missing', info);
    }
  }
}

export function manufacturingIssues(snapshot) {
  const components = new Map(snapshot.components.map((c) => [c.id, c]));
  const documents = new Map(snapshot.documents.map((d) => [d.id, d]));
  const issues = [];
  for (const c of snapshot.components)
    for (const step of c.manufacturing.steps) {
      for (const ref of [...step.dependsOn, ...step.componentInputs]) {
        const target = components.get(ref.componentId);
        if (
          target &&
          (target.revision !== ref.revision ||
            (target.source?.revisionId || null) !== ref.catalogRevisionId)
        )
          issues.push({
            code: step.dependsOn.includes(ref)
              ? 'prerequisiteRevision'
              : 'inputRevision',
            componentId: c.id,
            operationId: step.id,
            targetId: target.id,
          });
      }
      for (const ref of step.documents) {
        const target = documents.get(ref.documentId);
        if (
          target &&
          (target.revision !== ref.revision ||
            target.path !== ref.path ||
            target.sha256 !== ref.sha256)
        )
          issues.push({
            code: 'operationDocument',
            componentId: c.id,
            operationId: step.id,
            targetId: target.id,
          });
      }
    }
  return issues;
}

export function remapManufacturing(route, components, documents, revisions) {
  const copy = clone(route);
  for (const step of copy.steps) {
    for (const ref of [...step.dependsOn, ...step.componentInputs]) {
      const change = revisions.get(ref.componentId);
      if (
        change &&
        ref.revision === change.revision &&
        ref.catalogRevisionId === change.before
      )
        ref.catalogRevisionId = change.after;
    }
    for (const ref of [...step.dependsOn, ...step.componentInputs]) {
      if (!components.has(ref.componentId)) throw routeError('route-external');
      ref.componentId = components.get(ref.componentId);
    }
    for (const ref of step.documents) {
      if (!documents.has(ref.documentId)) throw routeError('route-external');
      ref.documentId = documents.get(ref.documentId);
    }
  }
  return copy;
}
