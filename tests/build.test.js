import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Script } from 'node:vm';
import { buildSite, root, output } from '../scripts/build.mjs';
import { read } from '../src/files/zip/reader.js';
import { SUPPLIED_EXAMPLE_PATHS } from '../src/data/complex-example/constants.js';

async function companionFiles(directory, relative = '') {
  const files = [];
  for (const entry of await readdir(path.join(directory, relative), {
    withFileTypes: true,
  })) {
    const filename = relative ? relative + '/' + entry.name : entry.name;
    if (entry.isDirectory())
      files.push(...(await companionFiles(directory, filename)));
    else if (entry.isFile()) files.push(filename);
    else assert.fail('Example companions must be ordinary text files.');
  }
  return files.sort();
}

test('production artifacts are portable, deterministic and ready for the custom domain', async () => {
  const example = await readFile(path.join(root, 'examples/quick-start.json'));
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'stale-artifact.txt'), 'Old build');
  const first = await buildSite();
  const html = await readFile(path.join(output, 'index.html'), 'utf8');
  assert.match(html, /src="app.js\?build=[a-f0-9]{16}" defer/);
  assert.match(html, /href="app.css\?build=[a-f0-9]{16}"/);
  assert(html.includes(`data-build="${first.version}"`));
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))
    assert(
      (await readFile(path.join(output, match[1].split('?')[0]))).length > 0,
    );
  assert.equal(
    await readFile(path.join(output, 'CNAME'), 'utf8'),
    'eskd.defencore.com\n',
  );
  assert.equal(await readFile(path.join(output, '.nojekyll'), 'utf8'), '');
  const standalone = await readFile(
    path.join(output, 'open-eskd.html'),
    'utf8',
  );
  assert(!/<(?:script|link)[^>]+(?:src|href)="(?!data:)/.test(standalone));
  assert(!standalone.includes('src="assets/icon.svg"'));
  assert.match(standalone, /data:image\/svg\+xml;base64/);
  assert.match(standalone, /<template id="license-text">/);
  assert(
    standalone.includes(
      'TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION',
    ),
  );
  assert(standalone.includes('Open ESKD contributors'));
  assert(html.includes('<template id="license-text">'));
  for (const artifact of [html, standalone]) {
    const policy = artifact.match(
      /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/,
    )?.[1];
    assert(policy, 'Both application builds must include the privacy policy');
    assert(policy.includes("script-src 'self' 'unsafe-inline'"));
    assert(policy.includes("connect-src 'none'"));
    assert(policy.includes("worker-src 'self'"));
    assert(!policy.includes('https:'));
  }
  const inlineScript = standalone.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert(inlineScript, 'The portable application script must be embedded');
  assert.doesNotThrow(
    () => new Script(inlineScript),
    'Inlining must preserve JavaScript dollar signs and valid syntax',
  );
  const zip = await read(
    new Blob([await readFile(path.join(output, 'open-eskd-offline.zip'))]),
  );
  assert(zip.some((entry) => entry.name === 'open-eskd/open-eskd.html'));
  assert(zip.some((entry) => entry.name === 'open-eskd/docs/WORKFLOW.md'));
  assert(
    zip.some((entry) => entry.name === 'open-eskd/docs/COMPLEX_EXAMPLE.md'),
  );
  assert(zip.some((entry) => entry.name === 'open-eskd/docs/VERIFICATION.md'));
  for (const file of [
    'inspection-complex.json',
    'inspection-complex-files/README.md',
    'inspection-complex-files/verification/evidence/SIM-001/dataset-manifest.json',
    'inspection-complex-files/verification/evidence/SIM-001/telemetry.synthetic.csv',
  ])
    assert(zip.some((entry) => entry.name === `open-eskd/examples/${file}`));
  const companionRoot = path.join(root, 'examples/inspection-complex-files'),
    companions = await companionFiles(companionRoot),
    packagedCompanions = zip.filter((entry) =>
      entry.name.startsWith('open-eskd/examples/inspection-complex-files/'),
    );
  assert(
    companions.length >= 44,
    'Both synthetic evidence collections must ship.',
  );
  assert.deepEqual(
    packagedCompanions.map((entry) => entry.name).sort(),
    companions.map(
      (file) => `open-eskd/examples/inspection-complex-files/${file}`,
    ),
  );
  for (const file of companions) {
    const entry = packagedCompanions.find((item) =>
      item.name.endsWith('/' + file),
    );
    assert.deepEqual(
      Buffer.from(entry.data),
      await readFile(path.join(companionRoot, file)),
    );
    assert.doesNotThrow(() =>
      new TextDecoder('utf-8', { fatal: true }).decode(entry.data),
    );
  }
  for (const file of SUPPLIED_EXAMPLE_PATHS)
    assert(
      companions.includes(file),
      `The supplied fixture must ship: ${file}`,
    );
  const complex = JSON.parse(
    await readFile(path.join(root, 'examples/inspection-complex.json'), 'utf8'),
  );
  for (const run of complex.extensions['org.openeskd.verification'].runs)
    for (const artifact of run.artifacts.filter((item) => item.required))
      assert(
        companions.includes(artifact.path),
        `Required synthetic evidence must ship: ${artifact.path}`,
      );
  assert(
    !zip.some((entry) =>
      /\.(?:mp4|mov|webm|mkv|jpe?g|png|gif|pdf|step|stp|bin)$/i.test(
        entry.name,
      ),
    ),
  );
  assert(
    zip.some((entry) => entry.name === 'open-eskd/examples/quick-start.json'),
  );
  assert(zip.some((entry) => entry.name === 'open-eskd/LICENSE'));
  assert(
    zip.some((entry) => entry.name === 'open-eskd/schema/project-v6.json'),
  );
  const guide = zip.find((entry) => entry.name === 'open-eskd/README.md');
  assert.match(new TextDecoder().decode(guide.data), /open-eskd.html/);
  assert(
    !zip.some((entry) =>
      /DEPLOYMENT|ARCHITECTURE|CONTRIBUTING|node_modules|src\//.test(
        entry.name,
      ),
    ),
  );
  assert.deepEqual(
    (await readdir(output)).sort(),
    [
      'LICENSE',
      'NOTICE',
      'schema',
      '.nojekyll',
      'CNAME',
      'app.css',
      'app.js',
      'assets',
      'index.html',
      'manifest.webmanifest',
      'open-eskd-offline.zip',
      'open-eskd.html',
      'sw.js',
    ].sort(),
  );
  assert.deepEqual(await readdir(path.join(output, 'assets')), ['icon.svg']);
  assert.deepEqual(
    await readFile(path.join(root, 'examples/quick-start.json')),
    example,
  );
  const second = await buildSite();
  assert.equal(first.version, second.version);
});
