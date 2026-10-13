# Open ESKD interchange format

The canonical runtime uses schema version **6**, application version **3.0**. All current exports describe external files without embedding binary content.

## Project envelope

| Field                     | Meaning                                                 |
| ------------------------- | ------------------------------------------------------- |
| `schema`, `schemaVersion` | `open-eskd`, `6`                                        |
| `kind`                    | `project` or `component`                                |
| `id`                      | Stable project/package identity                         |
| `createdAt`, `updatedAt`  | UTC ISO timestamps                                      |
| `activeBranch`            | Existing branch name                                    |
| `branches`                | Map of `{head, working}` configurations                 |
| `commits`                 | Immutable project-version records                       |
| `catalog`                 | Immutable independently reusable component revisions    |
| `production`              | Frozen production batches and append-only result events |
| `fileCheck`               | Latest imported file verification, or `null`            |

IDs are unique strings of at most 100 characters. Reserved prototype keys are rejected. Unknown schema fields fail validation outside the defined `extensions` maps. Object identity, revision labels and product-tree positions serve different purposes.

## Snapshots

Every working copy, project version, catalog revision and batch snapshot contains `meta`, `components` and `documents`. Metadata contains `name`, `designation`, `description` and `owner`. Optional `workflow` is `design` or `decomposition`. Optional component `provenance` contains `basis` (`designed`, `observed`, `supplier`, `unspecified`), `confidence` (`unverified`, `measured`, `documented`), `reference` and `notes`. Observed information requires a verification level and evidence reference before readiness succeeds.

A component contains `id`, `definitionId`, `source`, `baseRevisionId`, `parentId`, `name`, `designation`, `type`, `quantity`, `unit`, `revision`, `status`, `owner`, `material`, `manufacturer`, `process`, `manufacturing` and `notes`.

Types: `assembly`, `part`, `standard`, `purchased`, `material`, `complex`, `set`. Statuses: `draft`, `review`, `released`. Only assemblies, complexes and sets contain children. Positive finite quantities multiply through the tree, up to a safe integer total. Product hierarchy supports 64 levels independently of the number of groups in a designation. Three or four designation groups are naming choices, not hierarchy depth limits.

Repeated occurrences of the same definition may share a designation. Pinned `source` records contain `{revisionId, componentId, rootId}`; their definitions, internal structure and documents must equal the referenced catalog snapshot. Root placement quantity and parent remain occurrence-specific.

## Manufacturing route

`manufacturing` contains `technology`, `stock`, `preparation` and `steps`. Technology is blank or one of `printing3d`, `milling`, `turning`, `casting`, `laserCutting`, `sheetMetal`, `assembly`, `purchase`, `other`.

A step contains `id`, `operation`, `instructions`, `inputs`, `equipment`, `facility`, `check`, `dependsOn`, `componentInputs`, `documents`.

Operation codes include preparation, stock cutting, printing, milling, turning, drilling, casting, laser cutting, bending, post-processing, deburring, heat/surface treatment, assembly, press-fitting, fitting, fastening, inspection, testing, packing, purchase and other. The full authoritative catalog is `src/domain/manufacturing.js`.

- `dependsOn`: up to 100 unique `{componentId, operationId, revision, catalogRevisionId}` references.
- `componentInputs`: up to 100 unique `{componentId, revision, catalogRevisionId, quantity, usage}` records. Usage is `input` or `reference`; quantity is per one owner component.
- `documents`: up to 50 unique `{documentId, revision, path, sha256}` records. `sha256` is nullable.

References must resolve within the same snapshot. Changes to expected revisions, pins, paths or hashes produce readiness issues and require explicit review. Graph validation combines route sequence, explicit prerequisites, input completion and product-tree completion. Explicit assembly inputs support intermediate stages; unlinked assembly/press-fitting/fastening waits for immediate children. Cycles are rejected.

## File references

A document contains `id`, `name`, `path`, `componentId`, `kind`, `revision`, `sha256`, `required`. Component ID is valid or `null`. Kinds: `drawing`, `assemblyDrawing`, `specification`, `model`, `schematic`, `instructions`, `test`, `image`, `other`.

