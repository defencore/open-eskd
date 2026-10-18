# Pre-publication audit

Audit scope: Open ESKD 3.0, schema 6, EN/UA interface and static GitHub Pages artifacts. The checks use synthetic project metadata and illustrative files, never production engineering data.

The completed local validation reports 252 tests: 249 passed, 3 skipped because PowerShell is unavailable, and 0 failed. Lint, formatting, schema synchronization and the production build also passed. Deployment regressions additionally cover build-specific cache URLs, offline fallback and isolation from unrelated resources and caches.

The modular refactor audit also covers prototype-safe translation lookup, strict scalar history/catalog identities, inherited component-completion prerequisites, atomic production forms and consistent exports during concurrent edits. The complex example is checked against the formal schema and semantic validator in both languages; its shipped JSON is deterministic and its synthetic fixtures are explicitly identified. Locale-scoped immutable identities allow English and Ukrainian example revisions to coexist and be reused without catalog collisions.

An isolated browser run verified the complex guide, direct software selection, A/B catalog, both engineering branches, frozen MVP quantities with retained rejection, optional video references, HTML export and reload persistence. The own-project action opens an empty creation form. EN/UA and a 390 px guide layout were checked; no application warnings/errors or horizontal page overflow were observed in that run. Independent imported example copies remain selectable in a regression test. Updated example content opens as a separate copy and preserves edits in earlier saved examples.

The verification journal audit includes 60-run and 125-artifact pagination, bulk path inference, canonical duplicate rejection, frozen batch configuration, historical branch attribution, retest chains, atomic form failures, inventory/fingerprint changes, and byte-preserving evidence exchange. Browser checks created a session with seven video/log/protocol/dataset references, edited draft evidence rows, filtered outcomes and evidence types, followed failed-to-passed retests, checked EN/UA and a 390 px CSS viewport, and reloaded eight saved example sessions after stopping the preview server. No application warnings/errors or horizontal page overflow were observed in that run. The offline package contains all 44 synthetic companion text files; it contains no videos or images.

## Functional coverage

| Area                                | Verification                                                                                                                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project structure and decomposition | Project/part creation, bulk input, nesting, quantities, provenance, repeated occurrences, validation and readiness regressions. Browser creation and editing of an assembly with parts.                                                                                         |
| Version control                     | Immutable baselines, branching, three-way merge decisions, import collisions and merge isolation. Browser alternatives with conflicting material changes merged through explicit review. A 5,000-version regression verifies the full supported history without stack overflow. |
| Component catalog                   | Publication, dependency closure, pinned occurrences, revision comparison/replacement and package exchange. Browser publication and reuse with distinct quantities. Replacement retains unambiguous document identities and requests review of changed controlled references.    |
| Manufacturing                       | Templates, ordered operations, dependencies, input components, controlled documents, cycle rejection and facility views. Browser route editing and operation ordering. Print regression covers all 10,200 operations rather than the screen pagination limit.                   |
| Production                          | Frozen configuration, multiplied quantities, accepted/rejected results, evidence and prerequisite blocking. Browser rejection followed by replacement acceptance retains the rejected count and unlocks only the eligible next operation.                                       |
| External files                      | Path safety, placeholders, hash verification and stale-check detection. Scripts copied from the browser create directories in an isolated project root, preserve a real SVG file and produce an accepted verification JSON with its SHA-256.                                    |
| Exchange and reports                | JSON/metadata-ZIP round trips, component packages, CRC/header/descriptor checks, size limits, HTML escaping and CSV formula handling. ZIP intake rejects unexpected engineering binaries instead of silently discarding them.                                                   |
| Persistence                         | IndexedDB reload, concurrent-write conflicts, rejected-record preservation and session recovery. File-check failures cannot relabel a successful project save as a storage failure; stale asynchronous check results cannot overwrite a newer state.                            |
| Interface                           | EN/UA dictionaries, field guidance, keyboard/tooltip behavior, clearer export and copy controls. Browser smoke checks cover narrow, medium and desktop layouts with scrolling confined to wide tables.                                                                          |
| Publication                         | Clean deterministic builds, relative assets, custom-domain marker, license/notice, versioned schema, inline portable HTML and offline package contents. Deployment includes only generated distribution files.                                                                  |

The hosted application also reloaded successfully after the isolated preview server was stopped. Its saved production batch remained available; a project description was edited, saved and restored by another offline reload. The JSON export command completed without an application error in that state.

Run `npm run validate` for lint, formatting, schema synchronization, regression tests and a fresh distribution build. Test results are reported by the command; do not treat a skipped test as a passing execution check.

## Execution limits and release gates

- macOS executes the generated Bash workflows. PowerShell execution requires Windows; the local tests skip when no engine is installed. Both Windows PowerShell and PowerShell Core are required by the reusable Windows CI workflow. Pages deployment depends on that job succeeding.
- Browser automation exercises a separate loopback origin so existing user workspaces remain untouched. Blob export commands complete without application errors, but the in-app browser does not expose those downloads to its automation event collector. Export bytes and round trips are verified by the file-module tests.
- Direct automated navigation to `file://` is restricted by the browser tool. The portable HTML is checked for valid embedded JavaScript, embedded styles/icon/license and absence of external runtime assets. Confirm direct local opening in supported browsers during release smoke testing.
- Docker image execution is not verified on this workstation because its Docker daemon is unavailable. The static self-hosting configuration and deployment procedure are provided separately.
- Repository push, Pages settings, DNS and the public deployment remain external release steps. A successful local build does not confirm a live deployment.

## Release smoke checks

1. Run the quality workflow and both required Windows filesystem checks.
2. Deploy the generated `dist/` artifact, configure `eskd.defencore.com`, and enable HTTPS after domain validation.
3. At the production origin, create or import a synthetic project, export JSON/ZIP, reload it, and generate a report and filesystem scripts.
4. After the application has cached successfully, disconnect the network and reload. Confirm that editing and JSON export remain available. Repeat using `open-eskd.html` opened directly from disk.
5. Transfer the manifest between two browsers and check versions, repeated occurrences, production results and file-reference warnings.

This audit verifies software behavior within the documented model. It does not certify engineering designs, manufacturing acceptance or compliance with an international standard.
