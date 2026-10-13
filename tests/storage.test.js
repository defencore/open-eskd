import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { openDatabase, ProjectStore } from '../src/storage/projects.js';
import { createPersistence } from '../src/application/persistence.js';
import * as C from '../src/domain/index.js';

async function stores() {
  const factory = new IDBFactory();
  const first = new ProjectStore(await openDatabase(factory));
  const second = new ProjectStore(await openDatabase(factory));
  return { first, second };
}
function project() {
  return C.createProject({ name: 'Concurrent project', designation: 'P.001' });
}
function context(p) {
  const messages = [];
  const state = {
    projects: [p],
    projectId: p.id,
    storageMode: 'persistent',
    unsaved: new Map(),
  };
  const context = {
    state,
    project: () => state.projects[0],
    updateSaveState() {},
    render() {},
    navigate() {},
    t: (key) => key,
    toast: (message, error = false) => messages.push({ message, error }),
  };
  return { context, messages, state };
}

test('save and reload preserve canonical database records', async () => {
  const { first, second } = await stores(),
    p = project();
  await first.save(p);
  assert.deepEqual((await second.load()).projects, [p]);
  assert.equal(second.database.version, 2);
});
test('simultaneous tab writes cannot overwrite another tab even with equal timestamps', async () => {
  const { first, second } = await stores(),
    initial = project();
  await first.save(initial);
  await second.load();
  const left = C.clone(initial),
    right = C.clone(initial);
  C.working(left).meta.description = 'Left work';
  C.working(right).meta.owner = 'Right engineer';
  const results = await Promise.allSettled([
    first.save(left),
    second.save(right),
  ]);
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1,
  );
  const failed = results.find((result) => result.status === 'rejected');
  assert.equal(failed.reason.code, 'storage-conflict');
  assert.equal(
    (await first.readCurrent(initial.id)).branches.main.working.meta
      .description,
    'Left work',
  );
});
test('a project not read by this tab cannot overwrite a stored identity', async () => {
  const { first, second } = await stores(),
    p = project();
  await first.save(p);
  await assert.rejects(second.save(p), { code: 'storage-conflict' });
});
test('deletion detects newer changes from another tab', async () => {
  const { first, second } = await stores(),
    p = project();
  await first.save(p);
  await second.load();
  C.working(p).meta.description = 'Newer work';
  await first.save(p);
  await assert.rejects(second.remove(p.id), { code: 'storage-conflict' });
  assert.equal(
    (await first.readCurrent(p.id)).branches.main.working.meta.description,
    'Newer work',
  );
});
test('one damaged stored record does not hide valid projects or remove raw recovery data', async () => {
  const { first } = await stores(),
    p = project();
  await first.save(p);
  await new Promise((resolve, reject) => {
    const tx = first.database.transaction('projects', 'readwrite');
    tx.objectStore('projects').put({ id: 'damaged', schema: 'unknown' });
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  const result = await first.load();
  assert.deepEqual(result.projects, [p]);
  assert.equal(result.rejected.length, 1);
  assert.equal(result.rejected[0].record.id, 'damaged');
  assert.deepEqual(
    await first.readCurrent('damaged'),
    result.rejected[0].record,
  );
});
test('quota failure keeps work in memory and suppresses a successful save message', async () => {
  const p = project(),
    { context: ctx, state, messages } = context(p);
  const persistence = createPersistence(ctx, {
    save: async () => {
      throw new DOMException('Full', 'QuotaExceededError');
    },
  });
  Object.assign(ctx, persistence);
  assert.equal((await persistence.persist()).persisted, false);
  persistence.success('updated');
  assert.equal(state.projects[0], p);
  assert.equal(state.unsaved.get(p.id).reason, 'saveFailed');
  assert.deepEqual(messages, [{ message: 'storageError', error: true }]);
});
test('a successful retry clears only the persisted project failure', async () => {
  const p = project(),
    { context: ctx, state, messages } = context(p);
  let fail = true;
  Object.assign(
    ctx,
    createPersistence(ctx, {
      save: async () => {
        if (fail) throw Error('quota');
      },
    }),
  );
  await ctx.persist();
  fail = false;
  assert.equal((await ctx.persist()).persisted, true);
  ctx.success('updated');
  assert.equal(state.unsaved.size, 0);
  assert.equal(messages.at(-1).message, 'updated');
});
test('session-only projects are marked unsaved even with a clean saved snapshot', async () => {
  const p = project(),
    { context: ctx, state, messages } = context(p);
  state.storageMode = 'session';
  Object.assign(ctx, createPersistence(ctx));
  await ctx.persist();
  ctx.success('created');
  assert.equal(C.dirty(p), false);
  assert.equal(state.unsaved.get(p.id).reason, 'sessionOnly');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].error, true);
});
test('browser recovery retains local work and places other tab work in an incoming branch', async () => {
  const { first, second } = await stores(),
    initial = project();
  await first.save(initial);
  const local = (await second.load()).projects[0];
  C.working(initial).meta.description = 'Other tab';
  await first.save(initial);
  C.working(local).meta.owner = 'Local engineer';
  const { context: ctx, state } = context(local);
  Object.assign(ctx, createPersistence(ctx, second));
  await ctx.persist();
  assert.equal(state.saveState, 'storageConflict');
  await ctx.recoverBrowserChanges();
  const recovered = state.projects[0];
  assert.equal(C.working(recovered).meta.owner, 'Local engineer');
  assert.equal(
    recovered.branches['incoming/main'].working.meta.description,
    'Other tab',
  );
  assert.equal(state.unsaved.size, 0);
  assert.deepEqual(await first.readCurrent(initial.id), recovered);
});
test('a database deleted in another tab can be restored by explicit recovery', async () => {
  const { first, second } = await stores(),
    p = project();
  await first.save(p);
  await second.load();
  await first.remove(p.id);
  const { context: ctx, state } = context(p);
  Object.assign(ctx, createPersistence(ctx, second));
  await ctx.persist();
  assert.equal(state.saveState, 'storageConflict');
  await ctx.recoverBrowserChanges();
  assert.equal(state.unsaved.size, 0);
  assert.equal((await first.readCurrent(p.id)).id, p.id);
});

test('rendering cannot hide a pending write or mark another queued write complete', async () => {
  const p = project(),
    { context: ctx, state } = context(p);
  const resolvers = [];
  Object.assign(
    ctx,
    createPersistence(ctx, {
      save: () => new Promise((resolve) => resolvers.push(resolve)),
    }),
  );
  const first = ctx.persist();
  await Promise.resolve();
  ctx.updateStatus();
  assert.equal(state.saveState, 'saving');
  const second = ctx.persist();
  resolvers.shift()();
  await first;
  await Promise.resolve();
  assert.equal(state.pendingWrites, 1);
  assert.equal(state.saveState, 'saving');
  resolvers.shift()();
  await second;
  assert.equal(state.pendingWrites, 0);
  assert.equal(state.saveState, 'saved');
});

test('unsupported raw records are not acknowledged for overwrite', async () => {
  const { first } = await stores(),
    p = project();
  const raw = { ...p, schemaVersion: 2 };
  await new Promise((resolve, reject) => {
    const tx = first.database.transaction('projects', 'readwrite');
    tx.objectStore('projects').put(raw);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  const loaded = await first.load();
  assert.equal(loaded.projects.length, 0);
  assert.equal(loaded.rejected.length, 1);
  await assert.rejects(first.save(p), { code: 'storage-conflict' });
  assert.deepEqual(await first.readCurrent(p.id), raw);
});
