import * as C from '../domain/index.js';
import { verificationConfiguration } from './verification-configuration.js';

export function createVerificationController(context) {
  const { state } = context;
  async function handleAction(name, element) {
    const id = element?.dataset.id;
    switch (name) {
      case 'new-verification-run':
        context.verificationRunModal();
        break;
      case 'verification-retest': {
        const run = C.verificationRuns(context.project()).find(
          (item) => item.id === id,
        );
        if (run) context.verificationRunModal(run);
        break;
      }
      case 'open-verification-run':
        state.verificationRunId = id;
        state.verificationArtifactSearch = '';
        state.verificationArtifactKind = '';
        state.verificationArtifactLimit = 100;
        context.navigate('verification');
        break;
      case 'verification-back':
        state.verificationRunId = null;
        context.render();
        break;
      case 'verification-more':
        state.verificationLimit += 50;
        context.render();
        break;
      case 'verification-artifacts-more':
        state.verificationArtifactLimit += 100;
        context.render();
        break;
      case 'verification-clear':
        state.verificationSearch =
          state.verificationOutcome =
          state.verificationComponent =
          state.verificationBatch =
            '';
        state.verificationLimit = 50;
        context.render();
        break;
      case 'verification-batch':
        state.verificationRunId = null;
        state.verificationBatch = id;
        state.verificationComponent =
          state.verificationOutcome =
          state.verificationSearch =
            '';
        context.navigate('verification');
        break;
      case 'verification-component':
        state.verificationRunId = null;
        state.verificationComponent = id;
        state.verificationBatch =
          state.verificationOutcome =
          state.verificationSearch =
            '';
        context.navigate('verification');
        break;
      case 'verification-copy-path': {
        const run = C.verificationRuns(context.project()).find(
          (item) => item.id === element.dataset.run,
        );
        const artifact = run?.artifacts.find((item) => item.id === id);
        if (artifact) await context.copyText(artifact.path);
        break;
      }
      case 'verification-add-paths':
        context.addVerificationPaths(element.closest('form'));
        break;
      case 'verification-remove-evidence':
        element.closest('[data-evidence-row]').remove();
        break;
      default:
        return false;
    }
    return true;
  }
  async function handleForm(form, data, get) {
    if (form.dataset.form !== 'verification-run') return false;
    const original = context.project();
    const candidate = C.clone(original);
    const { commitId, branch, batchId } = verificationConfiguration(
      candidate,
      get('configuration'),
    );
    const run = C.recordVerificationRun(candidate, {
      commitId,
      branch,
      batchId,
      name: get('name'),
      testCase: get('testCase'),
      procedurePath: get('procedurePath').replaceAll('\\', '/'),
      performedAt: new Date(get('performedAt')).toISOString(),
      operator: get('operator'),
      componentId: get('componentId') || null,
      operationId: get('operationId') || null,
      retestOf: get('retestOf') || null,
      outcome: get('outcome'),
      summary: get('summary'),
      artifacts: context.readVerificationEvidence(form),
    });
    C.validateProject(candidate);
    state.projects[state.projects.indexOf(original)] = candidate;
    state.verificationRunId = run.id;
    await context.persist(candidate);
    context.closeModal();
    context.navigate('verification');
    context.success(context.t('updated'));
    return true;
  }
  return { handleAction, handleForm };
}
