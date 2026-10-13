import * as C from '../../domain/index.js';

import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createStructureView(context) {
  const { state } = context;
  const badge = (...args) => context.badge(...args);
  const symbol = (...args) => context.symbol(...args);
  const button = (...args) => context.button(...args);
  const iconButton = (...args) => context.iconButton(...args);
  const link = (...args) => context.link(...args);
  const empty = (...args) => context.empty(...args);
  const branchSelect = (...args) => context.branchSelect(...args);
  const titleRow = (...args) => context.titleRow(...args);
  const workflowBar = (...args) => context.workflowBar(...args);

  const t = (...args) => context.t(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function visibleRows(preview = false) {
    const s = snapshot();
    let rows = C.flatten(s);
    const byId = new Map(s.components.map((c) => [c.id, c]));
    if ((state.search || state.filter) && !preview) {
      const q = state.search.toLowerCase();
      rows = rows.filter((c) =>
        [c.name, c.designation, c.manufacturer, c.owner, c.material].some((v) =>
          v.toLowerCase().includes(q),
        ),
      );
    } else if (!preview) {
      rows = rows.filter((c) => {
        let parent = c.parentId;
        while (parent) {
          if (state.collapsed.has(parent)) return false;
          parent = byId.get(parent)?.parentId;
        }
        return true;
      });
    }
    if (state.filter && !preview)
      rows = rows.filter((c) => c.type === state.filter);
    return preview ? rows.slice(0, 7) : rows;
  }

  function componentTable() {
    const s = snapshot(),
      rows = visibleRows(),
      parents = new Set(s.components.map((c) => c.parentId)),
      placements = C.placementIndex(s);
    if (!rows.length) return empty('noResults', 'noResultsText');
    return `<div class="table-wrap"><table class="table structure-table"><thead><tr><th>${esc(t('name'))}</th><th>${esc(t('designation'))}</th><th class="numeric">${esc(t('quantity'))}</th><th class="optional">${esc(t('type'))}</th><th class="mobile-hide">${esc(t('status'))}</th></tr></thead><tbody>${rows
      .map((c) => {
        const hasChildren = parents.has(c.id);
        return `<tr class="clickable ${state.selected === c.id ? 'selected' : ''}" data-action="inspect" data-id="${esc(c.id)}" tabindex="0" aria-label="${esc(placements.get(c.id)?.repeated ? C.placementLabel(c, placements) : c.name)}"${state.selected === c.id ? ' aria-selected="true"' : ''}><td><div class="component-cell"><span class="tree-indent" style="width:${Math.min(c.depth, 8) * 16}px"></span>${hasChildren ? `<button class="tree-toggle" data-action="toggle-tree" data-id="${esc(c.id)}" aria-label="${esc(c.name)}" aria-expanded="${!state.collapsed.has(c.id)}">${icon(state.collapsed.has(c.id) ? 'chevron' : 'down')}</button>` : '<span class="tree-empty"></span>'}${symbol(c.type)}<span class="component-name ${['assembly', 'complex', 'set'].includes(c.type) ? 'assembly-name' : ''}">${esc(c.name)}</span></div></td><td class="code">${esc(placements.get(c.id)?.designation || c.designation)}</td><td class="numeric nowrap">${c.quantity} <span class="muted">${esc(c.unit)}</span></td><td class="optional muted">${esc(t(c.type))}</td><td class="mobile-hide">${badge(c.status)}</td></tr>`;
      })
      .join('')}</tbody></table></div>`;
  }

  function renderStructure() {
    const s = snapshot();
    return `${titleRow('structure', button(s.components.length ? 'addComponent' : 'addAssembly', s.components.length ? 'add-component' : 'add-assembly', 'plus', true))}${workflowBar(0)}${s.meta.workflow === 'decomposition' ? `<div class="hint">${icon('layers')}<span>${esc(t('decompositionStructureHint'))}</span></div>` : ''}${s.components.length === 1 && ['assembly', 'complex', 'set'].includes(s.components[0].type) ? `<div class="hint">${icon('info')}<span>${esc(t('structureRootHint'))}</span></div>` : ''}<div class="workspace-toolbar"><div class="toolbar-left"><label class="search">${icon('search')}<input data-search="components" placeholder="${esc(t('searchComponents'))}" value="${esc(state.search)}" aria-label="${esc(t('searchComponents'))}"></label><select data-change="type-filter" class="filter-select" aria-label="${esc(t('type'))}"><option value="">${esc(t('allTypes'))}</option>${C.TYPES.map((type) => `<option value="${type}"${state.filter === type ? ' selected' : ''}>${esc(t(type))}</option>`).join('')}</select>${state.search || state.filter ? button('clearFilters', 'clear-filters', 'close') : ''}</div><div class="toolbar-right">${button('bulkAdd', 'bulk-add', 'copy')}${branchSelect()}</div></div><div class="structure-layout"><section class="panel">${s.components.length ? componentTable() : empty('structureStart', 'structureStartText', 'add-assembly', 'addAssembly', 'tree')}<div class="panel-footer"><span>${state.search || state.filter ? esc(t('shownComponents')) + ': ' + visibleRows().length + ' / ' + s.components.length : esc(t('componentCount')) + ': ' + s.components.length}</span><div>${state.search || state.filter ? '' : link('showAll', 'expand-all') + link('hideAll', 'collapse-all')}</div></div></section>${renderInspector()}</div><p class="note-text structure-help">${icon('info')} ${esc(t('structureHelp'))}</p>`;
  }

  function renderInspector() {
    const s = snapshot(),
      c = s.components.find((c) => c.id === state.selected);
    if (!c)
      return `<aside class="panel inspector"><div class="panel-header"><h2>${esc(t('selectedComponent'))}</h2></div>${empty('selectComponent', 'selectionHint', '', '', 'tree')}</aside>`;
    const docs = s.documents.filter((d) => d.componentId === c.id),
      placements = C.placementIndex(s),
      isAssembly = ['assembly', 'complex', 'set'].includes(c.type);
    const parent = s.components.find((x) => x.id === c.parentId),
      total = C.flatten(s).find((x) => x.id === c.id).totalQuantity;
    return `<aside class="panel inspector"><div class="inspector-back">${button('backToStructure', 'back-to-structure', 'tree')}</div><div class="panel-header"><h2>${esc(t(isAssembly ? 'selectedAssembly' : 'selectedComponent'))}</h2></div><div class="inspector-header"><div class="code">${esc(placements.get(c.id)?.designation || c.designation)}</div><h2>${esc(c.name)}</h2>${badge(c.status)}<div class="inspector-main-actions">${!c.source || c.source.rootId === c.id ? button('edit', 'edit-component', 'edit', false, `data-id="${esc(c.id)}"`) : ''}${isAssembly && !c.source ? button('addChild', 'add-child', 'plus', true, `data-id="${esc(c.id)}"`) : ''}</div></div><dl><dt>${esc(t('type'))}</dt><dd>${esc(t(c.type))}</dd><dt>${esc(t('itemLocation'))}</dt><dd>${esc(parent?.name || t('root'))}</dd><dt>${esc(t('quantity'))}</dt><dd>${c.quantity} ${esc(c.unit)}</dd><dt>${esc(t('totalQuantity'))}</dt><dd>${total} ${esc(c.unit)}</dd><dt>${esc(t('revision'))}</dt><dd>${esc(c.revision)}</dd></dl>${context.provenanceSummary(c)}<details class="inspector-section"><summary>${esc(t('productionInfo'))}</summary><dl>${[
      ['owner', c.owner],
      ['material', c.material],
      ['manufacturer', c.manufacturer],
      [
        'technology',
        c.manufacturing.technology
          ? t('technology_' + c.manufacturing.technology)
          : '',
      ],
      ['process', c.process],
    ]
      .map(
        ([key, value]) =>
          `<dt>${esc(t(key))}</dt><dd>${esc(value || t('notSet'))}</dd>`,
      )
      .join(
        '',
      )}</dl>${!c.source ? link('editProduction', 'edit-production', c.id) : ''}</details>${c.notes ? `<div class="inspector-section"><h3>${esc(t('notes'))}</h3><p>${esc(c.notes).replace(/\n/g, '<br>')}</p></div>` : ''}<div class="inspector-section"><div class="section-title-row"><h3>${esc(t('documents'))} (${docs.length})</h3></div>${docs.length ? docs.map((d) => `<div class="document-mini">${icon('file')}<button class="text-link file-link" data-action="preview-document" data-id="${esc(d.id)}" title="${esc(d.name)}">${esc(d.name)}</button>${iconButton('copyPath', 'copy-file-path', 'copy', d.id)}</div>`).join('') : `<p>${esc(t('noFilesForComponent'))}</p>`}${!c.source ? button('addFiles', 'attach-component', 'upload', false, `data-id="${esc(c.id)}"`) : ''}</div>${context.catalogInspector(c)}<div class="inspector-actions">${button('duplicate', 'duplicate-component', 'copy', false, `data-id="${esc(c.id)}"`)}${!c.source || c.source.rootId === c.id ? iconButton('delete', 'delete-component', 'trash', c.id) : ''}</div></aside>`;
  }

  return { visibleRows, componentTable, renderStructure, renderInspector };
}
