import * as C from '../domain/index.js';
import { translate as localize } from '../i18n/index.js';
import {
  routeLinkIndex,
  routeLinkLines,
} from '../domain/manufacturing-description.js';

export function csv(snapshot, translate = (key) => key) {
  const linkIndex = routeLinkIndex(snapshot, (key) => localize('en', key));
  const headers = [
    'designation',
    'name',
    'type',
    'revision',
    'parent',
    'quantity',
    'totalQuantity',
    'unit',
    'material',
    'manufacturer',
    'process',
    'technology',
    'stock',
    'preparation',
    'manufacturingRoute',
    'owner',
    'status',
    'productionDocs',
    'definitionId',
    'placementId',
    'catalogRevisionId',
    'catalogComponentId',
  ];
  const row = (values) =>
    values
      .map((value) => {
        let string = String(value ?? '');
        if (/^(?:[\t\r\n]|\s*[=+@-])/.test(string)) string = "'" + string;
        return '"' + string.replace(/"/g, '""') + '"';
      })
      .join(',');
  return (
    '\ufeff' +
    [
      row(headers.map(translate)),
      ...C.flatten(snapshot).map((c) =>
        row([
          c.designation,
          c.name,
          translate(c.type),
          c.revision,
          snapshot.components.find((p) => p.id === c.parentId)?.designation ||
            '',
          c.quantity,
          c.totalQuantity,
          c.unit,
          c.material,
          c.manufacturer,
          c.process,
          c.manufacturing.technology
            ? localize('en', 'technology_' + c.manufacturing.technology)
            : '',
          c.manufacturing.stock,
          c.manufacturing.preparation,
          c.manufacturing.steps
            .map(
              (step, index) =>
                `${index + 1}. ${localize('en', 'operation_' + step.operation)}: ${step.instructions}${routeLinkLines(
                  step,
                  linkIndex,
                  (key) => localize('en', key),
                  true,
                )
                  .map((line) => '\n  ' + line)
                  .join('')}`,
            )
            .join('\n'),
          c.owner,
          translate(c.status),
          snapshot.documents
            .filter((d) => d.componentId === c.id)
            .map((d) => d.name)
            .join('; '),
          c.definitionId,
          c.id,
          c.source?.revisionId || '',
          c.source?.componentId || '',
        ]),
      ),
    ].join('\r\n')
  );
}
