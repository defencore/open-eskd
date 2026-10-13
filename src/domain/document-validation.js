import { validateExtensions } from './extensions.js';
import { assert, keys, text, validId, validHash } from './constraints.js';
import { DOC_TYPES } from './constants.js';
import { validFilePath } from './file-paths.js';

export function validateDocuments(snapshot, ids) {
  const docIds = new Set();
  for (const doc of snapshot.documents) {
    assert(
      doc && validId(doc.id) && !docIds.has(doc.id),
      'Document IDs must be unique.',
    );
    keys(doc, [
      'id',
      'name',
      'path',
      'componentId',
      'kind',
      'revision',
      'sha256',
      'required',
      'extensions',
    ]);
    validateExtensions(doc.extensions);
    docIds.add(doc.id);
    assert(
      text(doc.name, 300) && doc.name && text(doc.path, 1000),
      'Invalid document name or path.',
    );
    assert(
      doc.componentId === null || ids.has(doc.componentId),
      'A document refers to a missing component.',
    );
    assert(
      DOC_TYPES.includes(doc.kind) &&
        text(doc.revision, 100) &&
        doc.revision.trim(),
      'Invalid document metadata.',
    );
    assert(
      validFilePath(doc.path),
      'Use a portable relative file path without parent traversal.',
    );
    assert(
      doc.sha256 === null || validHash(doc.sha256),
      'Invalid optional SHA-256.',
    );
    assert(
      typeof doc.required === 'boolean',
      'Specify whether the document is required.',
    );
  }
}
