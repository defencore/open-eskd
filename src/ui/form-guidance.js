import { esc } from '../shared/html.js';
import { icon } from './icons.js';
import { templateOperations } from '../domain/manufacturing.js';

const guides = {
  projectName: 'guideProjectName',
  projectWorkflow: 'guideProjectWorkflow',
  provenanceBasis: 'guideProvenanceBasis',
  provenanceConfidence: 'guideProvenanceConfidence',
  provenanceReference: 'guideProvenanceReference',
  provenanceNotes: 'guideProvenanceNotes',
  component: 'guideFileComponent',
  documentType: 'guideFileType',
  documentRevision: 'guideFileRevision',
  filePath: 'guideFilePath',
  fileHash: 'guideFileHash',
  fileRequirement: 'guideFileRequirement',
  batchName: 'guideBatchName',
  batchMode: 'guideBatchMode',
  batchQuantity: 'guideBatchQuantity',
  batchAuthor: 'guideBatchAuthor',
  acceptedQuantity: 'guideAccepted',
  rejectedQuantity: 'guideRejected',
  resultOperator: 'guideOperator',
  resultNotes: 'guideResultNotes',
  evidencePath: 'guideEvidence',
  projectDesignation: 'guideProjectDesignation',
  projectOwner: 'guideProjectOwner',
  description: 'guideDescription',
  name: 'guideName',
  designation: 'guideDesignation',
  parent: 'guideParent',
  quantity: 'guideQuantity',
  unit: 'guideUnit',
  owner: 'guideOwner',
  material: 'guideMaterial',
  manufacturer: 'guideManufacturer',
  process: 'guideProcess',
  technology: 'guideTechnology',
  stock: 'guideStock',
  preparation: 'guidePreparation',
  routeOperation: 'guideRouteOperation',
  routeInstructions: 'guideRouteInstructions',
  routeInputs: 'guideRouteInputs',
  routeEquipment: 'guideRouteEquipment',
  routeFacility: 'guideRouteFacility',
  routeCheck: 'guideRouteCheck',
  routeDependencyComponent: 'guideDependencyComponent',
  routeDependencyOperation: 'guideDependencyOperation',
  routeInputComponent: 'guideInputComponent',
  routeInputUsage: 'guideInputUsage',
  routeInputQuantity: 'guideInputQuantity',
  routeDocument: 'guideOperationDocument',
  notes: 'guideNotes',
  revision: 'guideRevision',
  createRoot: 'guideCreateRoot',
  bulkInput: 'guideBulkInput',
};
const statusGuides = {
  draft: 'guideProgress',
  review: 'guideReview',
  released: 'guideReleased',
};
const typeGuides = {
  part: 'guidePart',
  assembly: 'guideAssembly',
  complex: 'guideComplex',
  set: 'guideSet',
  standard: 'guideStandard',
  purchased: 'guidePurchased',
  material: 'guideStockMaterial',
};

