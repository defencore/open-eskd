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

Use `working`, `head`, `commit`, catalog APIs, `createBatch`, `recordResult`, `readiness` and `operationPlan` instead of reimplementing their rules in UI code. `fileInventory(snapshot)` derives snapshot-only document paths; `projectFileInventory(project)` from the files package also includes every verification session's procedure and artifact paths. Read their feature modules and tests for precise arguments. Object identity is not a designation or a filename. Never rewrite existing commit/catalog/result/session identities during exchange.

## Verification sessions

Continuing from the fixture above, save a configuration before recording a test. The optional profile is created only when needed; schema-6 projects without it remain valid.

```js
import { commit, now, recordVerificationRun } from 'open-eskd/core';
import { projectFileInventory } from 'open-eskd/files';

const candidate = structuredClone(project);
const baseline = commit(candidate, {
  author: 'Engineer',
  message: 'Capture the configuration to be tested',
  version: '1.0-test',
});
const run = recordVerificationRun(candidate, {
  name: 'Bench observation 001',
  testCase: 'TC-BENCH-001',
  procedurePath: 'verification/procedures/TC-BENCH-001-A.pdf',
  performedAt: now(),
  operator: 'Test engineer',
  componentId: baseline.snapshot.components[0].id,
  commitId: baseline.id,
  branch: candidate.activeBranch,
  batchId: null,
  operationId: null,
  retestOf: null,
  outcome: 'inconclusive',
  summary: 'Recording complete; interpretation remains pending.',
  artifacts: [
    ['camera-01', 'video', 'camera-01.mp4'],
    ['camera-02', 'video', 'camera-02.mp4'],
    ['acquisition', 'log', 'acquisition.log'],
    ['protocol', 'protocol', 'protocol.pdf'],
  ].map(([id, kind, filename]) => ({
    id,
    title: filename,
    kind,
    path: 'verification/TC-BENCH-001/RUN-001/' + filename,
    sha256: null,
    required: true,
    notes: '',
  })),
});
validateProject(candidate);
const inventory = projectFileInventory(candidate);
```

`recordVerificationRun` generates an ID when none is supplied and returns a clone. All other run fields must be explicit. Use `verificationRuns(project)` and `verificationSnapshot(project, run)` for reading; `mergeVerification` preserves independent runs and rejects identity collisions. With `batchId`, supply the selected batch's `commitId` and `branch`; component/operation IDs resolve against its captured snapshot. A new retest uses `retestOf: run.id`, the same case and component, new evidence paths, and its own explicit configuration/result. Do not update the old session in place.

The interpreted project-only profile has limits of 1,000 runs, 1,000 artifacts per run, 10,000 artifacts total and 16 MiB. The complete file inventory is limited to 21,000 entries. Generic unknown annotations remain bounded to 64 KiB. `configurationFingerprint` includes the full profile, so session or evidence edits make prior file checks stale. None of these APIs read media bytes or infer engineering acceptance. See [VERIFICATION.md](VERIFICATION.md) for complete field semantics.

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

The inventory command includes current document paths and all recorded test procedures/artifacts, deduplicated with combined requirements and consistent hashes. Reports show sessions separately from operation quantities. A batch report includes only explicitly batch-assigned sessions; a facility report resolves the pinned operation/component and excludes unscoped global sessions.

Validation emits JSON with `valid`, `errors`, and on success `schemaVersion`. Errors include a validation stage and structural path where available. Exit codes: 0 success, 1 nonconforming manifest for the `validate` command, 2 input/option/output failure or invalid input for an artifact command. A syntax error is a tool-stage error on stderr.

## Format publication

`src/domain/schema.js` is authoritative for the structural schema. `npm run schema` emits its formatted JSON; `npm run schema:check` detects divergence. The build publishes `/schema/project-v6.json` and includes it in the offline package. Review [CONFORMANCE.md](CONFORMANCE.md) for semantic rules and [GOVERNANCE.md](GOVERNANCE.md) for format changes.

For organizational extensions, document a reverse-DNS namespace and separate payload schema. Core validators preserve unknown annotations without interpreting their engineering meaning. `org.openeskd.verification` is a reserved, interpreted version-1 project profile whose semantics are included in the published schema and conformance rules. An automation that changes a captured batch, saved revision or recorded test must create a new record/configuration rather than rewriting the old one.
