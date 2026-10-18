import { readFile, writeFile } from 'node:fs/promises';
import * as E from '../src/files/index.js';
import { checkConformance } from './lib/conformance.mjs';

const help = `Open ESKD manifest tools (no engineering file ingestion)
Usage: node scripts/project-cli.mjs <command> --input <project.json|-> [options]
  validate       Print structural and semantic validation as JSON
  inventory      Print expected external files and directories as JSON
  scripts        --platform bash|powershell --kind create|check [--markers]
  report         [--lang en|ua] [--batch <id>] [--facility <name>]
Options: --output <new-file> writes exclusively; existing files are never overwritten.
Without --output, artifacts are written to standard output. Scripts are generated, never executed.
`;
function options(args) {
  const result = { command: args[0] };
  for (let i = 1; i < args.length; i++) {
    const key = args[i];
    if (
      ![
        '--input',
        '--output',
        '--platform',
        '--kind',
        '--markers',
        '--lang',
        '--batch',
        '--facility',
      ].includes(key) ||
      key in result
    )
      throw new Error('Unknown or duplicate option: ' + key);
    if (key === '--markers') result[key] = true;
    else {
      if (args[i + 1] === undefined || args[i + 1].startsWith('--'))
        throw new Error('Missing value: ' + key);
      result[key] = args[++i];
    }
  }
  return result;
}
async function input(path) {
  if (!path)
    throw new Error(
      'Specify --input project.json or --input - for standard input.',
    );
  let bytes;
  if (path === '-') {
    const chunks = [];
    let size = 0;
    for await (const chunk of process.stdin) {
      size += chunk.length;
      if (size > 200 * 1024 * 1024) throw new Error('Manifest exceeds 200 MB.');
      chunks.push(chunk);
    }
    bytes = Buffer.concat(chunks);
  } else bytes = await readFile(path);
  if (bytes.length > 200 * 1024 * 1024)
    throw new Error('Manifest exceeds 200 MB.');
  return JSON.parse(
    new TextDecoder('utf-8', { fatal: true })
      .decode(bytes)
      .replace(/^\uFEFF/, ''),
  );
}
async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args[0] === '--help') {
    process.stdout.write(help);
    return;
  }
  const config = options(args);
  if (!['validate', 'inventory', 'scripts', 'report'].includes(config.command))
    throw new Error('Unknown command. Use --help.');
  const allowed = {
    validate: [],
    inventory: [],
    scripts: ['--platform', '--kind', '--markers'],
    report: ['--lang', '--batch', '--facility'],
  }[config.command];
  for (const key of Object.keys(config))
    if (!['command', '--input', '--output', ...allowed].includes(key))
      throw new Error('Option does not apply to this command: ' + key);
  const project = await input(config['--input']);
  const result = checkConformance(project);
  let artifact;
  if (config.command === 'validate') {
    artifact = JSON.stringify(result, null, 2) + '\n';
    if (!result.valid) process.exitCode = 1;
  } else {
    if (!result.valid)
      throw new Error(
        result.errors
          .map((error) => error.path + ': ' + error.message)
          .join('\n'),
      );
    if (config.command === 'inventory')
      artifact =
        JSON.stringify(E.projectFileInventory(project), null, 2) + '\n';
    if (config.command === 'scripts') {
      const platform = config['--platform'];
      const kind = config['--kind'];
      if (
        !['bash', 'powershell'].includes(platform) ||
        !['create', 'check'].includes(kind)
      )
        throw new Error(
          'Choose --platform bash|powershell and --kind create|check.',
        );
      artifact = (
        await E.filesystemScripts(
          project,
          platform,
          Boolean(config['--markers']),
        )
      )[kind];
      if (platform === 'powershell') artifact = '\uFEFF' + artifact;
    }
    if (config.command === 'report') {
      const language = config['--lang'] || 'en';
      if (!['en', 'ua'].includes(language))
        throw new Error('Choose --lang en|ua.');
      const batch = config['--batch']
        ? project.production.find((batch) => batch.id === config['--batch'])
        : null;
      if (config['--batch'] && !batch)
        throw new Error('The batch was not found.');
      artifact = await E.projectReport(
        project,
        language,
        batch,
        config['--facility'] ?? null,
      );
    }
  }
  if (config['--output']) {
    await writeFile(config['--output'], artifact, { flag: 'wx' });
    process.stderr.write('Created ' + config['--output'] + '\n');
  } else process.stdout.write(artifact);
}
try {
  await main();
} catch (error) {
  process.stderr.write(
    JSON.stringify({
      valid: false,
      errors: [{ stage: 'tool', message: error.message }],
    }) + '\n',
  );
  process.exitCode = 2;
}
