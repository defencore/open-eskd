import {
  routeLinkIndex,
  routeLinkLines,
} from '../domain/manufacturing-description.js';

export function createValueFormatting(context) {
  const t = (...args) => context.t(...args);
  function formatFieldValue(field, value) {
    if (value === undefined) return t('deletedValue');
    if (value === null || value === '') return '—';
    if (field === 'extensions') return JSON.stringify(value, null, 2);
    if (value && typeof value === 'object' && Array.isArray(value.steps)) {
      const linkIndex = routeLinkIndex(
        context.snapshot?.() || { components: [], documents: [] },
        t,
      );
      return [
        `${t('technology')}: ${value.technology ? t('technology_' + value.technology) : '—'}`,
        `${t('stock')}: ${value.stock || '—'}`,
        `${t('preparation')}: ${value.preparation || '—'}`,
        ...(value.extensions
          ? [`${t('extensions')}: ${JSON.stringify(value.extensions)}`]
          : []),
        ...value.steps.map(
          (step, index) =>
            `${index + 1}. ${t('operation_' + step.operation)}\n${[
              'instructions',
              'inputs',
              'equipment',
              'facility',
              'check',
            ]
              .filter((key) => step[key])
              .map(
                (key) =>
                  `  ${t({ instructions: 'routeInstructions', inputs: 'routeInputs', equipment: 'routeEquipment', facility: 'routeFacility', check: 'routeCheck' }[key])}: ${step[key]}`,
              )
              .concat(
                step.extensions
                  ? [`${t('extensions')}: ${JSON.stringify(step.extensions)}`]
                  : [],
              )
              .concat(
                routeLinkLines(step, linkIndex, t, true).map(
                  (line) => '  ' + line,
                ),
              )
              .join('\n')}`,
        ),
      ].join('\n');
    }
    if (typeof value === 'object')
      return Object.entries(value)
        .filter(([key]) => key !== 'id')
        .map(([key, item]) => `${t(key)}: ${formatFieldValue(key, item)}`)
        .join('\n');
    if (field === 'workflow') return t('workflow_' + value);
    if (field === 'basis') return t('origin_' + value);
    if (field === 'confidence') return t('confidence_' + value);
    if (['type', 'status'].includes(field)) return t(value);
    return String(value);
  }
  return { formatFieldValue };
}
