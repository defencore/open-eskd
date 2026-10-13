import { esc } from '../shared/html.js';

export function createDialog(context) {
  const { state, modal } = context;
  const button = (...args) => context.button(...args);
  const iconButton = (...args) => context.iconButton(...args);

  const toast = (...args) => context.toast(...args);
  const errorMessage = (...args) => context.errorMessage(...args);

  const t = (...args) => context.t(...args);
  function showModal(title, body, form = '', submit = 'save', extra = '') {
    context.dismissInfoTooltip();
    modal.innerHTML = `${form ? `<form data-form="${form}">` : ''}<div class="modal-header"><h2>${esc(t(title))}</h2>${iconButton('close', 'close-modal', 'close')}</div><div class="modal-body"><div class="form-error" role="alert"></div>${body}</div><div class="modal-footer">${button('cancel', 'close-modal')}${form ? `<button class="button primary" type="submit" ${extra}>${esc(t(submit))}</button>` : ''}</div>${form ? '</form>' : ''}`;
    if (!form)
      modal.querySelector(
        '.modal-footer [data-action=close-modal]',
      ).textContent = t('close');
    if (!modal.open) modal.showModal();
    setTimeout(
      () =>
        modal
          .querySelector(
            form === 'bulk'
              ? '[data-bulk-input]'
              : 'input:not([type=hidden]),select,textarea',
          )
          ?.focus(),
      30,
    );
  }

  function clearDialog() {
    context.dismissInfoTooltip();
    state.mergePlan = null;
    state.restoreId = null;
    state.pendingImport = null;
  }
  function closeModal() {
    clearDialog();
    modal.close();
  }

  function formError(error) {
    const el = modal.querySelector('.form-error');
    if (el) {
      el.textContent = errorMessage(error);
      el.dataset.code = error.code || '';
      el.scrollIntoView({ block: 'nearest' });
    } else toast(errorMessage(error), true);
  }

  return { showModal, closeModal, formError, clearDialog };
}
