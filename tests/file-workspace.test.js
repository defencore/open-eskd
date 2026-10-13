import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import { createFileWorkspace } from '../src/ui/file-workspace.js';
import { createPersistence } from '../src/application/persistence.js';
import { ProjectStore, openDatabase } from '../src/storage/projects.js';
import { IDBFactory } from 'fake-indexeddb';

function context(p) {
  const state = {
      projects: [p],
      projectId: p.id,
      storageMode: 'persistent',
      pendingWrites: 0,
      unsaved: new Map(),
    },
    diagnostics = [];
  return {
    state,
    diagnostics,
    project: () => state.projects.find((p) => p.id === state.projectId),
    updateSaveState() {},
    render() {},
    toast() {},
    t: (key) => key,
    fmtDate: (value) => value,
    button: () => '',
    reportError: (...args) => diagnostics.push(args),
  };
}
async function checked(name) {
  const p = C.createProject({ name });
  p.fileCheck = {
    schema: 'open-eskd-file-check-1',
    projectId: p.id,
    fingerprint: await E.configurationFingerprint(p),
    checkedAt: C.now(),
    files: [],
  };
  return p;
}
const bytes = (hex) =>
  Uint8Array.from(hex.match(/../g), (value) => parseInt(value, 16)).buffer;

test('an older asynchronous file check cannot overwrite another project status', async (t) => {
  const left = await checked('Left'),
    right = await checked('Right'),
    ctx = context(left);
  ctx.state.projects.push(right);
  const view = createFileWorkspace(ctx),
    pending = [];
  t.mock.method(
    crypto.subtle,
    'digest',
    () => new Promise((resolve) => pending.push(resolve)),
  );
  const old = view.refreshFileCheck();
  ctx.state.projectId = right.id;
  const current = view.refreshFileCheck();
  pending[1](bytes(right.fileCheck.fingerprint));
  await current;
  pending[0](bytes('0'.repeat(64)));
  await old;
  assert(view.fileWorkspace().includes('lastFileCheck'));
  assert(!view.fileWorkspace().includes('fileCheckStale'));
});

test('unavailable hashing keeps the workspace usable and clearly marks the check unavailable', async (t) => {
  const p = await checked('Offline'),
    ctx = context(p),
    view = createFileWorkspace(ctx);
  t.mock.method(crypto.subtle, 'digest', async () => {
    throw Error('Unavailable crypto');
  });
  await view.refreshFileCheck();
  assert(view.fileWorkspace().includes('fileCheckUnavailable'));
  assert.equal(ctx.diagnostics.length, 1);
});

test('a display refresh failure cannot label a successful database save as failed', async () => {
  const p = C.createProject({ name: 'Saved data' }),
    ctx = context(p),
    store = new ProjectStore(await openDatabase(new IDBFactory()));
  ctx.refreshFileCheck = async () => {
    throw Error('Refresh failed');
  };
  ctx.state.unsaved.set(p.id, { reason: 'saveFailed' });
  const outcome = await createPersistence(ctx, store).persist();
  assert.equal(outcome.persisted, true);
  assert.equal(ctx.state.unsaved.size, 0);
  assert.equal(ctx.state.saveState, 'saved');
  assert.deepEqual(await store.readCurrent(p.id), p);
  assert.equal(ctx.diagnostics[0][0], 'file check');
  store.database.close();
});
