import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';

const engine = process.env.ESKD_PS_ENGINE || 'pwsh';
assert(['pwsh', 'powershell'].includes(engine));
const available = spawnSync(
  engine,
  [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    '$PSVersionTable.PSVersion.ToString()',
  ],
  { encoding: 'utf8' },
);
if (process.env.ESKD_REQUIRE_POWERSHELL === '1')
  assert.equal(
    available.status,
    0,
    'Required PowerShell engine is unavailable.',
  );
const skip =
  available.status !== 0
    ? 'PowerShell is not installed; the Windows CI job runs this suite.'
    : false;
const quote = (value) => "'" + value.replaceAll("'", "''") + "'";
const expectSuccess = (result) =>
  assert.equal(
    result.status,
    0,
    [result.error?.message, result.stdout, result.stderr]
      .filter(Boolean)
      .join('\n'),
  );
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'open-eskd-ps-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const p = C.createProject({ name: 'PowerShell audit' }),
    content = 'Controlled Unicode content: Україна 日本';
  C.working(p).documents = [
    {
      id: 'drawing',
      name: "測定'$.txt",
      path: "documents/測定'$.txt",
      componentId: null,
      kind: 'instructions',
      revision: 'A',
      sha256: null,
      required: true,
    },
  ];
  const { hash } = await import('../src/files/zip/binary.js');
  C.working(p).documents[0].sha256 = await hash(
    new TextEncoder().encode(content),
  );
  const scripts = await E.filesystemScripts(p, 'powershell', true);
  for (const kind of ['create', 'check'])
    await writeFile(path.join(root, kind + '.ps1'), '\ufeff' + scripts[kind]);
  const run = (name, ...args) =>
    spawnSync(
      engine,
      [
        '-NoProfile',
        '-NonInteractive',
        '-File',
        path.join(root, name + '.ps1'),
        ...args,
      ],
      { encoding: 'utf8', timeout: 30000 },
    );
  async function check(name) {
    const output = path.join(root, name + '.json');
    await writeFile(
      path.join(root, 'capture.ps1'),
      '\ufeff& ' +
        quote(path.join(root, 'check.ps1')) +
        ' ' +
        quote(root) +
        ' | Out-File -LiteralPath ' +
        quote(output) +
        ' -Encoding utf8 -NoClobber\n',
    );
    expectSuccess(run('capture'));
    return JSON.parse((await readFile(output, 'utf8')).replace(/^\ufeff/, ''));
  }
  return { root, p, content, run, check };
}

test(
  'PowerShell preserves existing files and reports missing, marker and verified Unicode paths',
  { skip },
  async (t) => {
    const { root, p, content, run, check } = await fixture(t);
    let report = await check('missing');
    assert.equal(report.files[0].status, 'missing');
    expectSuccess(run('create', root));
    report = await check('marker');
    assert.equal(report.files[0].status, 'placeholder');
    const real = path.join(root, C.working(p).documents[0].path),
      marker = real + '.eskd-placeholder';
    await writeFile(real, content);
    await writeFile(marker, 'Existing owner marker');
    expectSuccess(run('create', root));
    assert.equal(await readFile(real, 'utf8'), content);
    assert.equal(await readFile(marker, 'utf8'), 'Existing owner marker');
    report = await check('verified');
    assert.equal(report.files[0].status, 'verified');
    assert.equal(report.files[0].path, C.working(p).documents[0].path);
    await E.acceptFileCheck(p, report);
  },
);

test(
  'PowerShell detects empty and changed files without modifying them',
  { skip },
  async (t) => {
    const { root, p, run, check } = await fixture(t);
    expectSuccess(run('create', root));
    const file = path.join(root, C.working(p).documents[0].path);
    await writeFile(file, '');
    assert.equal((await check('empty')).files[0].status, 'empty');
    await writeFile(file, 'Changed owner bytes');
    assert.equal((await check('mismatch')).files[0].status, 'mismatch');
    assert.equal(await readFile(file, 'utf8'), 'Changed owner bytes');
  },
);

test(
  'PowerShell rejects managed reparse points and leaves their targets untouched',
  {
    skip:
      skip ||
      (process.platform !== 'win32' ? 'Windows reparse-point check.' : false),
  },
  async (t) => {
    const { root, run, check } = await fixture(t),
      outside = path.join(root, 'outside');
    await mkdir(outside);
    await writeFile(path.join(outside, 'keep.txt'), 'Keep');
    await symlink(outside, path.join(root, 'documents'), 'junction');
    assert.notEqual(run('create', root).status, 0);
    assert.equal((await check('unsafe')).files[0].status, 'unsafe');
    assert.equal(
      await readFile(path.join(outside, 'keep.txt'), 'utf8'),
      'Keep',
    );
  },
);
