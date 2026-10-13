import { icon } from '../ui/icons.js';
import { esc } from '../shared/html.js';

export function createFeedback(context) {
  const { state } = context;
  const t = (...args) => context.t(...args);
  function toast(message, error = false) {
    const el = document.createElement('div');
    el.className = 'toast' + (error ? ' error' : '');
    el.textContent = message;
    document.querySelector('#toasts').append(el);
    setTimeout(() => el.remove(), error ? 8500 : 4200);
  }

  function errorMessage(error) {
    if (error.code === 'metadata-package')
      return t('metadataPackageOnly') + ' — ' + error.info;
    if (error.code === 'file-limit') return t('fileTooLarge');
    if (error.code === 'production-input-route')
      return t('productionInputRouteMissing') + ' — ' + error.info;
    if (error.code?.startsWith('route-'))
      return t(error.code) + (error.info ? ' — ' + error.info : '');
    if (error.code === 'pinned-component' || error.code === 'pinned-root')
      return t('catalogNestedLocked');
    if (error.code === 'catalog-collision') return t('catalogCollision');
    if (error.code === 'revision-label') return t('catalogLabelUsed');
    if (/Pinned component/.test(error.message || ''))
      return t('catalogNestedLocked');
    const message = error.message || String(error);
    if (state.lang === 'en') return message;
    if (error.code === 'storage-conflict') return t('storageConflictText');
    if (/Accepted quantity exceeds/.test(message))
      return t('productionQuantityError');
    if (/prerequisite operations/.test(message))
      return t('productionPrerequisiteError');
    if (/inspection note for rejected/.test(message))
      return t('productionResultError');
    if (/batch name already/.test(message)) return t('batchNameUsed');
    if (
      /relative file path|case-insensitive|also a directory|suffix is reserved|filename is reserved/.test(
        message,
      )
    )
      return t('filePathError');
    if (/verification report|different configuration/.test(message))
      return t('verificationReportError');
    if (/Review changed operation/.test(message))
      return t('routeReferencesChanged');
    if (/at least one operation/.test(message))
      return t('productionNeedsOperations');
    if (/Total quantity/.test(message)) return t('quantityRange');
    if (
      /manufacturing route|manufacturing operation|100 operations/.test(message)
    )
      return t('manufacturingRouteError');
    if (/manufacturing checklist/.test(message)) return t('releaseBlocked');
    if (/Duplicate designation/.test(message)) return t('duplicateDesignation');
    if (/Only assemblies/.test(message)) return t('parentTypeError');
    if (/SHA-256|hash/.test(message)) return t('hashError');
    if (/different content|collision/.test(message))
      return t('historyCollision');
    if (message === t('badMerge') || message === t('releaseBlocked'))
      return message;
    if (/same version|already point/.test(message)) return t('sameHistory');
    if (/version label already/.test(message)) return t('versionDuplicate');
    if (/branch already/.test(message)) return t('branchDuplicate');
    if (/branch name|letters, numbers/.test(message)) return t('branchInvalid');
    if (/before merging|before merge/.test(message)) return t('needsVersion');
    if (/every conflict/.test(message)) return t('requiredConflict');
    if (/ZIP|archive|DEFLATE/.test(message)) return t('invalidArchive');
    if (/25 MB|100 MB|size limit/.test(message)) return t('fileTooLarge');
    if (/format|schema|JSON/.test(message)) return t('unsupported');
    if (/save|storage|quota/i.test(message)) return t('storageError');
    return t('invalidInput');
  }

  function updateSaveState() {
    const el = document.querySelector('[data-save-state]');
    if (el)
      el.innerHTML = `${icon(state.saveState === 'saved' ? 'check' : 'alert')}<span>${esc(t(state.saveState))}</span>`;
  }

  return { toast, errorMessage, updateSaveState };
}
