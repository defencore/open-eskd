import * as U from '../application/project-tools.js';

export function createEvents(context) {
  const { state, modal } = context;
  const toast = (...args) => context.toast(...args);
  const errorMessage = (...args) => context.errorMessage(...args);
  const closeModal = (...args) => context.closeModal(...args);
  const formError = (...args) => context.formError(...args);
  const render = (...args) => context.render(...args);
  const updateBulkPreview = (...args) => context.updateBulkPreview(...args);
  const switchBranch = (...args) => context.switchBranch(...args);
  const importFile = (...args) => context.importFile(...args);
  const action = (...args) => context.action(...args);
  const submitForm = (...args) => context.submitForm(...args);
  const t = (...args) => context.t(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function bindEvents() {
    context.bindInfoTooltips();
    window.addEventListener('beforeprint', () =>
      context.prepareManufacturingPrint(),
    );
    window.addEventListener('afterprint', () =>
      context.restoreManufacturingPrint(),
    );
    document.addEventListener('click', (event) => {
      const el = event.target.closest('[data-action]');
      if (el) {
        event.preventDefault();
        action(el.dataset.action, el).catch((error) => {
          if (modal.open) formError(error);
          else toast(errorMessage(error), true);
        });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        !modal.open &&
        document.querySelector('.sidebar.open')
      ) {
        action('menu');
        document.querySelector('.mobile-menu').focus();
        return;
      }
      const el = event.target.closest('[data-action][tabindex]');
      if (!el || el.tagName === 'BUTTON') return;
      if (
        ['ArrowUp', 'ArrowDown'].includes(event.key) &&
        el.closest('.structure-table')
      ) {
        const rows = [
            ...document.querySelectorAll(
              '.structure-table tbody tr[data-action]',
            ),
          ],
          index = rows.indexOf(el),
          next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
        event.preventDefault();
        if (next)
          action('inspect', next).then(() =>
            [...document.querySelectorAll('.structure-table tbody tr')]
              .find((row) => row.dataset.id === next.dataset.id)
              ?.focus({ preventScroll: true }),
          );
      } else if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        action(el.dataset.action, el)
          .then(() =>
            [...document.querySelectorAll('.structure-table tbody tr')]
              .find((row) => row.dataset.id === el.dataset.id)
              ?.focus({ preventScroll: true }),
          )
          .catch((error) => toast(errorMessage(error), true));
      }
    });
    document.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-form]');
      if (form) {
        event.preventDefault();
        if (state.busy) {
          toast(t('busy'));
          return;
        }
        submitForm(form, event.submitter);
      }
    });
    document.addEventListener('change', (event) => {
      if (state.busy) {
        toast(t('busy'));
        return;
      }
      context.handleFileChange(event.target);
      context.handleVerificationFormChange(event.target);
      if (context.handleVerificationFilter(event.target)) return;
      context.updateFormGuidance(event.target);
      context.handleRouteLinkChange(event.target);
      context.updateRouteEditor(event.target.closest('form'));
      if (event.target.id === 'import-input') {
        const file = event.target.files[0];
        event.target.value = '';
        if (file) importFile(file);
      } else if (event.target.hasAttribute('data-production-batch')) {
        state.batchId = event.target.value;
        state.productionSearch = '';
        state.productionLimit = 100;
        render();
      } else if (event.target.dataset.change === 'branch') {
        if (state.busy) {
          render();
          toast(t('busy'));
        } else {
          state.busy = true;
          switchBranch(event.target.value)
            .catch((error) => toast(errorMessage(error), true))
            .finally(() => (state.busy = false));
        }
      } else if (
        event.target.name === 'parentId' &&
        event.target.closest('[data-form=component]')
      ) {
        const input = modal.querySelector('[name=designation]');
        if (
          input?.dataset.suggested &&
          input.value === input.dataset.suggested
        ) {
          input.value = U.nextDesignation(
            snapshot(),
            event.target.value || null,
          );
          input.dataset.suggested = input.value;
        }
      } else if (event.target.dataset.change === 'type-filter') {
        state.filter = event.target.value;
        render();
      }
    });
    document.addEventListener('input', (event) => {
      if (context.updateVerificationSearch(event.target)) return;
      if (event.target.hasAttribute('data-production-search')) {
        state.productionSearch = event.target.value;
        state.productionLimit = 100;
        const pos = event.target.selectionStart;
        render();
        const input = document.querySelector('[data-production-search]');
        input?.focus();
        input?.setSelectionRange(pos, pos);
        return;
      }
      if (event.target.hasAttribute('data-manufacturing-search')) {
        context.updateManufacturingSearch(event.target);
        return;
      }
      if (event.target.hasAttribute('data-catalog-search')) {
        state.catalogSearch = event.target.value;
        state.catalogLimit = 200;
        const pos = event.target.selectionStart;
        render();
        const input = document.querySelector('[data-catalog-search]');
        input?.focus();
        input?.setSelectionRange(pos, pos);
        return;
      }
      if (event.target.hasAttribute('data-bulk-input')) {
        updateBulkPreview();
        return;
      }
      if (event.target.dataset.search) {
        state.search = event.target.value;
        const pos = event.target.selectionStart;
        render();
        const input = document.querySelector('[data-search]');
        input?.focus();
        input?.setSelectionRange(pos, pos);
      }
    });
    modal.addEventListener('click', (event) => {
      if (event.target === modal && !modal.querySelector('form')) {
        const rect = modal.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          closeModal();
      }
    });
    modal.addEventListener('close', () => {
      if (!modal.open) context.clearDialog();
    });
    modal.addEventListener('cancel', (event) => {
      if (state.busy) event.preventDefault();
    });
    window.addEventListener('beforeunload', (event) => {
      if (
        state.saveState === 'saving' ||
        [...state.unsaved.entries()].some(
          ([id, entry]) =>
            entry.exportedAt !==
            state.projects.find((p) => p.id === id)?.updatedAt,
        )
      ) {
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }

  return { bindEvents };
}
