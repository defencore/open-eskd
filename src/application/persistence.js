import { clone, now, importHistory, validateProject } from '../domain/index.js';

export function createPersistence(context, store) {
  const { state } = context;
  let queue = Promise.resolve();
  function updateStatus() {
    state.saveState =
      state.pendingWrites > 0
        ? 'saving'
        : state.storageMode !== 'persistent'
          ? 'sessionOnly'
          : state.unsaved.get(state.projectId)?.reason || 'saved';
    context.updateSaveState();
  }
  function persist(project = context.project()) {
    if (!project) return Promise.resolve({ persisted: true });
    project.updatedAt = now();
    const copy = clone(project);
    state.pendingWrites = (state.pendingWrites || 0) + 1;
    state.saveState = 'saving';
    context.updateSaveState();
    const save = async () => {
      try {
        if (!store) throw new Error('Browser storage is unavailable.');
        await store.save(copy);
        try {
          await context.refreshFileCheck?.();
        } catch (error) {
          context.reportError?.('file check', error);
        }
        state.unsaved.delete(copy.id);
        updateStatus();
        return { persisted: true };
      } catch (error) {
        context.reportError?.('storage', error);
        const reason =
          error.code === 'storage-conflict'
            ? 'storageConflict'
            : state.storageMode === 'persistent'
              ? 'saveFailed'
              : 'sessionOnly';
        state.unsaved.set(copy.id, { reason, exportedAt: null });
        updateStatus();
        context.render();
        context.toast(
          context.t(
            reason === 'storageConflict'
              ? 'storageConflictText'
              : 'storageError',
          ),
          true,
        );
        return { persisted: false, reason };
      } finally {
        state.pendingWrites--;
        updateStatus();
      }
    };
    queue = queue.then(save, save);
    return queue;
  }
  async function removeProject(id) {
    await queue;
    if (store) await store.remove(id);
    state.unsaved.delete(id);
    updateStatus();
  }
  async function recoverBrowserChanges() {
    await queue;
    const local = context.project();
    const current = await store.readCurrent(local.id);
    const incoming = current && validateProject(current);
    const merged = current
      ? importHistory(local, incoming).project
      : clone(local);
    store.acknowledge(local.id, current);
    state.projects[state.projects.indexOf(local)] = merged;
    await persist(merged);
    context.navigate('history');
    context.success(context.t('browserChangesImported'));
  }
  function success(message, id = state.projectId) {
    if (!state.unsaved.has(id)) context.toast(message);
  }
  return {
    persist,
    removeProject,
    recoverBrowserChanges,
    updateStatus,
    success,
  };
}
