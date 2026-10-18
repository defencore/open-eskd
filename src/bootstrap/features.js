import { createProvenanceEditor } from '../ui/provenance-editor.js';
import { createFileWorkspace } from '../ui/file-workspace.js';
import { createCatalogView } from '../ui/views/catalog.js';
import { createCatalogDialogs } from '../ui/dialogs/catalog.js';
import { createShell } from '../ui/shell.js';
import { createEvents } from '../ui/events.js';
import { createFeedback } from '../ui/feedback.js';
import { createDialog } from '../ui/dialog.js';
import { createComponents } from '../ui/components.js';
import { createFormGuidance } from '../ui/form-guidance.js';
import { createInfoTooltips } from '../ui/info-tooltip.js';
import { createFormPresets } from '../ui/form-presets.js';
import { createManufacturingEditor } from '../ui/manufacturing-editor.js';
import { createRouteLinks } from '../ui/route-links.js';
import { createOperationPlan } from '../ui/operation-plan.js';
import { createManufacturingPlan } from '../ui/manufacturing-plan.js';
import { createValueFormatting } from '../ui/value-formatting.js';
import { createWorkflow } from '../ui/workflow.js';
import { createDocumentsDialogs } from '../ui/dialogs/documents.js';
import { createMergeDialogs } from '../ui/dialogs/merge.js';
import { createComponentDialogs } from '../ui/dialogs/component.js';
import { createProjectDialogs } from '../ui/dialogs/project.js';
import { createRevisionDialogs } from '../ui/dialogs/revision.js';
import { createDocumentsView } from '../ui/views/documents.js';
import { createProjectsView } from '../ui/views/projects.js';
import { createHistoryView } from '../ui/views/history.js';
import { createOverviewView } from '../ui/views/overview.js';
import { createStructureView } from '../ui/views/structure.js';
import { createManufacturingView } from '../ui/views/manufacturing.js';
import { createSettingsView } from '../ui/views/settings.js';
import { createProductionView } from '../ui/production/view.js';
import { createProductionDialogs } from '../ui/production/dialogs.js';
import { createExamplesView } from '../ui/views/examples.js';
import { createVerificationView } from '../ui/verification/view.js';
import { createVerificationDialogs } from '../ui/verification/dialogs.js';
import { createVerificationEvidenceEditor } from '../ui/verification/evidence-editor.js';
import { createNavigation } from '../application/navigation.js';
import { createExchange } from '../application/exchange.js';
import { attachFeature } from './context.js';

const features = [
  createProvenanceEditor,
  createFileWorkspace,
  createCatalogView,
  createCatalogDialogs,
  createShell,
  createEvents,
  createFeedback,
  createDialog,
  createComponents,
  createFormGuidance,
  createInfoTooltips,
  createFormPresets,
  createManufacturingEditor,
  createRouteLinks,
  createOperationPlan,
  createManufacturingPlan,
  createValueFormatting,
  createWorkflow,
  createDocumentsDialogs,
  createMergeDialogs,
  createComponentDialogs,
  createProjectDialogs,
  createRevisionDialogs,
  createDocumentsView,
  createProjectsView,
  createHistoryView,
  createOverviewView,
  createStructureView,
  createManufacturingView,
  createSettingsView,
  createProductionView,
  createProductionDialogs,
  createExamplesView,
  createVerificationView,
  createVerificationDialogs,
  createVerificationEvidenceEditor,
  createNavigation,
  createExchange,
];

export function composeFeatures(context) {
  for (const factory of features) attachFeature(context, factory);
  return context;
}
