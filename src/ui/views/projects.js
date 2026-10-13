import * as C from '../../domain/index.js';

import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createProjectsView(context) {
  const { state } = context;
  const button = (...args) => context.button(...args);
  const link = (...args) => context.link(...args);
  const empty = (...args) => context.empty(...args);

  const t = (...args) => context.t(...args);

  const fmtDate = (...args) => context.fmtDate(...args);
  function renderProjects() {
    const personal = state.projects
      .filter((p) => p.id !== state.demoId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return `<div class="page-title-row"><div><h1>${esc(t('projects'))}</h1><p class="subtitle">${esc(t('projectsSubtitle'))}</p></div>${button('help', 'help', 'info')}</div><section class="start-panel"><h2>${esc(t('startTitle'))}</h2><p>${esc(t('startText'))}</p><div class="start-actions"><div>${icon('plus')}<div><h3>${esc(t('createTask'))}</h3><p>${esc(t('createTaskText'))}</p>${button('newProject', 'new-project', 'plus', true)}</div></div><div>${icon('folder')}<div><h3>${esc(t('openTask'))}</h3><p>${esc(t('openTaskText'))}</p>${button('import', 'import', 'folder')}</div></div><div>${icon('layers')}<div><h3>${esc(t('decomposeTask'))}</h3><p>${esc(t('decomposeTaskText'))}</p>${button('decomposeProject', 'decompose-project', 'tree')}</div></div></div></section><section class="panel"><div class="panel-header"><h2>${esc(t('projectsList'))}</h2><span class="muted">${personal.length}</span></div>${
      personal.length
        ? `<div class="table-wrap"><table class="table projects-table"><thead><tr><th>${esc(t('projectName'))}</th><th>${esc(t('designation'))}</th><th class="optional">${esc(t('componentCount'))}</th><th class="mobile-hide">${esc(t('lastModified'))}</th><th></th></tr></thead><tbody>${personal
            .map((p) => {
              const s = C.working(p);
              return `<tr data-action="open-project" data-id="${esc(p.id)}" class="clickable" tabindex="0" aria-label="${esc(s.meta.name)}"><td><strong>${esc(s.meta.name)}</strong>${s.meta.description ? `<span class="component-sub">${esc(s.meta.description)}</span>` : ''}</td><td class="code">${esc(s.meta.designation || '—')}</td><td class="optional">${s.components.length}</td><td class="mobile-hide nowrap">${fmtDate(p.updatedAt)}</td><td>${button('continueProject', 'open-project', 'arrow', false, `data-id="${esc(p.id)}"`)}</td></tr>`;
            })
            .join('')}</tbody></table></div>`
        : empty('projectsEmpty', 'projectsEmptyText')
    }</section><div class="example-line"><span>${esc(t('demoHelp'))}</span>${link('demoOpen', 'demo')}</div>`;
  }

  return { renderProjects };
}
