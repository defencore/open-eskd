import * as C from '../../domain/index.js';
import {
  filterVerificationRuns,
  filterVerificationArtifacts,
} from '../../application/verification-query.js';
import { esc } from '../../shared/html.js';

export function createVerificationView(context) {
  const { state } = context;
  const t = (key) => context.t(key);
  const stamp = (run) =>
    `<time datetime="${esc(run.performedAt)}" title="${esc(run.performedAt)}">${esc(new Intl.DateTimeFormat(state.lang === 'ua' ? 'uk-UA' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(run.performedAt)))}</time>`;
  const outcome = (run) =>
    `<span class="verification-outcome ${run.outcome}">${esc(t('verificationOutcome_' + run.outcome))}</span>`;
  function scope(run) {
    const project = context.project();
    const snapshot = C.verificationSnapshot(project, run);
    const component = snapshot.components.find(
      (item) => item.id === run.componentId,
    );
    const batch = project.production.find((item) => item.id === run.batchId);
    return {
      component,
      batch,
      version: project.commits[run.commitId].version,
      componentLabel: component
        ? component.designation + ' · ' + component.name
        : t('verificationGlobalScope'),
    };
  }
  function select(key, label, options, value) {
    return `<label class="verification-filter"><span>${esc(t(label))}</span><select data-verification-filter="${key}" aria-label="${esc(t(label))}"><option value="">${esc(t('verificationAll'))}</option>${options.map((item) => `<option value="${esc(item.value)}"${value === item.value ? ' selected' : ''}>${esc(item.label)}</option>`).join('')}</select></label>`;
  }
  function search(kind, value) {
    return `<label class="search"><input type="search" data-verification-search="${kind}" value="${esc(value)}" placeholder="${esc(t(kind === 'runs' ? 'verificationSearch' : 'verificationArtifactSearch'))}" aria-label="${esc(t(kind === 'runs' ? 'verificationSearch' : 'verificationArtifactSearch'))}"></label>`;
  }
  function renderVerification() {
    const runs = C.verificationRuns(context.project());
    const run = runs.find((item) => item.id === state.verificationRunId);
    return `${context.titleRow('verification', context.button('newVerificationRun', 'new-verification-run', 'plus', true))}${run ? detail(run, runs) : journal(runs)}`;
  }
  function journal(runs) {
    const project = context.project();
    const components = new Map();
    for (const run of runs)
      if (run.componentId)
        components.set(run.componentId, scope(run).componentLabel);
    const filtered = filterVerificationRuns(project, {
      query: state.verificationSearch,
      outcome: state.verificationOutcome,
      componentId: state.verificationComponent,
      batchId: state.verificationBatch,
    });
    const options = [...components]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return `<p class="hint">${esc(t('verificationJournalHint'))}</p><div class="verification-summary"><span><strong>${runs.length}</strong> ${esc(t('verificationRunsCount'))}</span><span><strong>${runs.reduce((count, run) => count + run.artifacts.length, 0)}</strong> ${esc(t('verificationArtifacts'))}</span></div><div class="verification-filters">${search('runs', state.verificationSearch)}${select(
      'verificationOutcome',
      'verificationOutcome',
      C.VERIFICATION_OUTCOMES.map((value) => ({
        value,
        label: t('verificationOutcome_' + value),
      })),
      state.verificationOutcome,
    )}${select('verificationComponent', 'verificationComponent', options, state.verificationComponent)}${select(
      'verificationBatch',
      'productionBatch',
      project.production.map((batch) => ({
        value: batch.id,
        label: batch.name,
      })),
      state.verificationBatch,
    )}${context.button('clearFilters', 'verification-clear', 'close')}</div><p class="muted">${filtered.length} / ${runs.length} ${esc(t('verificationRunsCount'))}</p><section class="panel">${
      filtered.length
        ? `<div class="table-wrap"><table class="table verification-table"><thead><tr><th>${esc(t('verificationRun'))}</th><th>${esc(t('verificationConfiguration'))}</th><th>${esc(t('verificationOutcome'))}</th><th>${esc(t('verificationArtifacts'))}</th><th></th></tr></thead><tbody>${filtered
            .slice(0, state.verificationLimit)
            .map((run) => {
              const info = scope(run);
              return `<tr><td><strong>${esc(run.testCase)} · ${esc(run.name)}</strong><small class="component-sub">${stamp(run)} · ${esc(run.operator)}</small>${run.retestOf ? `<small class="component-sub">${esc(t('verificationRetestLabel'))}</small>` : ''}</td><td>${esc(info.version)}${info.batch ? `<small class="component-sub">${esc(info.batch.name)}</small>` : ''}<small class="component-sub">${esc(info.componentLabel)}</small></td><td>${outcome(run)}</td><td>${run.artifacts.length}</td><td>${context.button('verificationOpenRun', 'open-verification-run', 'info', false, `data-id="${esc(run.id)}"`)}</td></tr>`;
            })
            .join(
              '',
            )}</tbody></table></div>${filtered.length > state.verificationLimit ? `<div class="panel-footer">${context.button('verificationMore', 'verification-more')}</div>` : ''}`
        : context.empty(
            runs.length ? 'noResults' : 'verificationEmpty',
            runs.length ? 'noResultsText' : 'verificationEmptyDescription',
          )
    }</section>`;
  }
  function detail(run, runs) {
    const info = scope(run);
    const retest = runs.find((item) => item.id === run.retestOf);
    const successors = runs.filter((item) => item.retestOf === run.id);
    const artifacts = filterVerificationArtifacts(run, {
      query: state.verificationArtifactSearch,
      kind: state.verificationArtifactKind,
    });
    return `<div class="workspace-toolbar">${context.button('verificationBack', 'verification-back', 'arrow')}${context.button('verificationRetest', 'verification-retest', 'plus', false, `data-id="${esc(run.id)}"`)}</div><section class="panel verification-run"><div class="panel-body"><div class="section-title-row"><h2>${esc(run.testCase)} · ${esc(run.name)}</h2>${outcome(run)}</div><p>${stamp(run)} · ${esc(run.operator)}</p><dl><dt>${esc(t('verificationConfiguration'))}</dt><dd>${esc(info.version)} · ${esc(run.branch)}${info.batch ? ' · ' + esc(info.batch.name) : ''}</dd><dt>${esc(t('verificationComponent'))}</dt><dd>${esc(info.componentLabel)}</dd>${run.operationId ? `<dt>${esc(t('verificationOperation'))}</dt><dd>${esc(t('operation_' + info.component.manufacturing.steps.find((step) => step.id === run.operationId).operation))}</dd>` : ''}${run.procedurePath ? `<dt>${esc(t('verificationProcedure'))}</dt><dd class="code">${esc(run.procedurePath)}</dd>` : ''}</dl><p class="verification-result-summary">${esc(run.summary)}</p><p class="note-text">${esc(t('verificationImmutableHint'))}</p>${retest ? `<div class="verification-relation"><span>${esc(t('verificationRetestOf'))}</span>${context.button(retest.testCase + ' · ' + retest.name, 'open-verification-run', 'history', false, `data-id="${esc(retest.id)}"`)}</div>` : ''}${successors.length ? `<div class="verification-relation"><span>${esc(t('verificationLaterRetests'))}</span>${successors.map((item) => context.button(item.testCase + ' · ' + t('verificationOutcome_' + item.outcome), 'open-verification-run', 'arrow', false, `data-id="${esc(item.id)}"`)).join('')}</div>` : ''}</div></section><h2>${esc(t('verificationArtifacts'))} (${run.artifacts.length})</h2><div class="verification-filters">${search('artifacts', state.verificationArtifactSearch)}${select(
      'verificationArtifactKind',
      'verificationEvidenceKind',
      C.EVIDENCE_KINDS.map((value) => ({
        value,
        label: t('verificationArtifactKind_' + value),
      })),
      state.verificationArtifactKind,
    )}</div><p class="muted">${artifacts.length} / ${run.artifacts.length}</p><section class="panel">${
      artifacts.length
        ? `<div class="table-wrap"><table class="table verification-artifacts"><thead><tr><th>${esc(t('verificationEvidenceTitle'))}</th><th>${esc(t('verificationEvidenceKind'))}</th><th>${esc(t('fileRequirement'))}</th><th></th></tr></thead><tbody>${artifacts
            .slice(0, state.verificationArtifactLimit)
            .map(
              (artifact) =>
                `<tr><td><strong>${esc(artifact.title)}</strong><small class="component-sub code">${esc(artifact.path)}</small>${artifact.notes ? `<small class="component-sub">${esc(artifact.notes)}</small>` : ''}${artifact.sha256 ? `<details><summary>SHA-256</summary><code>${esc(artifact.sha256)}</code></details>` : ''}</td><td>${esc(t('verificationArtifactKind_' + artifact.kind))}</td><td>${esc(t(artifact.required ? 'requiredFile' : 'optionalFile'))}</td><td>${context.button('copyPath', 'verification-copy-path', 'copy', false, `data-id="${esc(artifact.id)}" data-run="${esc(run.id)}"`)}</td></tr>`,
            )
            .join(
              '',
            )}</tbody></table></div>${artifacts.length > state.verificationArtifactLimit ? `<div class="panel-footer">${context.button('verificationMoreArtifacts', 'verification-artifacts-more')}</div>` : ''}`
        : context.empty(
            'verificationNoArtifacts',
            'verificationNoArtifactsDescription',
          )
    }</section>`;
  }
  function updateVerificationSearch(target) {
    if (!target.matches('[data-verification-search]')) return false;
    const kind = target.dataset.verificationSearch;
    const position = target.selectionStart;
    state[
      kind === 'runs' ? 'verificationSearch' : 'verificationArtifactSearch'
    ] = target.value;
    state[kind === 'runs' ? 'verificationLimit' : 'verificationArtifactLimit'] =
      kind === 'runs' ? 50 : 100;
    context.render();
    const input = document.querySelector(
      `[data-verification-search="${kind}"]`,
    );
    input?.focus();
    input?.setSelectionRange(position, position);
    return true;
  }
  function handleVerificationFilter(target) {
    const field = target.dataset.verificationFilter;
    if (
      ![
        'verificationOutcome',
        'verificationComponent',
        'verificationBatch',
        'verificationArtifactKind',
      ].includes(field)
    )
      return false;
    state[field] = target.value;
    state.verificationLimit = 50;
    state.verificationArtifactLimit = 100;
    context.render();
    return true;
  }
  return {
    renderVerification,
    updateVerificationSearch,
    handleVerificationFilter,
  };
}
