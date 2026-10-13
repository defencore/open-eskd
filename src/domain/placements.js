import { childIndex } from './structure.js';

export function placementIndex(snapshot) {
  const children = childIndex(snapshot),
    counts = new Map(),
    result = new Map();
  for (const c of snapshot.components)
    counts.set(c.definitionId, (counts.get(c.definitionId) || 0) + 1);
  function visit(siblings, parents) {
    const totals = new Map(),
      seen = new Map();
    for (const c of siblings)
      totals.set(c.definitionId, (totals.get(c.definitionId) || 0) + 1);
    for (const c of siblings) {
      const n = (seen.get(c.definitionId) || 0) + 1;
      seen.set(c.definitionId, n);
      const designation =
        c.designation + (totals.get(c.definitionId) > 1 ? ` [${n}]` : '');
      result.set(c.id, {
        designation,
        parents,
        repeated: counts.get(c.definitionId) > 1,
      });
      visit(children.get(c.id) || [], [...parents, designation]);
    }
  }
  visit(children.get(null) || [], []);
  return result;
}

export function placementLabel(component, index, name = true) {
  const entry = index.get(component.id);
  return `${entry?.designation || component.designation}${name ? ' · ' + component.name : ''}${entry?.repeated && entry.parents.length ? ' ← ' + entry.parents.join(' / ') : ''}`;
}

export function prerequisiteLabels(prerequisites, placements, t) {
  return [
    ...new Set(
      prerequisites.map(
        ({ component, step, index }) =>
          `${placementLabel(component, placements, false)} · ${step ? `${index + 1}. ${t('operation_' + step.operation)}` : t('routeReadyComponent')}`,
      ),
    ),
  ];
}

export function documentLabels(snapshot, placements, projectLabel) {
  const counts = new Map(),
    seen = new Map(),
    components = new Map(snapshot.components.map((c) => [c.id, c]));
  for (const doc of snapshot.documents)
    counts.set(doc.name, (counts.get(doc.name) || 0) + 1);
  return new Map(
    snapshot.documents.map((doc) => {
      const n = (seen.get(doc.name) || 0) + 1;
      seen.set(doc.name, n);
      const c = components.get(doc.componentId);
      return [
        doc.id,
        doc.name +
          (counts.get(doc.name) > 1
            ? ` [${n}] ← ${c ? placementLabel(c, placements, false) : projectLabel}${doc.path !== doc.name ? ' · ' + doc.path : ''}`
            : ''),
      ];
    }),
  );
}