Paths use `/`, are relative to the root containing `project.json`, and cannot contain empty segments, `.`/`..`, absolute/drive prefixes, control characters or Windows-invalid/reserved filenames. Paths are at most 800 characters with 120 UTF-16 code-unit segments bounded to 200 UTF-8 bytes. OS-specific total-length limits still apply. Conflicting case-insensitive paths, file/directory collisions and reserved report/marker names are rejected.

`sha256` is `null` or 64 lowercase hexadecimal characters representing the expected real file bytes. `required` distinguishes essential files from intentionally optional or restricted files. Neither existence nor document approval is inferred from a metadata record.

## History and catalog

A commit contains `id`, `parents`, `author`, `message`, `version`, `status`, `createdAt`, `snapshot`. Parents resolve and the graph is acyclic. Branches contain `{head, working}`. Three-way merges treat structured routes atomically for conflict review.

A catalog revision contains `id`, `itemId`, `parents`, `label`, `author`, `message`, `status`, `createdAt`, `snapshot`. Its root has quantity 1 and the revision label. Component packages contain the selected revision's ancestry, dependency closure and an independent project baseline. Occurrence/document identities and controlled reference pins are remapped during reuse. External route references require publishing their containing assembly.

## Production

A batch contains `id`, `name`, `mode`, `quantity`, `author`, `createdAt`, `commitId`, `version`, `branch`, `snapshot`, `results`. Mode is `prototype` or `series`; quantity is a positive integer up to 1,000,000 project units. The snapshot captures working changes too; `commitId` identifies the saved baseline.

A result contains `id`, `createdAt`, `componentId`, `operationId`, `accepted`, `rejected`, `operator`, `notes`, `evidencePath`. Quantities are nonnegative, with a positive total per event. Rejections require notes; evidence is blank or a validated relative path. Cumulative accepted quantities cannot exceed the operation target; rejected attempts remain recorded after replacements. Dependency acceptance is checked before downstream recording. See [PRODUCTION.md](PRODUCTION.md).

## File verification

A verification result contains `schema: open-eskd-file-check-1`, `projectId`, `fingerprint`, `checkedAt`, `files`. File records contain only `path` and `status`. Allowed statuses are documented in [FILESYSTEM.md](FILESYSTEM.md).

The SHA-256 fingerprint hashes canonical sorted-key JSON of `{projectId, snapshot}`. Import requires exact inventory coverage and current fingerprint. Stored results remain visible as stale after configuration changes. Reports are local observations, not signed attestations.

## Exchange

A normal JSON is the complete metadata envelope. A metadata ZIP includes `project.json`, local `report.html`, Bash/PowerShell creation/check scripts and manufacturing CSV/Markdown. It contains no original CAD or drawing bytes. Ordinary file ZIPs without one Open ESKD manifest are rejected.

Only schema 6 is accepted. There is no compatibility converter or embedded binary store. Unsupported stored records are preserved untouched for export and external handling. See [CONFORMANCE.md](CONFORMANCE.md) for normative structural and semantic rules.

ZIP readers accept stored and DEFLATE entries with CRC validation and safe relative archive paths. Limits: 200 MiB input, 5,000 entries, 25 MiB per auxiliary entry; `project.json` is bounded by the 200 MiB archive/expanded limit, 10,000 components/documents per snapshot, 100 branches, 5,000 commits/catalog revisions, 100 operations per route, 1,000 batches and 100,000 result events per batch. Browser storage quota and device memory remain practical limits for large metadata histories.

## Organizational extensions

Optional `extensions` maps are allowed on the project, snapshot metadata, components, documents, routes, operations, commits, catalog revisions, batches and result events. Keys are reverse-DNS namespaces such as `org.example.quality`. Each map is bounded to 16 namespaces, 64 KiB serialized UTF-8 and nesting depth 16 per payload. Payloads contain finite JSON values; prototype keys and malformed Unicode are rejected. Extensions cannot override core fields or relax validation. Supported edits and exchanges preserve annotations; see [CONFORMANCE.md](CONFORMANCE.md).

ZIP import accepts one manifest with the generated metadata toolkit in the same root folder. Unexpected CAD or engineering payload entries are rejected instead of discarded. Local/directory header consistency, data descriptors, CRC and writer/reader size limits are checked against the supported subset of the [PKWARE ZIP specification](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT). Encrypted, multi-volume, ZIP64 and signed-directory formats are outside this subset.
