import { watch } from 'node:fs';
import { buildSite, root } from './build.mjs';
import { serve } from './serve.mjs';
import path from 'node:path';
await buildSite();
const server = serve();
let timer,
  pending = false,
  building = false;
async function rebuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    await buildSite();
    process.stdout.write('Rebuilt. Refresh the browser to see changes.\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }
}
const watchers = [
  'src',
  'public',
  'docs',
  'examples',
  'schema',
  'scripts/templates',
].map((directory) =>
  watch(path.join(root, directory), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  }),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    clearTimeout(timer);
    watchers.forEach((watcher) => watcher.close());
    server.close(() => process.exit(0));
  });
