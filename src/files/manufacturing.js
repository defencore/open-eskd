import * as C from '../domain/index.js';
import { translate } from '../i18n/index.js';
import {
  routeLinkIndex,
  routeLinkLines,
} from '../domain/manufacturing-description.js';

export function manufacturingGuide(project) {
  const s = C.working(project);
  const childrenByParent = C.childIndex(s);
  const docsByComponent = new Map();
  for (const doc of s.documents) {
    if (!docsByComponent.has(doc.componentId))
      docsByComponent.set(doc.componentId, []);
    docsByComponent.get(doc.componentId).push(doc);
  }
  const totals = new Map(C.flatten(s).map((c) => [c.id, c.totalQuantity]));
  const value = (v) => v || 'Not specified';
  const t = (key) => translate('en', key);
  const linkIndex = routeLinkIndex(s, t);
  const plan = C.operationPlan(s)
    .map(
      ({ component: c, step, index, sequence, stage, prerequisites }) =>
        `${sequence}. ${C.placementLabel(c, linkIndex.placements, false)} — ${step ? `${index + 1}. ${t('operation_' + step.operation)}` : 'Route not defined'}${step ? ` (dependency stage ${stage})` : ''}\n   - Required before: ${prerequisites.length ? C.prerequisiteLabels(prerequisites, linkIndex.placements, t).join('; ') : 'None'}`,
    )
    .join('\n');
  return (
    `# Manufacturing plan\n\nProject: ${s.meta.name}\nDesignation: ${s.meta.designation}\nBranch: ${project.activeBranch}\nVersion baseline: ${C.head(project).version}\nWorking changes: ${C.dirty(project) ? 'Yes' : 'No'}\n\nComponent routes are grouped by structure. The operation order below accounts for route sequence, prerequisites and linked inputs. Independent tasks can run in parallel. This is a configuration plan, not a record of completed production. Verify the approved documentation and process instructions before use.\n\n## Operations order\n\n${plan}\n\n## Component routes\n\n` +
    C.productionOrder(s)
      .map((c, index) => {
        const route = c.manufacturing;
        const inputs = childrenByParent.get(c.id) || [];
        const docs = docsByComponent.get(c.id) || [];
        return `## ${index + 1}. ${C.placementLabel(c, linkIndex.placements, false)} — ${c.name}\n\n- Type: ${c.type}\n- Revision: ${c.revision}\n- Component identity: ${c.definitionId}\n- Catalog revision: ${c.source?.revisionId || 'Editable working definition'}\n- Total quantity: ${totals.get(c.id)} ${c.unit}\n- Status: ${c.status}\n- Responsible engineer: ${value(c.owner)}\n- Manufacturing location: ${value(c.manufacturer)}\n- Technology: ${route.technology ? t('technology_' + route.technology) : 'Not specified'}\n- Material: ${value(c.material)}\n- Blank / stock: ${value(route.stock)}\n- Preparation: ${value(route.preparation)}\n- Process summary: ${value(c.process)}\n\n### Required components per parent item\n\n${inputs.length ? inputs.map((child) => `- ${C.placementLabel(child, linkIndex.placements)}: ${child.quantity} ${child.unit}`).join('\n') : 'None'}\n\n### Documents\n\n${docs.length ? docs.map((d) => `- ${d.name} (revision ${d.revision}) · ${d.path}${d.sha256 ? ' · SHA-256 ' + d.sha256 : ''}`).join('\n') : 'None'}\n\n### Operations\n\n${
          route.steps.length
            ? route.steps
                .map(
                  (step, i) =>
                    `${i + 1}. **${t('operation_' + step.operation)}**\n   - Instructions: ${value(step.instructions)}\n   - Inputs: ${value(step.inputs)}\n   - Equipment: ${value(step.equipment)}\n   - Location: ${value(step.facility || c.manufacturer)}\n   - Result / check: ${value(step.check)}${routeLinkLines(
                      step,
                      linkIndex,
                      t,
                      true,
                    )
                      .map((line) => '\n   - ' + line)
                      .join('')}`,
                )
                .join('\n\n')
            : 'No operations defined.'
        }\n\n${c.notes}\n`;
      })
      .join('\n')
  );
}
