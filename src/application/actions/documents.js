import * as C from '../../domain/index.js';
export function createDocumentsActions(context) {
  async function handleAction(name, el) {
    const id = el?.dataset.id;
    switch (name) {
      case 'add-files':
        context.documentModal();
        break;
      case 'attach-component':
        context.documentModal(null, id);
        break;
      case 'edit-document':
        context.documentModal(id);
        break;
      case 'delete-document':
        context.confirmation(
          'deleteDocument',
          'deleteDocumentText',
          'delete-document',
          id,
        );
        break;
      case 'preview-document':
        context.previewDocument(id);
        break;
      case 'copy-file-path':
        await context.copyText(
          context.snapshot().documents.find((d) => d.id === id).path,
        );
        break;
      case 'suggest-file-path': {
        const form = el.closest('form');
        const c = context
          .snapshot()
          .components.find(
            (c) => c.id === form.elements.namedItem('componentId').value,
          );
        form.elements.namedItem('path').value = C.suggestedPath(
          c,
          form.elements.namedItem('kind').value,
        );
        break;
      }
      default:
        return false;
    }
    return true;
  }
  return { handleAction };
}
