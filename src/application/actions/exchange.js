import * as C from '../../domain/index.js';

export function createExchangeActions(context) {
  const { state } = context;
  const success = (...args) => context.success(...args);
  const toast = (...args) => context.toast(...args);
  const closeModal = (...args) => context.closeModal(...args);
  const navigate = (...args) => context.navigate(...args);
  const selectProject = (...args) => context.selectProject(...args);

  const exportProject = (...args) => context.exportProject(...args);
  const exportModal = (...args) => context.exportModal(...args);
  const persist = (...args) => context.persist(...args);
  const t = (...args) => context.t(...args);

  async function handleAction(name, el) {
    switch (name) {
      case 'export-json':
        await exportProject('json');
        break;
      case 'export-zip':
        await exportProject('zip');
        break;
      case 'export':
        exportModal();
        break;
      case 'export-format':
        await exportProject(el.dataset.format);
        break;
      case 'export-bom':
        await exportProject('csv');
        break;
      case 'print':
        window.print();
        break;
      case 'import-history': {
        const incoming = state.pendingImport,
          index = state.projects.findIndex((p) => p.id === incoming.id),
          result = C.importHistory(state.projects[index], incoming);
        state.projects[index] = result.project;
        await persist(result.project);
        closeModal();
        selectProject(result.project.id);
        navigate('history');
        success(
          result.names.length ? t('historyImported') : t('nothingToImport'),
        );
        if (
          result.names.some(
            (n) =>
              !C.equal(
                result.project.branches[n].working,
                result.project.commits[result.project.branches[n].head]
                  .snapshot,
              ),
          )
        )
          toast(t('uncommittedImport'));
        state.pendingImport = null;
        break;
      }
      case 'import-copy': {
        const incoming = C.clone(state.pendingImport);
        incoming.id = C.uid();
        incoming.fileCheck = null;
        state.projects.push(incoming);
        await persist(incoming);
        closeModal();
        selectProject(incoming.id);
        state.pendingImport = null;
        success(t('imported'));
        break;
      }

      default:
        return false;
    }
    return true;
  }

  return { handleAction };
}
