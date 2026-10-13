# Integration and automation

The domain core is native ECMAScript modules with no runtime dependencies. It uses standard Web APIs (`structuredClone`, `crypto`, `TextEncoder`). Node.js 22.13+ supports these APIs. The same modules run in the browser bundle; the UI and IndexedDB are separate layers.

## Programmatic core

The repository exports `open-eskd/core`, `open-eskd/files` and `open-eskd/schema` for integrations within a checkout or a derived package. The package remains private; no registry publication is implied.

```js
import {
  createProject,
  component,
  working,
  validateProject,
} from 'open-eskd/core';
import { filesystemScripts, projectReport } from 'open-eskd/files';

const project = createProject({
  name: 'Fixture',
  designation: 'FIX.001',
  workflow: 'design',
});
working(project).components.push(
  component({ name: 'Housing', designation: 'FIX.001.001', type: 'part' }),
);
validateProject(project);
const scripts = await filesystemScripts(project, 'bash', false);
const html = await projectReport(project, 'en');
```

Mutations and derivations are explicit. `validateProject` returns the input on success and throws `ValidationError` (or a specific graph/path error) on failure. Validate cloned candidates before replacing accepted state. Domain validation is semantic; use JSON Schema as well when claiming both conformance layers. `scripts/lib/conformance.mjs` demonstrates this with Ajv, a tooling dependency excluded from the browser bundle.

Use `working`, `head`, `commit`, catalog APIs, `createBatch`, `recordResult`, `readiness`, `fileInventory` and `operationPlan` instead of reimplementing their rules in UI code. Read their feature modules and tests for precise arguments. Object identity is not a designation or a filename. Never rewrite existing commit/catalog/result identities during exchange.

## Command-line tools

CLI and SDK use require a source checkout. The offline application package includes the schema and guides, but does not include Node.js tools.

After `npm ci`, tools accept a current manifest or standard input (`--input -`). They do not load CAD files, execute generated scripts or contact a server.

```sh
node scripts/project-cli.mjs validate --input examples/staged-assembly.json
node scripts/project-cli.mjs inventory --input project.json
node scripts/project-cli.mjs scripts --input project.json --platform bash --kind create --markers --output create-project.sh
node scripts/project-cli.mjs scripts --input project.json --platform powershell --kind check --output check-project.ps1
node scripts/project-cli.mjs report --input project.json --lang en --output report.html
```

`--output` creates a new file exclusively and fails if it already exists. Without it, output goes to stdout. PowerShell artifacts include a UTF-8 BOM for Windows PowerShell 5.1. Reports can select `--batch <id>` and `--facility <exact-name>`; facility names are literal labels.

Validation emits JSON with `valid`, `errors`, and on success `schemaVersion`. Errors include a validation stage and structural path where available. Exit codes: 0 success, 1 nonconforming manifest for the `validate` command, 2 input/option/output failure or invalid input for an artifact command. A syntax error is a tool-stage error on stderr.

## Format publication

`src/domain/schema.js` is authoritative for the structural schema. `npm run schema` emits its formatted JSON; `npm run schema:check` detects divergence. The build publishes `/schema/project-v6.json` and includes it in the offline package. Review [CONFORMANCE.md](CONFORMANCE.md) for semantic rules and [GOVERNANCE.md](GOVERNANCE.md) for format changes.

For organizational extensions, document a reverse-DNS namespace and separate payload schema. Core validators preserve these annotations but do not interpret them. An automation that changes a captured batch or saved revision must create a new record/configuration rather than rewriting the old one.
