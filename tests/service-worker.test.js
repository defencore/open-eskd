import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

const build = '1234567890abcdef';
const source = (
  await readFile(
    new URL('../scripts/templates/service-worker.js', import.meta.url),
    'utf8',
  )
).replace('__BUILD_HASH__', build);

function fixture(origin = 'https://example.test') {
  const listeners = new Map();
  const stores = new Map([
    ['open-eskd-previous', new Map()],
    ['another-application', new Map()],
  ]);
  const requests = [];
  let network = async () => 'network';
  let installed = false;
  let claimed = false;
  const scope = origin + '/eskd/';
  const self = {
    location: new URL(scope + 'sw.js?build=' + build),
    registration: { scope },
    clients: { claim: async () => (claimed = true) },
    skipWaiting: async () => (installed = true),
    addEventListener: (name, listener) => listeners.set(name, listener),
  };
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        addAll: async (urls) => {
          for (const url of urls) {
            requests.push(url);
            store.set(url, 'cached:' + url);
          }
        },
        match: async (key) => store.get(key),
      };
    },
  };
  new Script(source).runInNewContext({
    self,
    caches,
    URL,
    fetch: (request) => network(request),
  });
  const lifecycle = (name) => {
    let pending;
    listeners.get(name)({ waitUntil: (value) => (pending = value) });
    return pending;
  };
  const fetch = (path, method = 'GET') => {
    let pending;
    listeners.get('fetch')({
      request: { url: new URL(path, scope).href, method },
      respondWith: (value) => (pending = value),
    });
    return pending;
  };
  return {
    requests,
    stores,
    lifecycle,
    fetch,
    setNetwork: (callback) => (network = callback),
    installed: () => installed,
    claimed: () => claimed,
  };
}

test('installation pins all cached resources to one build and activation preserves unrelated caches', async () => {
  const worker = fixture();
  await worker.lifecycle('install');
  assert.equal(worker.requests.length, 6);
  assert(worker.requests.every((url) => url.endsWith('?build=' + build)));
  assert.equal(worker.installed(), true);
  await worker.lifecycle('activate');
  assert(!worker.stores.has('open-eskd-previous'));
  assert(worker.stores.has('another-application'));
  assert.equal(worker.claimed(), true);
});

test('hosted requests use the pinned build while another build and unrelated URLs pass through', async () => {
  const worker = fixture();
  await worker.lifecycle('install');
  worker.setNetwork(async () => {
    throw new Error('Offline');
  });
  assert.equal(
    await worker.fetch('app.js?build=' + build),
    'cached:https://example.test/eskd/app.js?build=' + build,
  );
  assert.equal(
    await worker.fetch('./'),
    'cached:https://example.test/eskd/?build=' + build,
  );
  assert.equal(worker.fetch('app.js?build=another'), undefined);
  assert.equal(worker.fetch('project.json'), undefined);
  assert.equal(worker.fetch('https://another.test/app.js'), undefined);
  assert.equal(worker.fetch('app.js', 'POST'), undefined);
});

test('local previews prefer current network responses and retain an offline fallback', async () => {
  const worker = fixture('http://localhost:8093');
  await worker.lifecycle('install');
  assert.equal(await worker.fetch('app.js?build=' + build), 'network');
  worker.setNetwork(async () => {
    throw new Error('Offline');
  });
  assert.equal(
    await worker.fetch('app.js?build=' + build),
    'cached:http://localhost:8093/eskd/app.js?build=' + build,
  );
});
