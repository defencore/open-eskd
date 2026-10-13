import * as C from '../../domain/index.js';

import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createHistoryView(context) {
  const badge = (...args) => context.badge(...args);
  const button = (...args) => context.button(...args);
  const iconButton = (...args) => context.iconButton(...args);
  const link = (...args) => context.link(...args);
  const branchSelect = (...args) => context.branchSelect(...args);
  const titleRow = (...args) => context.titleRow(...args);
  const reachableHistory = (...args) => context.reachableHistory(...args);
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);

  const fmtDate = (...args) => context.fmtDate(...args);
  function renderHistory() {
    const p = project(),
      changes = C.diff(C.head(p).snapshot, snapshot()),
      records = reachableHistory(p);
    return `${titleRow('history', branchSelect() + button('saveVersion', 'save-version', 'plus', true))}<div class="history-layout"><section class="panel"><div class="panel-header"><div class="panel-title">${icon('history')}<h2>${esc(t('currentBranch'))} · ${esc(p.activeBranch)}</h2></div><small>${esc(t('versionCount'))}: ${records.length}</small></div>${changes.length ? `<div class="hint" style="margin:17px">${icon('edit')}<span>${esc(t('unsavedChanges'))}: ${changes.length} ${esc(t('changes'))}. ${link('compare', 'compare-working')}</span></div>` : ''}${records.map((record) => `<article class="history-item"><div class="history-item-top"><strong>v${esc(record.version)}</strong>${badge(record.status)}${record.id === C.head(p).id ? `<span class="badge branch">${esc(t('currentHead'))}</span>` : ''}${record.parents.length > 1 ? `<span class="badge branch">${icon('merge')} ${esc(t('merged'))}</span>` : ''}</div><p>${esc(record.message)}</p><small>${esc(record.author)} · ${fmtDate(record.createdAt)} · ${record.id.slice(0, 8)}</small><div class="history-item-actions">${link('compare', 'compare-version', record.id)}${link('snapshot', 'snapshot-version', record.id)}${link('restore', 'restore-version', record.id)}</div></article>`).join('')}</section><div class="stack"><section class="panel"><div class="panel-header"><div class="panel-title">${icon('branch')}<h2>${esc(t('branches'))}</h2></div></div><div class="panel-body"><p class="note-text">${esc(t('branchText'))}</p>${Object.entries(
      p.branches,
    )
      .map(
        ([name, b]) =>
          `<div class="branch-row">${icon('branch')}<div><strong>${esc(name)}</strong><small>v${esc(p.commits[b.head].version)}${C.equal(b.working, p.commits[b.head].snapshot) ? '' : ` · ${esc(t('branchDirty'))}`}</small></div>${name === p.activeBranch ? `<span class="badge branch">${esc(t('active'))}</span>` : iconButton('openVariant', 'switch-branch', 'arrow', name)}</div>`,
      )
      .join(
        '',
      )}<div class="variant-actions">${button('newBranch', 'new-branch', 'plus')}${button('merge', 'merge', 'merge')}${button('importUpdate', 'import', 'upload')}</div></div></section><section class="panel"><div class="panel-header"><div class="panel-title">${icon('shield')}<h2>${esc(t('versioned'))}</h2></div></div><div class="panel-body"><p class="settings-note">${esc(t('commitDescription'))}</p><div class="divider"></div><p class="note-text">${esc(t('mergeDescription'))}</p></div></section></div></div>`;
  }

  return { renderHistory };
}
