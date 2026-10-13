import { esc } from '../../shared/html.js';
import { workspaceRevisions } from '../../application/catalog/workspace.js';

export function createCatalogView(context) {
  const { state } = context;
  const { t } = context;
  function renderCatalog() {
    const all = workspaceRevisions(state.projects, state.projectId);
    const query = state.catalogSearch.toLowerCase();
    const grouped = new Map();
    for (const entry of all) {
      const root = entry.record.snapshot.components.find(
        (c) => c.parentId === null,
      );
      if (
        query &&
        ![
          root.name,
          root.designation,
          entry.record.label,
          entry.projectName,
        ].some((text) => text.toLowerCase().includes(query))
      )
        continue;
      if (!grouped.has(entry.record.itemId))
        grouped.set(entry.record.itemId, []);
      grouped.get(entry.record.itemId).push(entry);
    }
    const rows = [...grouped.values()].slice(0, state.catalogLimit);
    return `${context.titleRow('catalog', context.button('catalogImport', 'import', 'folder'))}<div class="hint">${esc(t('catalogHint'))}</div><div class="workspace-toolbar"><label class="search"><input data-catalog-search placeholder="${esc(t('catalogSearch'))}" aria-label="${esc(t('catalogSearch'))}" value="${esc(state.catalogSearch)}"></label><span class="muted">${esc(t('catalogItems'))}: ${grouped.size}</span></div><section class="panel"><div class="panel-header"><h2>${esc(t('catalog'))}</h2></div>${
      rows.length
        ? `<div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('component'))}</th><th>${esc(t('revision'))}</th><th class="optional">${esc(t('catalogSource'))}</th><th></th></tr></thead><tbody>${rows
            .map((entries) => {
              const entry = entries[0],
                record = entry.record,
                root = record.snapshot.components.find(
                  (c) => c.parentId === null,
                );
              return `<tr><td><strong>${esc(root.name)}</strong><div class="code muted">${esc(root.designation)}</div><small>${esc(t('catalogRevisions'))}: ${entries.length}</small></td><td><strong>${esc(record.label)}</strong><div>${context.badge(record.status)}</div></td><td class="optional">${esc(entry.projectName)}<small class="component-sub">${esc(record.author)}</small></td><td>${context.button('catalogDetails', 'catalog-details', 'eye', false, `data-item="${esc(record.itemId)}"`)}</td></tr>`;
            })
            .join(
              '',
            )}</tbody></table></div>${grouped.size > rows.length ? `<div class="panel-footer">${context.button('catalogMore', 'catalog-more')}</div>` : ''}`
        : context.empty('catalogEmpty', 'catalogEmptyText')
    }</section>`;
  }
  return { renderCatalog };
}
