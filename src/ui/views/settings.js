import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createSettingsView(context) {
  const { state } = context;
  const button = (...args) => context.button(...args);
  const field = (...args) => context.field(...args);
  const selectField = (...args) => context.selectField(...args);
  const link = (...args) => context.link(...args);
  const projectFields = (...args) => context.projectFields(...args);

  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);

  const fmtSize = (...args) => context.fmtSize(...args);
  function renderSettings() {
    const p = project(),
      s = snapshot(),
      total = state.projects.reduce(
        (n, p) => n + new TextEncoder().encode(JSON.stringify(p)).length,
        0,
      );
    return `<div class="page-title-row"><div><div class="eyebrow">${icon('settings')}OPEN ESKD</div><h1>${esc(t('settings'))}</h1><p class="subtitle">${esc(t('settingsSubtitle'))}</p></div></div><div class="settings-grid"><div class="stack"><section class="panel"><div class="panel-header"><h2>${esc(t('profile'))}</h2></div><form data-form="profile" class="panel-body">${field('name', 'author', state.author, 'maxlength="200" required')}${selectField(
      'language',
      'language',
      [
        { value: 'ua', label: 'Українська' },
        { value: 'en', label: 'English' },
      ],
      state.lang,
    )}<p class="settings-note">${esc(t('profileHint'))}</p><button class="button primary" type="submit">${esc(t('save'))}</button></form></section>${p ? `<section class="panel"><div class="panel-header"><h2>${esc(t('projectSettings'))}</h2></div><form data-form="project-meta" class="panel-body">${projectFields(s.meta)}<button class="button primary" type="submit">${esc(t('save'))}</button><div class="divider"></div><button type="button" class="button danger" data-action="delete-project">${icon('trash')}${esc(t('deleteProject'))}</button></form></section>` : ''}</div><div class="stack"><section class="panel"><div class="panel-header"><div class="panel-title">${icon('shield')}<h2>${esc(t('storage'))}</h2></div></div><div class="panel-body"><div class="storage-meter"><strong>${fmtSize(total)}</strong><small>${esc(t('usedByProjects'))} · ${esc(t('projects'))}: ${state.projects.length}</small></div><p class="settings-note">${esc(t('storageHint'))}</p>${p ? button('export', 'export', 'download') : ''}<div class="divider"></div><p class="settings-note">${esc(t('offlineHint'))}</p></div></section><section class="panel"><div class="panel-header"><h2>${esc(t('about'))}</h2></div><div class="panel-body"><p class="settings-note">${esc(t('aboutText'))}</p><p class="note-text">${esc(t('standardsNote'))}</p><div class="divider"></div><p class="note-text">Open ESKD 3.0 · Schema v6 · ZIP / JSON / CSV</p>${button('downloadLicense', 'download-license', 'file')}<div class="divider"></div>${link('demoReset', 'demo')}</div></section></div></div>`;
  }

  return { renderSettings };
}
