import * as C from '../../domain/index.js';

import { icon } from '../../ui/icons.js';
import { esc } from '../../shared/html.js';

export function createOverviewView(context) {
  const badge = (...args) => context.badge(...args);
  const button = (...args) => context.button(...args);
  const link = (...args) => context.link(...args);
  const titleRow = (...args) => context.titleRow(...args);
  const reachableHistory = (...args) => context.reachableHistory(...args);
  const workflowSteps = (...args) => context.workflowSteps(...args);

  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);

  const fmtDate = (...args) => context.fmtDate(...args);
  function renderOverview() {
    const p = project(),
      s = snapshot(),
      records = reachableHistory(p).slice(0, 3);
    return `${titleRow('overview', button('editProject', 'edit-project', 'edit'))}<section class="panel"><div class="panel-header"><h2>${esc(t('projectSettings'))}</h2>${badge(C.head(p).status)}</div><div class="panel-body project-information"><dl><dt>${esc(t('designation'))}</dt><dd>${esc(s.meta.designation || t('notSet'))}</dd><dt>${esc(t('owner'))}</dt><dd>${esc(s.meta.owner || t('notSet'))}</dd><dt>${esc(t('currentVersion'))}</dt><dd>${esc(C.head(p).version)}</dd><dt>${esc(t('componentCount'))}</dt><dd>${s.components.length}</dd></dl>${s.meta.description ? `<p>${esc(s.meta.description)}</p>` : ''}<p class="note-text">${esc(t('automaticSaveHint'))}</p></div></section><section class="panel workflow-panel"><div class="panel-header"><h2>${esc(t('nextSteps'))}</h2></div>${workflowSteps()
      .map(
        (step, index) =>
          `<div class="workflow-step"><span class="step-number ${step.done ? 'done' : ''}">${step.done ? icon('check') : index + 1}</span><div><h3>${esc(t(step.label))}</h3><p>${esc(t(step.text))}</p></div>${button(step.button, step.action, index === 0 ? 'tree' : index === 1 ? 'file' : index === 2 ? 'history' : 'download', !step.done && index === 0)}</div>`,
      )
      .join(
        '',
      )}</section><section class="panel"><div class="panel-header"><h2>${esc(t('recentChanges'))}</h2>${link('openHistory', 'history')}</div><div class="table-wrap"><table class="table"><thead><tr><th>${esc(t('version'))}</th><th>${esc(t('changeDescription'))}</th><th>${esc(t('author'))}</th><th>${esc(t('date'))}</th></tr></thead><tbody>${records.map((r) => `<tr><td class="code">${esc(r.version)}</td><td>${esc(r.message)}</td><td>${esc(r.author)}</td><td class="nowrap">${fmtDate(r.createdAt)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  return { renderOverview };
}
