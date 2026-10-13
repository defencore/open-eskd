import * as C from '../../domain/index.js';

export function createHistoryForms(context) {
  const { state } = context;
  const success = (...args) => context.success(...args);

  const closeModal = (...args) => context.closeModal(...args);
  const render = (...args) => context.render(...args);
  const mergeReview = (...args) => context.mergeReview(...args);
  const navigate = (...args) => context.navigate(...args);
  const persist = (...args) => context.persist(...args);
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);

  async function handleForm(form, data, get, submitter) {
    switch (form.dataset.form) {
      case 'commit': {
        const release = data.get('release') === 'on';
        if (release && C.readiness(snapshot()).length)
          throw new Error(t('releaseBlocked'));
        C.commit(project(), {
          author: get('author'),
          message: get('message'),
          version: get('version'),
          status: release ? 'released' : 'draft',
        });
        await persist();
        closeModal();
        render();
        success(t('versionSaved'));
        break;
      }
      case 'branch': {
        C.createBranch(
          project(),
          get('name'),
          state.restoreId || project().branches[project().activeBranch].head,
        );
        state.selected = null;
        await persist();
        closeModal();
        navigate('history');
        success(t('branchCreated'));
        break;
      }
      case 'prepare-merge': {
        const plan = C.prepareMerge(project(), get('source'));
        mergeReview(plan);
        break;
      }
      case 'apply-merge': {
        const plan = state.mergePlan,
          p = project();
        if (
          p.activeBranch !== plan.targetName ||
          p.branches[p.activeBranch].head !== plan.parents[0] ||
          p.branches[plan.sourceName].head !== plan.parents[1]
        )
          throw new Error('Branches changed. Compare again before merging.');
        const choices = plan.conflicts.map((_, i) => get('conflict-' + i)),
          merged = C.resolveMerge(plan, choices);
        try {
          C.validateSnapshot(merged, p.catalog);
        } catch {
          throw new Error(t('badMerge'));
        }
        const candidate = C.clone(p);
        candidate.branches[candidate.activeBranch].working = merged;
        C.commit(candidate, {
          author: get('author'),
          message: get('message'),
          version: get('version'),
          status: 'draft',
          parents: plan.parents,
        });
        state.projects[state.projects.indexOf(p)] = candidate;
        await persist(candidate);
        closeModal();
        navigate('history');
        success(t('merged'));
        break;
      }

      default:
        return false;
    }
    return true;
  }

  return { handleForm };
}
