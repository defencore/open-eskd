import { build } from 'esbuild';
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { esc } from '../src/shared/html.js';
import { writeSchema } from './schema.mjs';
import { create } from '../src/files/zip/writer.js';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const output = path.join(root, 'dist');
const bundleOptions = {
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome113', 'firefox113', 'safari17'],
  minify: true,
  charset: 'utf8',
  legalComments: 'none',
};
const publishedDocuments = ['LICENSE', 'NOTICE', 'schema/project-v6.json'];
const assets = [
  'index.html',
  'app.js',
  'app.css',
  'manifest.webmanifest',
  'assets/icon.svg',
];
const offlineDocuments = [
  ...['CONFORMANCE', 'GOVERNANCE', 'INTEGRATION'].map((name) => ({
    source: `docs/${name}.md`,
    destination: `docs/${name}.md`,
  })),
  { source: 'docs/OFFLINE.md', destination: 'README.md' },
  { source: 'docs/WORKFLOW.md', destination: 'docs/WORKFLOW.md' },
  { source: 'docs/COMPONENTS.md', destination: 'docs/COMPONENTS.md' },
  { source: 'docs/FORMAT.md', destination: 'docs/FORMAT.md' },
  { source: 'docs/FILESYSTEM.md', destination: 'docs/FILESYSTEM.md' },
  { source: 'docs/PRODUCTION.md', destination: 'docs/PRODUCTION.md' },
  { source: 'docs/VERIFICATION.md', destination: 'docs/VERIFICATION.md' },
  { source: 'docs/MANUFACTURING.md', destination: 'docs/MANUFACTURING.md' },
  { source: 'docs/STAGED_ASSEMBLY.md', destination: 'docs/STAGED_ASSEMBLY.md' },
  { source: 'docs/COMPLEX_EXAMPLE.md', destination: 'docs/COMPLEX_EXAMPLE.md' },
  {
    source: 'examples/inspection-complex.json',
    destination: 'examples/inspection-complex.json',
  },
  {
    source: 'examples/quick-start.json',
    destination: 'examples/quick-start.json',
  },
  {
    source: 'examples/staged-assembly.json',
    destination: 'examples/staged-assembly.json',
  },
];

async function exampleCompanionDocuments() {
  const directory = 'examples/inspection-complex-files',
    allowed = new Set(['.md', '.csv', '.json', '.log', '.tsv', '.txt']),
    decoder = new TextDecoder('utf-8', { fatal: true }),
    documents = [];
  let total = 0,
    visited = 0;
  async function visit(relative = '', depth = 0) {
    if (depth > 8) throw new Error('Example companion directory is too deep.');
    const entries = await readdir(path.join(root, directory, relative), {
      withFileTypes: true,
    });
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      if (++visited > 256)
        throw new Error('Example companion directory has too many entries.');
      const file = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink())
        throw new Error('Example companions cannot contain symbolic links.');
      if (entry.isDirectory()) await visit(file, depth + 1);
      else if (entry.isFile() && allowed.has(path.extname(entry.name))) {
        const source = `${directory}/${file}`,
          filename = path.join(root, source),
          details = await stat(filename);
        total += details.size;
        if (
          details.size > 256 * 1024 ||
          total > 2 * 1024 * 1024 ||
          documents.length >= 100
        )
          throw new Error('Example text companions exceed packaging limits.');
        const data = new Uint8Array(await readFile(filename)),
          value = decoder.decode(data);
        if (
          [...value].some((character) => {
            const code = character.codePointAt(0);
            return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
          })
        )
          throw new Error('Example companions must contain UTF-8 text.');
        documents.push({ source, destination: source, data });
      }
    }
  }
  await visit();
  return documents;
}

