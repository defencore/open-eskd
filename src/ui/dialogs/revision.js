import * as C from '../../domain/index.js';

import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createRevisionDialogs(context) {
  const { state, modal } = context;

  const field = (...args) => context.field(...args);
  const textarea = (...args) => context.textarea(...args);
  const link = (...args) => context.link(...args);
  const showModal = (...args) => context.showModal(...args);
  const documentTable = (...args) => context.documentTable(...args);

  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  const author = (...args) => context.author(...args);
  const fmtDate = (...args) => context.fmtDate(...args);
  function suggestedVersion() {
    const p = project(),
      last = C.head(p).version,
      match = last.match(/^(\d+)\.(\d+)\.(\d+)$/);
    let result = match
      ? `${match[1]}.${match[2]}.${(BigInt(match[3]) + 1n).toString().padStart(match[3].length, '0')}`
      : `${last}-next`;
    let n = 2;
    const base = result;
    while (Object.values(p.commits).some((c) => c.version === result))
      result = `${base}-${n++}`;
    return result;
  }

  function commitModal() {
    const issues = C.readiness(snapshot());
    showModal(
      'saveVersion',
      `<p class="modal-description">${esc(t('commitDescription'))}</p>${field('version', 'version', suggestedVersion(), 'maxlength="100" required')}<p class="field-help">${esc(t('versionHint'))}</p>${field('author', 'author', author(), 'maxlength="200" required')}${textarea('changeDescription', 'message')}<details class="form-section"><summary>${esc(t('releaseSection'))}</summary><label class="field checkbox"><input type="checkbox" name="release"${issues.length ? ' disabled' : ''}><span>${esc(t('releaseVersion'))}<small>${esc(t('releaseHint'))}${issues.length ? ` (${issues.length} ${esc(t('issuesCount'))})` : ''}</small></span></label></details>`,
      'commit',
      'saveVersion',
    );
    modal.querySelector('textarea').required = true;
  }

  function branchModal(from = null) {
    state.restoreId = from;
    const p = project();
    showModal(
      'newBranch',
      `<p class="modal-description">${esc(t('branchDescription'))}</p>${field('branchName', 'name', from ? `restore/${p.commits[from].version}` : '', 'maxlength="100" required')}<p class="note-text">${esc(t('branchHint'))}</p><div class="hint" style="margin-top:18px">${icon('history')}<span>${esc(t('basedOn'))}: v${esc(p.commits[from || p.branches[p.activeBranch].head].version)}</span></div>`,
      'branch',
      'create',
    );
  }

  function diffHTML(changes) {
    return changes.length
      ? changes
          .map((change) => {
            const item = change.after || change.before;
            return `<div class="diff-item"><div class="diff-item-top"><span class="badge ${change.action}">${esc(t(change.action))}</span><strong>${esc(change.kind === 'meta' ? t('projectChange') : (item.designation ? item.designation + ' · ' : '') + item.name)}</strong></div>${
              change.fields?.length
                ? `<div class="diff-fields">${change.fields.map((k) => esc(t(k))).join(', ')}</div>${change.fields
                    .filter((k) => !['source', 'definitionId'].includes(k))
                    .map(
                      (k) =>
                        `<div class="diff-detail"><strong>${esc(t(k))}</strong><span class="diff-value">${esc(t('baseValue'))}: ${esc(context.formatFieldValue(k, change.before[k]))}</span><span class="diff-value">${esc(t('currentHead'))}: ${esc(context.formatFieldValue(k, change.after[k]))}</span></div>`,
                    )
                    .join('')}`
                : ''
            }</div>`;
          })
          .join('')
      : `<p class="settings-note">${esc(t('noChanges'))}</p>`;
  }

  function compareModal(recordId = null) {
    const p = project(),
      record = recordId ? p.commits[recordId] : C.head(p);
    const before = recordId
      ? record.parents[0]
        ? p.commits[record.parents[0]].snapshot
        : { meta: {}, components: [], documents: [] }
      : record.snapshot;
    const after = recordId ? record.snapshot : snapshot();
    showModal(
      'compareTitle',
      `<p class="modal-description">${recordId ? 'v' + esc(record.version) + ' · ' + esc(t('changesCompared')) : esc(t('unsavedChanges'))}</p>${diffHTML(C.diff(before, after))}`,
    );
  }

  function snapshotModal(id) {
    const record = project().commits[id],
      s = record.snapshot;
    const rows = C.flatten(s);
    showModal(
      'snapshot',
      `<p class="modal-description">v${esc(record.version)} · ${esc(record.message)}<br>${esc(record.author)} · ${fmtDate(record.createdAt)}</p><div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('component'))}</th><th>${esc(t('quantity'))}</th><th>${esc(t('revision'))}</th></tr></thead><tbody>${rows.map((c) => `<tr><td><span class="component-name" style="padding-left:${Math.min(c.depth, 8) * 12}px">${esc(c.designation)} · ${esc(c.name)}</span></td><td>${c.totalQuantity} ${esc(c.unit)}</td><td>${esc(c.revision)}</td></tr>`).join('')}</tbody></table></div><div class="divider"></div><h3 style="margin-bottom:12px">${esc(t('snapshotFiles'))} (${s.documents.length})</h3>${documentTable(s.documents, s, true)}`,
    );
  }

  function checklistModal() {
    const s = snapshot(),
      issues = C.readiness(s);
    showModal(
      'checklist',
      issues.length
        ? issues
            .map((issue) => {
              const c = s.components.find((c) => c.id === issue.componentId);
              return `<div class="issue-row"><span class="issue-icon">${icon('alert')}</span><div><strong>${esc(t('issue_' + issue.code))}</strong><small>${esc(c ? c.designation + ' · ' + c.name : t('project'))}${issue.operationId ? ' · ' + esc(t('routeOperation')) + ' ' + (c.manufacturing.steps.findIndex((step) => step.id === issue.operationId) + 1) : ''}${issue.targetId ? ' · ' + esc(s.components.find((item) => item.id === issue.targetId)?.designation || s.documents.find((doc) => doc.id === issue.targetId)?.name || '') : ''}</small></div>${link('goTo', 'inspect-close', issue.componentId || '')}</div>`;
            })
            .join('')
        : `<div class="hint">${icon('check')}<span>${esc(t('allReadyText'))}</span></div>`,
    );
  }

  return {
    suggestedVersion,
    commitModal,
    branchModal,
    diffHTML,
    compareModal,
    snapshotModal,
    checklistModal,
  };
}
