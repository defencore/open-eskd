import { flatten, childIndex } from './structure.js';
import {
  operationKey,
  validateManufacturingLinks,
  routeError,
} from './manufacturing-links.js';

export function productionOrder(snapshot) {
  const children = childIndex(snapshot),
    ordered = [];
  function visit(component) {
    for (const child of children.get(component.id) || []) visit(child);
    ordered.push(component);
  }
  for (const root of children.get(null) || []) visit(root);
  return ordered;
}

// Completion nodes enforce assembly completeness without forcing all children
// to finish before an explicitly staged assembly operation can begin.
export function operationPlan(snapshot) {
  validateManufacturingLinks(snapshot);
  const ordered = productionOrder(snapshot),
    children = childIndex(snapshot);
  const components = new Map(snapshot.components.map((c) => [c.id, c]));
  const quantities = new Map(
    flatten(snapshot).map((c) => [c.id, c.totalQuantity]),
  );
  const nodes = new Map();
  const complete = (id) => JSON.stringify([id, null]);
  for (const component of ordered) {
    component.manufacturing.steps.forEach((step, index) =>
      nodes.set(operationKey(component.id, step.id), {
        component,
        step,
        index,
        quantity: quantities.get(component.id),
        outgoing: new Set(),
        pending: 0,
        stage: 1,
        prerequisites: [],
      }),
    );
    nodes.set(complete(component.id), {
      component,
      step: null,
      index: -1,
      quantity: quantities.get(component.id),
      outgoing: new Set(),
      pending: 0,
      stage: 0,
      prerequisites: [],
    });
  }
  function edge(from, to) {
    const source = nodes.get(from),
      target = nodes.get(to);
    if (!source.outgoing.has(to)) {
      source.outgoing.add(to);
      target.pending++;
    }
  }
  function requireComponent(component, key) {
    edge(complete(component.id), key);
    nodes.get(key).prerequisites.push({ component, step: null, index: -1 });
  }
  for (const component of ordered) {
    const steps = component.manufacturing.steps;
    const childComponents = children.get(component.id) || [];
    for (const child of childComponents)
      edge(complete(child.id), complete(component.id));
    steps.forEach((step, index) => {
      const key = operationKey(component.id, step.id),
        node = nodes.get(key);
      if (index) {
        edge(operationKey(component.id, steps[index - 1].id), key);
        node.prerequisites.push({
          component,
          step: steps[index - 1],
          index: index - 1,
        });
      }
      for (const ref of step.dependsOn) {
        edge(operationKey(ref.componentId, ref.operationId), key);
        const target = components.get(ref.componentId);
        const n = target.manufacturing.steps.findIndex(
          (s) => s.id === ref.operationId,
        );
        node.prerequisites.push({
          component: target,
          step: target.manufacturing.steps[n],
          index: n,
        });
      }
      const implicit =
        !step.componentInputs.length &&
        ['assembly', 'pressFit', 'fastening'].includes(step.operation)
          ? childComponents
          : [];
      for (const target of [
        ...implicit,
        ...step.componentInputs.map((ref) => components.get(ref.componentId)),
      ]) {
        requireComponent(target, key);
      }
    });
    if (steps.length) {
      edge(operationKey(component.id, steps.at(-1).id), complete(component.id));
      if (
        childComponents.length &&
        !steps.some(
          (step) =>
            step.componentInputs.length ||
            ['assembly', 'pressFit', 'fastening'].includes(step.operation),
        )
      ) {
        for (const child of childComponents)
          requireComponent(child, operationKey(component.id, steps[0].id));
      }
    }
  }
  const queue = [...nodes.keys()].filter((key) => !nodes.get(key).pending),
    tasks = [];
  for (let i = 0; i < queue.length; i++) {
    const node = nodes.get(queue[i]);
    if (node.step || !node.component.manufacturing.steps.length) {
      const { component, step, index, quantity, stage, prerequisites } = node;
      tasks.push({
        component,
        step,
        index,
        quantity,
        stage,
        prerequisites,
        sequence: tasks.length + 1,
      });
    }
    for (const key of node.outgoing) {
      const next = nodes.get(key);
      next.stage = Math.max(next.stage, node.stage + (next.step ? 1 : 0));
      if (!--next.pending) queue.push(key);
    }
  }
  if (queue.length !== nodes.size) {
    const blocked = [...nodes.values()]
      .filter((node) => node.pending && node.step)
      .slice(0, 5)
      .map((node) => `${node.component.designation} · ${node.index + 1}`);
    throw routeError('route-cycle', blocked.join(', '));
  }
  return tasks;
}

export function tasksByFacility(snapshot) {
  const groups = new Map();
  for (const task of operationPlan(snapshot)) {
    const facility = task.step?.facility || task.component.manufacturer || '';
    if (!groups.has(facility)) groups.set(facility, []);
    groups.get(facility).push(task);
  }
  return groups;
}