export function createFormGuidance(context) {
  let sequence = 0;
  const t = (...args) => context.t(...args);
  const typeLabels = new Set(['type', 'rootType', 'bulkDefaultType']);

  function guidanceContent(label, value, selectedType = '') {
    let prefix = typeLabels.has(label) ? typeGuides[value] : guides[label];
    if (label === 'status') prefix = statusGuides[value];
    if (label === 'documentType' && value === 'image')
      prefix = 'guideFileImage';
    if (
      label === 'routeOperation' &&
      ['drilling', 'pressFit', 'fitting', 'fastening'].includes(value)
    )
      prefix = 'guideOperation' + value[0].toUpperCase() + value.slice(1);
    if (label === 'rootType' && value === 'deferred')
      prefix = 'guideDeferredType';
    if (label === 'createRoot' && value === 'empty') prefix = 'guideEmptyRoot';
    let examples = prefix;
    if (['name', 'projectName'].includes(label) && selectedType)
      examples =
        'guideNames' + selectedType[0].toUpperCase() + selectedType.slice(1);
    if (label === 'unit' && selectedType === 'material')
      examples = 'guideMaterialUnits';
    const choice =
      (typeLabels.has(label) && value !== 'deferred') ||
      label === 'status' ||
      (['technology', 'routeOperation'].includes(label) && value);
    const choiceLabel =
      label === 'technology'
        ? t('technology_' + value)
        : label === 'routeOperation'
          ? t('operation_' + value)
          : t(value);
    const sequence =
      label === 'technology' && value
        ? `<p><strong>${esc(t('templateSequence'))}</strong> ${esc(
            templateOperations(value)
              .map((op) => t('operation_' + op))
              .join(' → '),
          )}</p>`
        : '';
    return `<strong class="info-tooltip-title">${esc(t(label))}${choice ? ' · ' + esc(choiceLabel) : ''}</strong><p>${esc(t(prefix + 'Help'))}</p>${sequence}<strong class="info-examples-title">${esc(t('guideExamples'))}</strong><ul>${['Example', 'Example2', 'Example3'].map((suffix) => `<li><code>${esc(t(examples + suffix))}</code></li>`).join('')}</ul><p class="guide-rule">${esc(t(prefix + 'Rule'))}</p>`;
  }

  function infoButton(label, id) {
    return `<button type="button" class="field-info" aria-label="${esc(t('fieldHelp') + ': ' + t(label))}" aria-describedby="${id}" aria-expanded="false" data-info-tooltip="${id}">${icon('info')}</button>`;
  }

  function tooltip(label, value, id) {
    return `${infoButton(label, id)}<div id="${id}" class="info-tooltip" role="tooltip" hidden data-guide-label="${label}" data-guide-value="${esc(typeLabels.has(label) || ['status', 'technology', 'routeOperation', 'documentType'].includes(label) ? value : '')}">${guidanceContent(label, value)}</div>`;
  }

  function wrap(label, value, control, full = false) {
    const id = `field-guide-${++sequence}`;
    return `<div class="guided-field${full ? ' full' : ''}">${control(`aria-describedby="${id}"`)}${tooltip(label, value, id)}</div>`;
  }

  function guidedField(label, name, value = '', extra = '', type = 'text') {
    return wrap(label, value, (attributes) =>
      context.field(label, name, value, `${extra} ${attributes}`, type),
    );
  }

  function guidedSelect(label, name, options, value, extra = '') {
    return wrap(label, value, (attributes) =>
      context.selectField(
        label,
        name,
        options,
        value,
        `${extra} ${attributes}`,
      ),
    );
  }

  function guidedTextarea(
    label,
    name,
    value = '',
    extra = '',
    attributes = '',
  ) {
    return wrap(
      label,
      value,
      (description) =>
        context.textarea(
          label,
          name,
          value,
          '',
          `${attributes} ${description}`,
        ),
      extra.split(' ').includes('full'),
    );
  }

  function rootCheckbox() {
    const id = `field-guide-${++sequence}`;
    return `<div class="guided-field"><label class="field checkbox"><input type="checkbox" name="createRoot" checked aria-describedby="${id}"><span>${esc(t('createRoot'))}</span></label>${tooltip('createRoot', '', id)}</div>`;
  }

  function updateFormGuidance(target) {
    const form = target.closest('form');
    if (!form) return;
    const root = form.elements.namedItem('createRoot');
    const type =
      form.elements.namedItem('rootType') || form.elements.namedItem('type');
    if (root && type) type.disabled = !root.checked;
    const selectedType = root && !root.checked ? '' : type?.value || '';
    for (const panel of form.querySelectorAll('[data-guide-label]')) {
      const label = panel.dataset.guideLabel;
      let value = panel.dataset.guideValue;
      if (typeLabels.has(label)) value = type.value;
      if (label === 'rootType' && root && !root.checked) value = 'deferred';
      if (label === 'createRoot') value = root.checked ? '' : 'empty';
      if (label === 'status') value = form.elements.namedItem('status').value;
      if (label === 'documentType')
        value = form.elements.namedItem('kind').value;
      if (label === 'technology')
        value = form.elements.namedItem('technology').value;
      if (label === 'routeOperation')
        value = panel
          .closest('.guided-field')
          .querySelector('[data-step-field=operation]').value;
      panel.innerHTML = guidanceContent(label, value, selectedType);
    }
  }

  return {
    guidedField,
    guidedSelect,
    guidedTextarea,
    rootCheckbox,
    updateFormGuidance,
    guidanceContent,
  };
}
