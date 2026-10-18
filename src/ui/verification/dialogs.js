import * as C from '../../domain/index.js';
import { esc } from '../../shared/html.js';

import { verificationConfiguration } from '../../application/verification-configuration.js';

export function createVerificationDialogs(context) {
  const t = (key) => context.t(key);
  function targetFields(configuration, selected = '', operationId = '') {
    const { snapshot } = configuration;
    const components = C.flatten(snapshot);
    const placements = C.placementIndex(snapshot);
    const component = components.find((item) => item.id === selected);
    return `<div class="form-grid">${context.guidedSelect('verificationComponent', 'componentId', [{ value: '', label: t('verificationGlobalScope') }, ...components.map((item) => ({ value: item.id, label: C.placementLabel(item, placements) }))], component?.id || '', 'data-verification-target')}${context.guidedSelect('verificationOperation', 'operationId', [{ value: '', label: t('verificationAnyOperation') }, ...(component?.manufacturing.steps || []).map((step, index) => ({ value: step.id, label: `${index + 1}. ${t('operation_' + step.operation)}` }))], operationId)}</div>`;
  }
  function verificationRunModal(retest = null) {
    const project = context.project();
    const selection = retest?.batchId
      ? 'batch:' + retest.batchId
      : 'commit:' + (retest?.commitId || C.head(project).id);
    const configuration = verificationConfiguration(project, selection);
    const localDate = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
    const commits = Object.values(project.commits).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    context.showModal(
      'newVerificationRun',
      `<p class="modal-description">${esc(t('verificationRecordHint'))}</p><input type="hidden" name="retestOf" value="${esc(retest?.id || '')}">${retest ? `<p class="hint">${esc(t('verificationRetestOf'))}: ${esc(retest.testCase + ' · ' + retest.name)}</p>` : ''}${context.guidedField('verificationName', 'name', retest?.name || '', 'required maxlength="200"')}<div class="form-grid">${context.guidedField('verificationCase', 'testCase', retest?.testCase || '', 'required maxlength="200"')}${context.guidedField('verificationPerformedAt', 'performedAt', localDate, 'required', 'datetime-local')}</div>${context.guidedSelect('verificationConfiguration', 'configuration', [...commits.map((commit) => ({ value: 'commit:' + commit.id, label: `${commit.version} · ${context.fmtDate(commit.createdAt)} · ${commit.message.slice(0, 70)} · ${commit.id.slice(-8)}` })), ...project.production.map((batch) => ({ value: 'batch:' + batch.id, label: `${t('productionBatch')}: ${batch.name} · ${batch.version}` }))], selection, 'data-verification-configuration')}<p class="note-text">${esc(t('verificationSavedOnlyHint'))}</p><div data-verification-target-fields>${targetFields(configuration, retest?.componentId || context.state.selected || '', retest?.operationId || '')}</div>${context.guidedField('verificationProcedure', 'procedurePath', retest?.procedurePath || '', 'maxlength="800"')}<div class="form-grid">${context.guidedField('verificationOperator', 'operator', context.author(), 'required maxlength="200"')}${context.guidedSelect(
        'verificationOutcome',
        'outcome',
        C.VERIFICATION_OUTCOMES.map((value) => ({
          value,
          label: t('verificationOutcome_' + value),
        })),
        'inconclusive',
      )}</div>${context.guidedTextarea('verificationSummary', 'summary', '', '', 'required maxlength="10000"')}${context.verificationEvidenceEditor()}`,
      'verification-run',
      'verificationRecordRun',
    );
  }
  function handleVerificationFormChange(target) {
    if (
      !target.matches(
        '[data-verification-configuration], [data-verification-target]',
      )
    )
      return;
    const form = target.closest('form');
    const configuration = verificationConfiguration(
      context.project(),
      form.elements.namedItem('configuration').value,
    );
    form.querySelector('[data-verification-target-fields]').innerHTML =
      targetFields(configuration, form.elements.namedItem('componentId').value);
  }
  return { verificationRunModal, handleVerificationFormChange };
}
