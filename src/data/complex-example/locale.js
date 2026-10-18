// Localized snapshots have different immutable content. Keep their identities
// separate while retaining placement and operation IDs used by the walkthrough.
export function localizeExampleIdentities(project, lang) {
  if (lang !== 'ua' && lang !== 'uk') return project;
  const scope = (id) => (id === null ? null : id + '-uk');
  function snapshot(value) {
    for (const component of value.components) {
      component.definitionId = scope(component.definitionId);
      component.baseRevisionId = scope(component.baseRevisionId);
      if (component.source)
        component.source.revisionId = scope(component.source.revisionId);
      for (const operation of component.manufacturing.steps) {
        for (const reference of [
          ...operation.dependsOn,
          ...operation.componentInputs,
        ])
          reference.catalogRevisionId = scope(reference.catalogRevisionId);
        for (const reference of operation.documents)
          reference.documentId = scope(reference.documentId);
      }
    }
    for (const document of value.documents) document.id = scope(document.id);
  }
  project.id = scope(project.id);
  project.catalog = Object.fromEntries(
    Object.values(project.catalog).map((record) => {
      record.id = scope(record.id);
      record.itemId = scope(record.itemId);
      record.parents = record.parents.map(scope);
      snapshot(record.snapshot);
      return [record.id, record];
    }),
  );
  project.commits = Object.fromEntries(
    Object.values(project.commits).map((record) => {
      record.id = scope(record.id);
      record.parents = record.parents.map(scope);
      snapshot(record.snapshot);
      return [record.id, record];
    }),
  );
  for (const branch of Object.values(project.branches)) {
    branch.head = scope(branch.head);
    snapshot(branch.working);
  }
  for (const batch of project.production) {
    batch.id = scope(batch.id);
    batch.commitId = scope(batch.commitId);
    snapshot(batch.snapshot);
    for (const event of batch.results) event.id = scope(event.id);
  }
  return project;
}
