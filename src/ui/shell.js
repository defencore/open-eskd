import * as C from '../domain/index.js';
import { isExampleProject } from '../application/example-project.js';

import { icon } from '../ui/icons.js';
import { esc } from '../shared/html.js';

export function createShell(context) {
  const { state } = context;
  const button = (...args) => context.button(...args);
  const iconButton = (...args) => context.iconButton(...args);
  const updateSaveState = (...args) => context.updateSaveState(...args);
  const renderOverview = (...args) => context.renderOverview(...args);
  const renderStructure = (...args) => context.renderStructure(...args);
  const renderDocuments = (...args) => context.renderDocuments(...args);
  const renderHistory = (...args) => context.renderHistory(...args);
  const renderManufacturing = (...args) => context.renderManufacturing(...args);
  const renderProjects = (...args) => context.renderProjects(...args);
  const renderSettings = (...args) => context.renderSettings(...args);

  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function render() {
    context.updateStatus();
    const p = project(),
      s = snapshot(),
      inProject = Boolean(p && state.view !== 'projects');
    document.documentElement.lang = state.lang === 'ua' ? 'uk' : 'en';
    document.title = `${inProject ? s.meta.name + ' · ' : ''}Open ESKD`;
    const navigation = (items) =>
      items
        .map(
          ([view, i]) =>
            `<button data-action="nav" data-view="${view}" class="${state.view === view ? 'active' : ''}"${state.view === view ? ' aria-current="page"' : ''}>${icon(i)}<span>${esc(t(view))}</span></button>`,
        )
        .join('');
    document.querySelector('#app').innerHTML =
      `<div class="layout"><div class="mobile-shade" data-action="menu"></div><aside class="sidebar"><div class="brand"><img src="assets/icon.svg" alt=""><div>Open ESKD<small>${esc(t('brandTag'))}</small></div></div><nav class="nav"><button data-action="nav" data-view="projects" class="${state.view === 'projects' ? 'active' : ''}">${icon('folder')}<span>${esc(t('projects'))}</span></button></nav>${
        inProject
          ? `<div class="sidebar-project"><span>${esc(s.meta.designation || t('project'))}</span><strong>${esc(s.meta.name)}</strong></div><div class="nav-label">${esc(t('projectNavigation'))}</div><nav class="nav" aria-label="${esc(t('projectNavigation'))}">${navigation(
              [
                ...(isExampleProject(p) ? [['exampleGuide', 'info']] : []),
                ['structure', 'tree'],
                ['catalog', 'box'],
                ['documents', 'file'],
                ['manufacturing', 'factory'],
                ['production', 'check'],
                ['overview', 'info'],
              ],
            )}</nav><div class="nav-divider"></div><div class="nav-label">${esc(t('changeManagement'))}</div><nav class="nav">${navigation([['history', 'history']])}</nav>`
          : ''
      }<div class="sidebar-bottom"><nav class="nav">${navigation([['settings', 'settings']])}<button data-action="help">${icon('info')}<span>${esc(t('help'))}</span></button></nav><div class="sidebar-status">${icon('lock')}<span>${esc(t('localWorkspace'))}<small>${esc(t('noInternetNeeded'))}</small></span></div></div></aside><div class="main-shell"><header class="topbar">${iconButton('menu', 'menu', 'menu')}<div class="breadcrumbs"><button data-action="nav" data-view="projects">${esc(t('projects'))}</button>${inProject ? `${icon('chevron')}<span>${esc(s.meta.name)}</span>` : ''}</div><div class="topbar-actions"><span class="save-state" data-save-state title="${esc(t('automaticSaveHint'))}"></span><div class="language" aria-label="${esc(t('language'))}"><button data-action="language" data-lang="en" class="${state.lang === 'en' ? 'selected' : ''}">EN</button><button data-action="language" data-lang="ua" class="${state.lang === 'ua' ? 'selected' : ''}">UA</button></div>${inProject ? button('saveProjectJson', 'export-json', 'download', true) : ''}</div></header>${storageNotice()}${state.storageMode !== 'persistent' ? `<div class="banner-notice">${esc(t('storageUnavailable'))}</div>` : ''}<main class="page" id="main-content">${renderView()}<div class="footer-note"><span>Open ESKD</span><span>${esc(t('footerPrivacy'))}</span></div></main></div></div>`;
    document
      .querySelector('.topbar>[data-action=menu]')
      .classList.add('mobile-menu');
    updateSaveState();
  }

  function renderView() {
    if (state.view === 'projects') return renderProjects();
    if (state.view === 'catalog' && project()) return context.renderCatalog();
    if (state.view === 'settings') return renderSettings();
    if (!project()) return renderProjects();
    return (
      {
        exampleGuide: context.renderExampleGuide,
        overview: renderOverview,
        structure: renderStructure,
        documents: renderDocuments,
        history: renderHistory,
        manufacturing: renderManufacturing,
        production: context.renderProduction,
      }[state.view] || renderOverview
    )();
  }

  function branchSelect() {
    const p = project();
    if (Object.keys(p.branches).length === 1 && state.view !== 'history')
      return `<span class="version-context">${esc(t('currentVersion'))}: <strong>${esc(C.head(p).version)}</strong>${C.dirty(p) ? `<small>${esc(t('workingChanges'))}</small>` : ''}</span>`;
    return `<label class="branch-select"><span>${esc(t('currentBranch'))}</span><select data-change="branch" aria-label="${esc(t('currentBranch'))}">${Object.keys(
      p.branches,
    )
      .map(
        (name) =>
          `<option value="${esc(name)}"${name === p.activeBranch ? ' selected' : ''}>${esc(name === 'main' ? t('mainBranch') : name)}</option>`,
      )
      .join('')}</select></label>`;
  }

  function titleRow(view, actions = '') {
    const s = snapshot(),
      p = project();
    return `<div class="page-title-row"><div><h1>${esc(view === 'overview' ? s.meta.name : t(view))}</h1><p class="subtitle">${esc(view === 'overview' ? s.meta.designation : t(view + 'Subtitle'))}</p></div><div class="title-actions">${actions}</div></div>${isExampleProject(p) && view !== 'exampleGuide' ? `<div class="demo-notice">${icon('info')}<span>${esc(t('demoNotice'))}</span>${button('exampleGuide', 'nav', 'info', false, 'data-view="exampleGuide"')}</div>` : ''}`;
  }

  function storageNotice() {
    const unsaved = state.unsaved.get(state.projectId);
    let html = '';
    if (unsaved?.reason === 'storageConflict')
      html += `<div class="banner-notice danger"><span>${esc(t('storageConflictText'))}</span> ${button('recoverBrowser', 'recover-browser', 'merge')} ${button('downloadArchive', 'export-zip', 'download')}</div>`;
    else if (unsaved?.reason === 'saveFailed')
      html += `<div class="banner-notice danger">${esc(t('storageError'))} ${button('retrySave', 'retry-save')} ${button('downloadArchive', 'export-zip', 'download')}</div>`;
    if (state.rejected.length)
      html += `<div class="banner-notice danger">${state.rejected.length} · ${esc(t('damagedRecords'))} ${button('recoverRecords', 'recover-records', 'download')}</div>`;
    return html;
  }
  return { render, renderView, branchSelect, titleRow };
}
