import { placementLabel } from '../../domain/placements.js';
import { relativeFileUrl } from '../../domain/file-paths.js';
import { esc } from '../../shared/html.js';
import { reportDocumentLinks, reportFields } from './documents.js';

export function reportStructure(context) {
  const { components, documentsByComponent, t, index, batch } = context;
  return components
    .map((c) => {
      const docs = documentsByComponent.get(c.id) || [],
        image = docs.find((doc) => doc.kind === 'image'),
        parent = index.components.get(c.parentId);
      const fields = [
        [
          'reportParent',
          parent ? placementLabel(parent, index.placements, false) : '—',
        ],
        ['material', c.material],
        ['stock', c.manufacturing.stock],
        ['preparation', c.manufacturing.preparation],
        ['manufacturer', c.manufacturer],
        ['notes', c.notes],
        ...(c.provenance
          ? [
              ['provenanceBasis', t('origin_' + c.provenance.basis)],
              [
                'provenanceConfidence',
                t('confidence_' + c.provenance.confidence),
              ],
              ['provenanceReference', c.provenance.reference],
              ['provenanceNotes', c.provenance.notes],
            ]
          : []),
      ];
      return `<article><h3>${esc(placementLabel(c, index.placements))}</h3><p>${esc(t('revision'))}: ${esc(c.revision)} · ${esc(t(c.status))} · ${batch ? c.totalQuantity * batch.quantity : c.totalQuantity} ${esc(c.unit)}</p>${image ? `<img loading="lazy" src="${esc(relativeFileUrl(image.path))}" alt="${esc(c.name)}">` : ''}${reportFields(fields, t)}<ul>${reportDocumentLinks(docs, context)}</ul></article>`;
    })
    .join('');
}