export async function buildSite() {
  const packageDocuments = [
    ...offlineDocuments,
    ...(await exampleCompanionDocuments()),
  ];
  await writeSchema(true);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(path.join(root, 'public'), output, { recursive: true });
  for (const file of publishedDocuments) {
    await mkdir(path.dirname(path.join(output, file)), { recursive: true });
    await cp(path.join(root, file), path.join(output, file));
  }
  await build({
    ...bundleOptions,
    outfile: path.join(output, 'app.js'),
    define: { __STANDALONE__: 'false' },
  });
  const notices = (
    await Promise.all(
      ['LICENSE', 'NOTICE'].map((file) =>
        readFile(path.join(root, file), 'utf8'),
      ),
    )
  ).join('\n\n');
  const shell = (
    await readFile(path.join(output, 'index.html'), 'utf8')
  ).replace(
    '</body>',
    `<template id="license-text">${esc(notices)}</template>\n</body>`,
  );
  await writeFile(path.join(output, 'index.html'), shell);
  // One classic bundle works both over HTTPS and in the portable HTML document.
  const portable = await build({
    ...bundleOptions,
    write: false,
    outfile: 'app.js',
    define: { __STANDALONE__: 'true' },
  });
  const source = portable.outputFiles.find((file) =>
    file.path.endsWith('.js'),
  ).text;
  const css = portable.outputFiles.find((file) =>
    file.path.endsWith('.css'),
  ).text;
  const icon = `data:image/svg+xml;base64,${(await readFile(path.join(root, 'public/assets/icon.svg'))).toString('base64')}`;
  const html = await readFile(path.join(output, 'index.html'), 'utf8');
  const inline = html
    .replace(/\s*<link rel="manifest"[^>]+>/, '')
    .replace('href="assets/icon.svg"', `href="${icon}"`)
    .replace(
      /<link rel="stylesheet" href="app.css"[^>]*>/,
      () => `<style>${css}</style>`,
    )
    .replace(/\s*<script src="app.js" defer><\/script>/, '')
    .replace(
      '</body>',
      () =>
        `<script>${source.replaceAll('assets/icon.svg', icon).replace(/<\/script/gi, '<\\/script')}</script>\n</body>`,
    );
  await writeFile(path.join(output, 'open-eskd.html'), inline);
  const digest = createHash('sha256');
  for (const file of assets)
    digest.update(await readFile(path.join(output, file)));
  for (const file of publishedDocuments)
    digest.update(await readFile(path.join(root, file)));
  for (const document of packageDocuments)
    digest.update(
      document.data ?? (await readFile(path.join(root, document.source))),
    );
  digest.update(await readFile(fileURLToPath(import.meta.url)));
  const template = await readFile(
    path.join(root, 'scripts/templates/service-worker.js'),
    'utf8',
  );
  digest.update(template);
  const version = digest.digest('hex').slice(0, 16);
  let hosted = html.replace(
    '<html lang="uk">',
    `<html lang="uk" data-build="${version}">`,
  );
  for (const file of assets.filter((file) => file !== 'index.html'))
    hosted = hosted.replaceAll(`="${file}"`, `="${file}?build=${version}"`);
  await writeFile(path.join(output, 'index.html'), hosted);
  await writeFile(
    path.join(output, 'sw.js'),
    template.replace('__BUILD_HASH__', version),
  );
  const entries = [];
  for (const file of [
    ...assets,
    ...publishedDocuments,
    'sw.js',
    'open-eskd.html',
  ]) {
    entries.push({
      name: `open-eskd/${file}`,
      data: new Uint8Array(await readFile(path.join(output, file))),
    });
  }
  for (const { source, destination, data } of packageDocuments)
    entries.push({
      name: `open-eskd/${destination}`,
      data: data ?? new Uint8Array(await readFile(path.join(root, source))),
    });
  await writeFile(
    path.join(output, 'open-eskd-offline.zip'),
    Buffer.from(await create(entries).arrayBuffer()),
  );
  return { version, output };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await buildSite();
  process.stdout.write(
    `Static site: dist/ (${result.version})\nPortable HTML: dist/open-eskd.html\nOffline package: dist/open-eskd-offline.zip\n`,
  );
}
