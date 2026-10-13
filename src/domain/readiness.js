import { manufacturingIssues } from './manufacturing-links.js';

export function readiness(snapshot) {
  const issues = manufacturingIssues(snapshot);
  if (!snapshot.components.length)
    issues.push({ code: 'empty', componentId: null });
  for (const c of snapshot.components) {
    if (
      (snapshot.meta.workflow === 'decomposition' && !c.provenance) ||
      (c.provenance?.basis === 'observed' &&
        (c.provenance.confidence === 'unverified' ||
          !c.provenance.reference.trim()))
    )
      issues.push({ code: 'provenance', componentId: c.id });
    if (c.status !== 'released')
      issues.push({ code: 'status', componentId: c.id });
    if (!c.owner.trim()) issues.push({ code: 'owner', componentId: c.id });
    if (
      !['assembly', 'complex', 'set'].includes(c.type) &&
      !c.manufacturer.trim()
    )
      issues.push({ code: 'manufacturer', componentId: c.id });
    if (
      ['assembly', 'part'].includes(c.type) &&
      !snapshot.documents.some(
        (d) =>
          d.componentId === c.id &&
          ['drawing', 'assemblyDrawing', 'model'].includes(d.kind),
      )
    )
      issues.push({ code: 'document', componentId: c.id });
  }
  return issues;
}
