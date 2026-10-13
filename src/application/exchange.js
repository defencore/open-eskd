import * as C from '../domain/index.js';
import * as E from '../files/index.js';

import { icon } from '../ui/icons.js';
import { esc } from '../shared/html.js';
import { preference } from '../storage/preferences.js';

export function createExchange(context) {
  const { state } = context;
  const success = (...args) => context.success(...args);

  const toast = (...args) => context.toast(...args);
  const errorMessage = (...args) => context.errorMessage(...args);
  const showModal = (...args) => context.showModal(...args);
  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const selectProject = (...args) => context.selectProject(...args);
  const persist = (...args) => context.persist(...args);

  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  const sanitizeFile = E.safeName;

  function download(data, name, mime = 'application/octet-stream') {
    const url = URL.createObjectURL(
      data instanceof Blob ? data : new Blob([data], { type: mime }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFile(name);
    a.style.display = 'none';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function csv(s = snapshot(), localized = true) {
    return E.csv(s, localized ? t : (key) => key);
  }

  async function exportProject(kind) {
    const p = project(),
      s = snapshot(),
      name = sanitizeFile(s.meta.designation || s.meta.name),
      version = sanitizeFile(C.head(p).version);
    C.validateProject(p);
    if (kind === 'json')
      download(E.json(p), 'project.json', 'application/json');
    else if (kind === 'csv')
      download(csv(), `${name}_BOM.csv`, 'text/csv;charset=utf-8');
    else {
      download(await E.archive(p), `${name}_${version}.zip`);
    }
    if (kind === 'zip' || kind === 'json') {
      const entry = state.unsaved.get(p.id);
      if (entry) entry.exportedAt = p.updatedAt;
    }
    if (['zip', 'json'].includes(kind))
      preference('eskd-exported-' + p.id, C.now());
    closeModal();
    if (['zip', 'json'].includes(kind)) render();
    toast(t('exported'));
  }

  function exportModal() {
    showModal(
      'exportTitle',
      `<p class="modal-description">${esc(t('exportDescription'))}</p>${C.dirty(project()) ? `<div class="hint warning">${icon('alert')}<span>${esc(t('exportWorkingHint'))}</span></div>` : ''}<div class="export-options">${[
        ['json', 'jsonExport', 'jsonExportText', 'file'],
        ['zip', 'zipExport', 'zipExportText', 'folder'],
        ['csv', 'bomExport', 'bomExportText', 'tree'],
      ]
        .map(
          ([format, title, body, i]) =>
            `<button class="export-option" data-action="export-format" data-format="${format}">${icon(i)}<span><strong>${esc(t(title))}</strong><small>${esc(t(body))}</small></span>${icon('arrow')}</button>`,
        )
        .join('')}</div>`,
    );
  }

  const readProjectFile = E.read;

  async function importFile(file) {
    state.busy = true;
    toast(t('importing'));
    try {
      const result = await readProjectFile(file);
      const incoming = result.project;
      if (
        incoming.kind === 'component' &&
        project() &&
        state.view !== 'projects'
      ) {
        context.componentImportDialog(incoming);
        return;
      }
      if (state.rejected?.some((record) => record.record?.id === incoming.id)) {
        state.pendingImport = incoming;
        showModal(
          'importSameTitle',
          `<p class="modal-description">${esc(t('importProtectedText'))}</p><button class="button primary" data-action="import-copy">${icon('copy')}${esc(t('importCopy'))}</button>`,
        );
      } else if (state.projects.some((p) => p.id === incoming.id)) {
        state.pendingImport = incoming;
        showModal(
          'importSameTitle',
          `<p class="modal-description">${esc(t('importSameText'))}</p><div class="export-options"><button class="export-option" data-action="import-history">${icon('merge')}<span><strong>${esc(t('importHistory'))}</strong><small>${esc(t('importHistoryText'))}</small></span>${icon('arrow')}</button><button class="export-option" data-action="import-copy">${icon('copy')}<span><strong>${esc(t('importCopy'))}</strong><small>${esc(t('importCopyText'))}</small></span>${icon('arrow')}</button></div>`,
        );
      } else {
        state.projects.push(incoming);
        await persist(incoming);
        selectProject(incoming.id);
        success(t('imported'));
      }
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      state.busy = false;
    }
  }

  return {
    sanitizeFile,
    download,
    csv,
    exportProject,
    exportModal,
    readProjectFile,
    importFile,
  };
}
