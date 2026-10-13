import * as C from '../domain/index.js';

import { icon } from '../ui/icons.js';
import { esc } from '../shared/html.js';
import { readPreference } from '../storage/preferences.js';

export function createWorkflow(context) {
  const t = (...args) => context.t(...args);
  const project = (...args) => context.project(...args);
  const snapshot = (...args) => context.snapshot(...args);
  function reachableHistory(p) {
    const visited = new Set(),
      records = [],
      pending = [p.branches[p.activeBranch].head];
    while (pending.length) {
      const id = pending.pop();
      if (visited.has(id)) continue;
      visited.add(id);
      const record = p.commits[id];
      records.push(record);
      for (let index = record.parents.length - 1; index >= 0; index--)
        pending.push(record.parents[index]);
    }
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  function workflowSteps() {
    const p = project(),
      s = snapshot();
    const exported = readPreference('eskd-exported-' + p.id, '');
    return [
      {
        label: 'stepStructure',
        text: 'stepStructureText',
        action: 'structure',
        button: 'openStructure',
        done:
          s.components.length > 1 ||
          (s.components.length === 1 &&
            !C.CONTAINER_TYPES.includes(s.components[0].type)),
      },
      {
        label: 'stepDocuments',
        text: 'stepDocumentsText',
        action: 'documents',
        button: 'openDocuments',
        done: s.documents.length > 0,
      },
      {
        label: 'stepVersion',
        text: 'stepVersionText',
        action: 'save-version',
        button: 'saveVersion',
        done: reachableHistory(p).length > 1 && !C.dirty(p),
      },
      {
        label: 'stepExport',
        text: 'stepExportText',
        action: 'export-json',
        button: 'saveProjectJson',
        done: Boolean(exported && exported >= p.updatedAt),
      },
    ];
  }

  function workflowBar(current) {
    return `<nav class="workflow-nav" aria-label="${esc(t('nextSteps'))}">${workflowSteps()
      .map(
        (step, index) =>
          `<button data-action="${step.action}" class="${index === current ? 'current' : ''}"><span class="step-number">${step.done ? icon('check') : index + 1}</span>${esc(t(step.label))}</button>`,
      )
      .join('')}</nav>`;
  }

  return { reachableHistory, workflowSteps, workflowBar };
}
