import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createMergeDialogs(context) {
  const { state } = context;
  const field = (...args) => context.field(...args);
  const textarea = (...args) => context.textarea(...args);
  const selectField = (...args) => context.selectField(...args);
  const toast = (...args) => context.toast(...args);
  const showModal = (...args) => context.showModal(...args);
  const suggestedVersion = (...args) => context.suggestedVersion(...args);
  const diffHTML = (...args) => context.diffHTML(...args);
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  const author = (...args) => context.author(...args);
  function mergeModal() {
    const p = project(),
      others = Object.keys(p.branches).filter((n) => n !== p.activeBranch);
    if (!others.length) {
      toast(t('noOtherBranches'));
      return;
    }
    showModal(
      'mergeTitle',
      `<p class="modal-description">${esc(t('mergeDescription'))}</p><div class="hint">${icon('branch')}<span>${esc(t('targetBranch'))}: <strong>${esc(p.activeBranch)}</strong></span></div>${selectField(
        'sourceBranch',
        'source',
        others.map((n) => ({
          value: n,
          label: n + ' · v' + p.commits[p.branches[n].head].version,
        })),
        others[0],
      )}`,
      'prepare-merge',
      'prepareMerge',
    );
  }

  function conflictValue(value) {
    return context.formatFieldValue('', value);
  }

  function mergeReview(plan) {
    state.mergePlan = plan;
    showModal(
      'mergeReview',
      `<p class="modal-description">${esc(plan.sourceName)} → ${esc(plan.targetName)}<br>${esc(t('commonBase'))}: v${esc(project().commits[plan.baseId].version)}</p>${
        plan.conflicts.length
          ? `<div class="hint warning">${icon('alert')}<span>${esc(t('conflicts'))}: ${plan.conflicts.length}. ${esc(t('requiredConflict'))}</span></div>${plan.conflicts
              .map((conflict, i) => {
                const [kind, id, key] = conflict.path;
                const item =
                  snapshot()[kind]?.find?.((x) => x.id === id) ||
                  project().branches[plan.sourceName].working[kind]?.find?.(
                    (x) => x.id === id,
                  );
                return `<div class="conflict"><h3>${esc(item ? (item.designation ? item.designation + ' · ' : '') + item.name : t('projectData'))}${key ? ' / ' + esc(t(key)) : ''}</h3><p class="note-text" style="margin-bottom:10px">${esc(t('baseValue'))}: ${esc(conflictValue(conflict.base))}</p><div class="conflict-options">${['ours', 'theirs'].map((side) => `<label><input type="radio" name="conflict-${i}" value="${side}" required><strong>${esc(t(side))}</strong><span>${esc(conflictValue(conflict[side])).replace(/\n/g, '<br>')}</span></label>`).join('')}</div></div>`;
              })
              .join('')}`
          : `<div class="hint">${icon('check')}<span>${esc(t('mergeClean'))}</span></div>`
      }<h3 style="margin:18px 0 10px">${esc(t('automaticChanges'))}</h3>${diffHTML(plan.changes)}<div class="divider"></div>${field('version', 'version', suggestedVersion(), 'maxlength="100" required')}${field('author', 'author', author(), 'maxlength="200" required')}${textarea('changeDescription', 'message', t('mergeMessage') + ' ' + plan.sourceName)}`,
      'apply-merge',
      'mergeApply',
    );
  }

  return { mergeModal, conflictValue, mergeReview };
}
