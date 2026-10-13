import {
  placementIndex,
  placementLabel,
  documentLabels,
} from './placements.js';

export function routeLinkIndex(snapshot, t) {
  const placements = placementIndex(snapshot);
  return {
    components: new Map(snapshot.components.map((c) => [c.id, c])),
    placements,
    documentNames: documentLabels(snapshot, placements, t('project')),
  };
}

export function routeLinkLines(
  step,
  { components, placements, documentNames },
  t,
  identities = false,
) {
  const componentName = (id) => {
    const c = components.get(id);
    return c ? placementLabel(c, placements) : id;
  };
  return [
    ...step.dependsOn.map((ref) => {
      const c = components.get(ref.componentId),
        index =
          c?.manufacturing.steps.findIndex((op) => op.id === ref.operationId) ??
          -1;
      const op = c?.manufacturing.steps[index];
      return `${t('routeDependencies')}: ${componentName(ref.componentId)} · ${op ? `${index + 1}. ${t('operation_' + op.operation)}` : ref.operationId}`;
    }),
    ...step.componentInputs.map(
      (ref) =>
        `${t('routeUsage_' + ref.usage)}: ${componentName(ref.componentId)} · ${t('revision')} ${ref.revision} · ${ref.quantity} ${components.get(ref.componentId)?.unit || ''} (${t('routePerItem')})${ref.catalogRevisionId ? ' · ' + t('catalogPinned') + (identities ? ' ' + ref.catalogRevisionId : '') : ''}`,
    ),
    ...step.documents.map(
      (ref) =>
        `${t('routeDocuments')}: ${documentNames.get(ref.documentId) || ref.documentId} · ${t('revision')} ${ref.revision}${identities ? ' · ' + ref.path + (ref.sha256 ? ' · SHA-256 ' + ref.sha256 : '') : ''}`,
    ),
  ];
}
