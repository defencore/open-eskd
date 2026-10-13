import { esc } from '../shared/html.js';

export function createFormPresets(context) {
  let sequence = 0;
  const t = (...args) => context.t(...args);

  function suggestedField(label, name, value = '', extra = '', type = 'text') {
    const s = context.snapshot();
    const suggestions =
      {
        projectDesignation: ['PRJ.001.000', 'PRJ.001.000.000'],
        unit: ['pcs', 'kg', 'g', 'm', 'mm', 'L', 'set'],
        revision: ['A', 'B', 'C', '01', '02'],
        material: [
          'steel',
          'aluminium',
          'stainless',
          'copper',
          'PA6',
          'PLA',
          'PETG',
          'ABS',
        ].map((v) => t('materialPreset_' + v)),
        stock: ['sheet', 'bar', 'tube', 'casting', 'filament', 'resin'].map(
          (v) => t('stockPreset_' + v),
        ),
        routeEquipment: [
          'printer',
          'mill',
          'lathe',
          'laser',
          'assembly',
          'inspection',
        ].map((v) => t('equipmentPreset_' + v)),
        owner: [
          context.state.author,
          s.meta.owner,
          ...s.components.map((c) => c.owner),
        ],
        projectOwner: [
          context.state.author,
          s.meta.owner,
          ...s.components.map((c) => c.owner),
        ],
        manufacturer: s.components.map((c) => c.manufacturer),
        routeFacility: s.components.flatMap((c) => [
          c.manufacturer,
          ...c.manufacturing.steps.map((step) => step.facility),
        ]),
      }[label] || [];
    const choices = [...new Set(suggestions.filter(Boolean))];
    if (!choices.length)
      return context.guidedField(label, name, value, extra, type);
    const id = `field-presets-${++sequence}`;
    return (
      context.guidedField(label, name, value, `${extra} list="${id}"`, type) +
      `<datalist id="${id}">${choices.map((choice) => `<option value="${esc(choice)}"></option>`).join('')}</datalist>`
    );
  }

  return { suggestedField };
}
