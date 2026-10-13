import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  symlink,
  stat,
  readdir,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import * as C from '../src/domain/index.js';
import * as E from '../src/files/index.js';
import { hash, encoder } from '../src/files/zip/index.js';
const execute = promisify(execFile);
function project() {
  const p = C.createProject({ name: 'File manifest', designation: 'P.001' });
  C.working(p).components.push(
    C.component({
      id: 'part',
      name: 'Part',
      designation: 'P.001.101',
      manufacturing: C.manufacturing({
        steps: [C.operation({ id: 'drill', operation: 'drilling' })],
      }),
    }),
  );
  return E.registerDocuments(p, [
    "CAD/Креслення з пробілом's $(touch HACKED).pdf",
    'CAD/empty.pdf',
    'CAD/hash.pdf',
    'CAD/not-supplied.pdf',
    'CAD/link.pdf',
  ]);
}
async function run(script, root) {
  const folder = await mkdtemp(join(tmpdir(), 'eskd-script-'));
  const file = join(folder, 'script.sh');
  await writeFile(file, script);
  try {
    return { ...(await execute('/bin/bash', [file, root])), code: 0 };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, code: error.code };
  }
}
test('portable path validation rejects traversal, Windows reserved names and directory conflicts', () => {
  for (const path of [
    '../part.pdf',
    '/part.pdf',
    'C:/file',
    'CAD\\file',
    'CAD//file',
    'CAD/CON.pdf',
    'CAD/file.',
    'CAD/file\n.pdf',
    'CAD/../file',
  ])
    assert(!C.validFilePath(path), path);
  assert(C.validFilePath("CAD/Креслення's.pdf"));
  let p = C.createProject({ name: 'Paths' });
  p = E.registerDocuments(p, ['CAD/part.pdf']);
  assert.throws(
    () => E.registerDocuments(p, ['cad/Part.pdf']),
    /case-insensitive/,
  );
  assert.throws(
    () => E.registerDocuments(p, ['CAD/part.pdf/child.txt']),
    /also a directory/,
  );
  assert.throws(
    () => E.registerDocuments(p, ['CAD/part.pdf.eskd-placeholder']),
    /reserved/,
  );
});
test('Bash 3.2 creation is repeatable, preserves originals and does not execute filenames', async () => {
  const p = project(),
    scripts = await E.filesystemScripts(p, 'bash', true);
  const root = await mkdtemp(join(tmpdir(), 'eskd-create-'));
  await mkdir(join(root, 'CAD'));
  await writeFile(join(root, 'CAD/hash.pdf'), 'Original unchanged');
  assert.equal((await run(scripts.create, root)).code, 0);
  assert.equal((await run(scripts.create, root)).code, 0);
  assert.equal(
    await readFile(join(root, 'CAD/hash.pdf'), 'utf8'),
    'Original unchanged',
  );
  assert(!(await readdir(root)).includes('HACKED'));
  assert((await stat(join(root, 'components/P.001.101/rev-A'))).isDirectory());
  assert(
    (await stat(join(root, 'CAD/not-supplied.pdf.eskd-placeholder'))).isFile(),
  );
});
test('Bash check is read-only and distinguishes present, empty, hash mismatch, placeholder and symlink', async () => {
  const p = project(),
    s = C.working(p);
  s.documents.find((d) => d.path === 'CAD/hash.pdf').sha256 = await hash(
    encoder.encode('Expected bytes'),
  );
  const scripts = await E.filesystemScripts(p, 'bash', true);
  const root = await mkdtemp(join(tmpdir(), 'eskd-check-'));
  await run(scripts.create, root);
  await writeFile(join(root, s.documents[0].path), 'Present bytes');
  await writeFile(join(root, 'CAD/empty.pdf'), '');
  await writeFile(join(root, 'CAD/hash.pdf'), 'Different bytes');
  const external = await mkdtemp(join(tmpdir(), 'eskd-external-'));
  await writeFile(join(external, 'file.pdf'), 'Outside');
  await symlink(join(external, 'file.pdf'), join(root, 'CAD/link.pdf'));
  const before = await readdir(join(root, 'CAD'));
  const result = await run(scripts.check, root);
  assert.equal(result.code, 1);
  const report = JSON.parse(result.stdout),
    statuses = report.files.map((file) => file.status);
  assert(statuses.includes('present'));
  assert(statuses.includes('empty'));
  assert(statuses.includes('mismatch'));
  assert(statuses.includes('placeholder'));
  assert(statuses.includes('unsafe'));
  await E.acceptFileCheck(p, report);
  assert.deepEqual(await readdir(join(root, 'CAD')), before);
  assert.equal(await readFile(join(external, 'file.pdf'), 'utf8'), 'Outside');
  await writeFile(join(root, 'CAD/hash.pdf'), 'Expected bytes');
  assert(
    JSON.parse((await run(scripts.check, root)).stdout).files.some(
      (file) => file.status === 'verified',
    ),
  );
});
test('creation refuses symlinked parent directories and leaves external locations untouched', async () => {
  const p = project(),
    scripts = await E.filesystemScripts(p, 'bash', true);
  const root = await mkdtemp(join(tmpdir(), 'eskd-link-root-')),
    external = await mkdtemp(join(tmpdir(), 'eskd-link-target-'));
  await symlink(external, join(root, 'CAD'));
  assert.equal((await run(scripts.create, root)).code, 2);
  assert.deepEqual(await readdir(external), []);
});
test('verification covers the exact configuration and reports become stale after a project edit', async () => {
  const p = project(),
    fingerprint = await E.configurationFingerprint(p);
  const report = {
    schema: 'open-eskd-file-check-1',
    projectId: p.id,
    fingerprint,
    checkedAt: C.now(),
    files: C.fileInventory(C.working(p)).files.map((file) => ({
      path: file.path,
      status: 'present',
    })),
  };
  await E.acceptFileCheck(p, report);
  const incomplete = C.clone(report);
  incomplete.files.pop();
  await assert.rejects(E.acceptFileCheck(p, incomplete), /does not cover/);
  C.working(p).components[0].revision = 'B';
  await assert.rejects(E.acceptFileCheck(p, report), /different configuration/);
  const html = await E.projectReport(p, 'en');
  assert(html.includes('repeat the file check'));
});
test('local HTML uses escaped relative image URLs and never embeds file bytes or executable project text', async () => {
  const p = project(),
    s = C.working(p);
  s.components[0].name = '<script>alert(1)</script>';
  s.documents[0].kind = 'image';
  s.documents[0].componentId = 'part';
  const html = await E.projectReport(p, 'ua');
  assert(html.includes('<img loading="lazy" src="./CAD/'));
  assert(html.includes('%D0%9A'));
  assert(html.includes('&lt;script&gt;'));
  assert(!html.includes('<script>'));
  assert(!html.includes('data:image'));
  assert(html.includes('Наявність файлу не підтверджує'));
});
test('PowerShell scripts quote paths, protect markers with CreateNew and use literal filesystem APIs', async () => {
  const scripts = await E.filesystemScripts(project(), 'powershell', true);
  assert(scripts.create.includes("''s $(touch HACKED)"));
  assert(scripts.create.includes('FileMode]::CreateNew'));
  assert(
    scripts.check.includes('[System.Security.Cryptography.SHA256]::Create()'),
  );
  assert(scripts.check.includes('$algorithm.ComputeHash($stream)'));
  assert(!scripts.check.includes('Get-FileHash'));
  assert(scripts.check.includes('ConvertTo-Json'));
  assert(
    !/Remove-Item|Set-Content|FileMode\]::Create\b/.test(
      scripts.create + scripts.check,
    ),
  );
});
test('empty file inventories still produce a valid verification result', async () => {
  const p = C.createProject({ name: 'Empty' }),
    scripts = await E.filesystemScripts(p, 'bash');
  const root = await mkdtemp(join(tmpdir(), 'eskd-empty-'));
  const report = JSON.parse((await run(scripts.check, root)).stdout);
  assert.deepEqual(report.files, []);
  await E.acceptFileCheck(p, report);
});
