# Architecture

## Module layout

| Directory                   | Responsibility                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/domain/`               | Schema, validation, project state, revisions, history ancestry, structure traversal, readiness, diffs and three-way merge |
| `src/bootstrap/`            | Startup, explicit feature composition, context services and command/form dispatch                                         |
| `src/files/zip/`            | Binary encoding, CRC32, path validation, limits, ZIP reading and writing                                                  |
| `src/files/`                | JSON/ZIP project exchange, external file references, filesystem scripts, BOM and manufacturing exports                    |
| `src/files/report/`         | Frozen report context, document fields, structure, operations/results and standalone layout                               |
| `src/application/`          | Workspace state, controllers, designation suggestions, atomic pasted lists, navigation and persistence outcomes           |
| `src/application/actions/`  | User commands grouped by workspace, structure, documents, history and exchange                                            |
| `src/application/forms/`    | Form validation and mutations grouped by feature                                                                          |
| `src/storage/`              | IndexedDB transactions and optional browser preferences                                                                   |
| `src/ui/views/`             | Individual workspace screens                                                                                              |
| `src/ui/dialogs/`           | Project, component, documentation, revision and merge dialogs                                                             |
| `src/ui/production/`        | Production screen and batch/result dialogs, coordinated by `src/application/production.js`                                |
| `src/ui/`                   | Shared markup, icons, feedback, shell, workflow navigation and events                                                     |
| `src/i18n/`                 | Complete English and Ukrainian dictionaries, translation lookup                                                           |
| `src/styles/`               | Readable CSS grouped by interface responsibility, responsive and print rules                                              |
| `src/data/complex-example/` | Deterministic localized learning scenario split into aircraft, ground, support, verification and history composition      |
| `src/shared/`               | Pure HTML escaping used by UI and report exports                                                                          |
| `schema/`                   | Generated JSON Schema for independent consumers                                                                           |
| `public/`                   | Static HTML shell, local icon and web app manifest                                                                        |
| `scripts/`                  | Build, production preview, development watcher and service-worker template                                                |
| `.github/workflows/`        | Quality checks and GitHub Pages deployment                                                                                |

`src/main.js` loads styles and starts the application. `src/bootstrap/start.js` opens storage and restores a validated navigation target; `context.js` supplies state-dependent services; `features.js` registers UI factories and rejects duplicate capabilities; `commands.js` composes controllers and serializes actions/forms. Failure always releases the command lock, and form submission restores each button's previous disabled state. Factories receive an explicit shared context and call only the services they use. Lazy context calls let screens and dialogs request rendering without importing each other. Domain, exchange and storage modules do not depend on the DOM and are directly testable.

`src/i18n/modules.js` composes paired English/Ukrainian feature dictionaries. Tests check key parity, duplicate ownership, nonempty values and literal UI translation calls. Translation lookup uses own properties so unknown keys cannot expose object prototype values.

`src/application/examples.js` opens or selects the learning project without overwriting edits. A namespaced example marker travels with JSON imports; no browser preference owns the only accessible example. All stored copies remain visible in the project list. The guide uses stable section IDs and handles removed elements without broken navigation. Shipped English JSON is deterministic; new workspace copies receive independent project IDs. Locale-specific immutable project/catalog/history/document/definition identities prevent translated snapshots from claiming the same revision identity; placement and operation anchors stay stable for navigation. All result events and companion logs are explicitly synthetic, and unavailable media paths remain optional.

## Browser runtime

`src/ui/form-guidance.js` composes labelled controls with translated info tooltips. Help buttons remain outside labels, and hidden tooltip content is linked through unique `aria-describedby` IDs. Each tooltip has a description, three examples and a filling rule. Type-specific names, material units, readiness states and the deferred-root state follow the current form selection. Examples do not populate user data. Project metadata, component entry, pasted lists and catalog placement forms share the same helpers.

`src/ui/info-tooltip.js` handles hover, keyboard focus and tap. Fixed-position tooltips stay within the viewport and remain readable when the pointer enters them. Escape dismisses help before the surrounding dialog; outside clicks, repeated taps and focus changes dismiss it. Tooltips use the application DOM and do not require network assets or a third-party runtime.

Source modules are bundled by esbuild into one classic IIFE script. There are no browser globals serving as module adapters, CommonJS fallbacks or duplicate runtime implementations. The same source generates the hosted application and standalone HTML; the standalone build removes service-worker registration and embeds CSS and the icon. This avoids module-fetch restrictions for portable local use.

There are no remote fonts, CDNs, telemetry, accounts or application APIs. Only project metadata enters browser memory and IndexedDB. Reports escape project text, disable scripts with a Content Security Policy and use validated relative file URLs. Local images appear in exported reports; CAD files open through the engineer's native tools.

## Persistence and concurrency

The IndexedDB database is `open-eskd`, version 2, with the `projects` store. Only current-schema valid records are acknowledged for editing. Unsupported records remain physically untouched, including any unrelated stores already present in a database. Normal saves compare atomically against the raw stored record. Each project retains branches, immutable revisions and external file references.

A store remembers the last record that this tab read or successfully wrote. In one read/write transaction it reads the current stored record, compares it semantically with the expected record, then writes or deletes. Another tab's change causes an explicit conflict and aborts the transaction. Timestamp equality does not bypass this check.

Writes are ordered and use cloned records. Storage failures leave current work in memory, mark the project as unsaved and suppress successful-save feedback. The banner offers retry/export; conflicts offer importing the stored changes as incoming branches. Recovery preserves local working data and validates the combined project before acknowledging the new baseline. A subsequent concurrent write is detected again.

Session-only mode also tracks unexported work. Closing the tab warns when a write is in progress or current in-memory data has not been persisted or exported. Export marks only the exact current in-memory revision as backed up; later edits require another export.

Loading validates records individually. A damaged record does not hide valid projects or cause the entire workspace to fall back to session mode. Original rejected records stay untouched in IndexedDB and can be exported with diagnostic reasons.

## Version and merge invariants

A saved revision owns a cloned snapshot. Editing a working branch cannot rewrite it. Branches can start from any saved revision. Merge planning compares clean branch heads against a shared ancestor; independent fields combine and conflicts require an explicit choice. Whole-snapshot validation catches broken parent links, duplicate designations, document references and cycles before applying a merged result.

Imported history retains identities, rejects rewritten commits and conflicting immutable records, and creates incoming branches without overwriting local work. The UI and tests share one import/export implementation.

## Component definitions, placements and independent revisions

`src/domain/catalog/` separates fragment extraction, catalog validation, placement mutations and selective package exchange. `src/application/catalog/` coordinates workspace catalog discovery and UI actions. The catalog view lists immutable revisions available from local projects; using a revision copies only its component package closure into the target project.

Every placement has a stable `definitionId`. A pinned placement holds a resolved copy plus a strict revision reference. Validation ensures its fields, subtree and documents equal the immutable catalog snapshot. This permits readable exports and self-contained project versions while preserving exact configuration semantics. Root placement quantities and parents can vary.

Checkout restores an editable definition at the selected placement and records its revision base. Publishing adds a new immutable catalog record with ancestry; it does not rewrite prior records or other placements. Explicit replacement previews differences, preserves placement identity and quantity, and leaves saved project versions untouched. Pinned nested dependencies require checkout of their owning assembly before modification.

Selective packages include revision ancestry and dependency closure with expected file hashes. Unrelated source-project files are not copied when using a component from another project. Catalog records travel inside each project so offline work and exported packages never depend on another browser workspace remaining available.

The full system still requires additional models for interface control, requirements, formal approval authority and manufactured-instance traceability. Browser storage and file-size ceilings remain explicit limits.

## Manufacturing

`src/domain/manufacturing.js` defines the technology and operation catalogs, template sequences, strict route validation. The manufacturing order and link modules define traversal, graph validation and operation worklists by facility. `src/ui/manufacturing-editor.js` edits draft route rows without rerendering input values during reordering. `src/ui/manufacturing-plan.js` renders prerequisites and operations, filters/paginates the plan, and expands the complete filtered plan temporarily for printing. `src/files/manufacturing.js` exports the complete working plan in production order. `src/ui/value-formatting.js` formats structured changes for version and merge review.

Routes and their links are canonical version 6 fields and are compared as part of pinned definitions. Unsupported formats are rejected at load/import boundaries. Project history and component identities remain explicit. Route conflicts are atomic: both engineers' full routes are visible for an explicit choice.

`src/ui/form-presets.js` provides editable suggestions for common fields and existing project personnel/facilities. Suggestions do not impose identifier formats or populate engineering parameters automatically.

A tree index makes traversal linear in component count. Total quantities multiply relative quantities through all ancestors. Validation rejects totals outside the safe numeric range. Release checks are enforced by the revision API as well as the interface. They check recorded status, ownership, facility and drawing/model links, not engineering correctness or approval signatures.

## Distribution and updates

The build creates `dist/index.html`, `app.js`, `app.css`, local assets, `sw.js`, `CNAME`, `.nojekyll`, `open-eskd.html` and `open-eskd-offline.zip`. The offline ZIP contains stable example data and engineer documentation. Developer documentation stays in the repository. Neither distribution rewrites source files.

The service worker installs a complete application cache keyed by a hash of its assets and worker template. An active worker serves its matching asset set offline. A successfully installed new worker replaces the prior cache. Localhost previews prefer the network so refreshes show development changes, with the installed cache as an offline fallback. The service worker never stores or sends engineering project records. GitHub Actions uploads only the generated directory after validation.

## Operation dependencies

`manufacturing-links.js` validates and remaps structured prerequisites, revision-controlled inputs and document references. `manufacturing-order.js` constructs a directed graph containing operation and component-completion nodes, then performs a linear topological traversal. Route sequence, explicit prerequisites, input completion and assembly completeness share this single order model in validation, the operations view, facility worklists and exports. Cycles and dangling references are rejected before a mutation is applied.

`route-links.js` owns the editable link controls and explicit revision confirmation. `route-operation.js` provides the common operation display; `operation-plan.js` renders the global order. Stale reference expectations are readiness issues rather than silently accepted updates. Component and document deletions validate cloned candidates so errors cannot leave the current in-memory configuration partially deleted. Catalog reuse remaps placement/document identities and the enclosing revision context while retaining immutable canonical records.

## External files and production

`src/domain/file-paths.js` validates portable paths and inventories. `src/files/filesystem.js` generates Bash/PowerShell scripts, computes canonical configuration fingerprints and accepts verification reports. `src/files/report.js` orchestrates renderers under `src/files/report/` to create escaped standalone HTML with relative links/images and optional facility filtering. Report context captures the selected snapshot, batch and scalar metadata before asynchronous hashing; toolkit exports capture one project so all files describe the same configuration. UI orchestration lives in `src/ui/file-workspace.js`.

`src/domain/production.js` owns batch/result mutations and immutable event merging; `production-validation.js` enforces quantities and dependency acceptance; `production-plan.js` derives indexed worklists and progress. File-check shape validation has its own module. `src/ui/production/view.js` renders the worklist and exports; `dialogs.js` renders batch/result forms; `src/application/production.js` validates cloned candidates before applying mutations. Production is outside engineering snapshots, while every batch stores its captured snapshot and baseline identity.

Schema 6 has no runtime binary store or legacy format conversion. Compare-and-swap checks the raw record from the last acknowledged read. New browser tabs cannot silently overwrite unsupported records or another tab’s work.

## Interoperability boundary

`constraints.js` provides shared scalar checks and structured errors. Component, document, snapshot, catalog, production and file-check validators own separate concerns. `schema.js` is the single JSON Schema source, emitted by `scripts/schema.mjs`; Ajv is a development/tooling dependency only. The browser ships the domain semantic validator without an Ajv runtime. CLI validation combines structural and semantic validation, using the same source as the application.

`provenance.js` describes origin and verification for decomposition. `extensions.js` bounds namespaced JSON annotations; component/document definition signatures include annotations so pinned records cannot silently diverge. UI forms preserve fields outside their editable controls. No domain or file module imports UI, storage, application state or browser DOM services.
