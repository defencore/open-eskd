export function createHistoryActions(context) {
  const commitModal = (...args) => context.commitModal(...args);
  const branchModal = (...args) => context.branchModal(...args);
  const compareModal = (...args) => context.compareModal(...args);
  const snapshotModal = (...args) => context.snapshotModal(...args);
  const checklistModal = (...args) => context.checklistModal(...args);
  const mergeModal = (...args) => context.mergeModal(...args);
  const switchBranch = (...args) => context.switchBranch(...args);

  async function handleAction(name, el) {
    const id = el?.dataset.id;
    switch (name) {
      case 'save-version':
        commitModal();
        break;
      case 'new-branch':
        branchModal();
        break;
      case 'restore-version':
        branchModal(id);
        break;
      case 'switch-branch':
        await switchBranch(id);
        break;
      case 'compare-working':
        compareModal();
        break;
      case 'compare-version':
        compareModal(id);
        break;
      case 'snapshot-version':
        snapshotModal(id);
        break;
      case 'checklist':
        checklistModal();
        break;
      case 'merge':
        mergeModal();
        break;

      default:
        return false;
    }
    return true;
  }

  return { handleAction };
}
