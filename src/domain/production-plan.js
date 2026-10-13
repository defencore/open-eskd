import { operationPlan } from './manufacturing.js';
import { operationKey } from './manufacturing-links.js';

export function batchTasks(batch) {
  return operationPlan(batch.snapshot)
    .filter((task) => task.step)
    .map((task) => ({
      ...task,
      quantity: task.quantity * batch.quantity,
      key: operationKey(task.component.id, task.step.id),
    }));
}

export function batchProgress(batch) {
  const tasks = batchTasks(batch);
  const byKey = new Map(tasks.map((task) => [task.key, task]));
  const byComponent = new Map();
  const children = new Map();
  const results = new Map();
  for (const c of batch.snapshot.components) {
    if (!children.has(c.parentId)) children.set(c.parentId, []);
    children.get(c.parentId).push(c.id);
  }
  for (const task of tasks) {
    if (!byComponent.has(task.component.id))
      byComponent.set(task.component.id, []);
    byComponent.get(task.component.id).push(task);
    results.set(task.key, { accepted: 0, rejected: 0, events: [] });
  }
  for (const event of batch.results) {
    const result = results.get(
      operationKey(event.componentId, event.operationId),
    );
    if (result) {
      result.accepted += event.accepted;
      result.rejected += event.rejected;
      result.events.push(event);
    }
  }
  return { tasks, byKey, byComponent, children, results };
}

export function taskResult(batch, key, progress = batchProgress(batch)) {
  return progress.results.get(key) || { accepted: 0, rejected: 0, events: [] };
}

export function productionPrerequisites(
  batch,
  task,
  progress = batchProgress(batch),
) {
  const required = new Map();
  for (const previous of task.prerequisites) {
    if (previous.step) {
      const item = progress.byKey.get(
        operationKey(previous.component.id, previous.step.id),
      );
      required.set(item.key, item);
    } else {
      const queue = [previous.component.id];
      let found = false;
      for (let i = 0; i < queue.length; i++) {
        queue.push(...(progress.children.get(queue[i]) || []));
        for (const item of progress.byComponent.get(queue[i]) || []) {
          required.set(item.key, item);
          found = true;
        }
      }
      if (!found) {
        const error = new Error(
          'Define an inspection or production operation for every required input: ' +
            previous.component.designation,
        );
        error.code = 'production-input-route';
        error.info = previous.component.designation;
        throw error;
      }
    }
  }
  return [...required.values()];
}

export function quantityAccepted(actual, target) {
  if (!Number.isFinite(actual) || !Number.isFinite(target)) return false;
  if (actual >= target) return true;
  if (Number.isInteger(actual) && Number.isInteger(target)) return false;
  return Math.abs(actual - target) <= Math.abs(target) * Number.EPSILON * 8;
}
