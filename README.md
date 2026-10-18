# Open ESKD

A client-only engineering project workspace with EN/UA UI, offline use, versioned product structures, manufacturing routes and basic production work orders. Engineering files stay on local disks; a lightweight JSON describes them by relative paths.

## Workflow

1. **Create project**, **Decompose a product**, or **Open JSON / ZIP**. Choose a standalone part, assembly, complex or set. Hover, focus or tap the info icon beside a field for guidance and several examples.
2. Build the product structure. For an existing product, decompose it from the complete assembly down to individual parts; record information origin, uncertainty and measurement/document evidence. Designations and stable component identities are independent of tree depth. Templates and selectable manufacturing operations reduce repetitive typing.
3. Define materials, blanks, preparation, operations, locations, input components, prerequisite operations, controlled document references and acceptance checks.
4. Add relative file paths under **Documents**. Use the standard path suggestion or choose your own layout. Mark required and optional/restricted files; provide SHA-256 when exact bytes need verification.
5. Generate Bash or PowerShell scripts to create missing directories. Move actual files yourself. Scripts never delete or overwrite existing files.
6. Generate a read-only check script, capture its JSON result and import it. Export a local HTML report with relative images and links. A metadata ZIP bundles the JSON, scripts, report and manufacturing inventory.
7. Save project versions and design variants. Export **project JSON** regularly and transfer the referenced files separately.
8. Issue an MVP or series batch. The work order freezes the active configuration, multiplies quantities and tracks accepted units, rejected attempts, inspection notes and evidence paths. Export work orders by facility.
9. Use **Test journal** for repeated test sessions. Choose a saved version or frozen batch, select a component and optional operation, and record the case, procedure, operator and outcome. Paste many relative paths at once to attach videos, logs, protocols, images or datasets. Record a retest as a new linked session so failed attempts and their evidence remain available.

The browser needs no access to CAD file bytes. File verification is an imported observation of the local filesystem. File presence does not approve design or manufacturing correctness. Production tracking is a basic quantity ledger; individual serial pairing, inventory, scheduling and signatures are not included.

[Local-file workflow](docs/FILESYSTEM.md) · [Tests and evidence](docs/VERIFICATION.md) · [Production](docs/PRODUCTION.md) · [Manufacturing](docs/MANUFACTURING.md) · [Staged assembly example](docs/STAGED_ASSEMBLY.md)

The test journal searches sessions and evidence paths, filters by outcome, component or batch, and displays evidence in searchable pages. A session can contain many camera recordings, several independent logs and a protocol. The file scripts include every recorded session's paths, including historical versions. Reports group evidence by test case and retain the exact configuration tested. Recording a passed test does not automatically accept production quantities.

## Learn with a complete complex

Choose **Explore the example** on the project screen. Its EN/UA learning guide links directly to a civilian inspection UAV, control console, ground station, communications, antenna tracker, battery service, purchased launch-assist and recovery systems, software configurations and verification evidence.

The example has 54 elements, 75 document references, four saved versions, two branches, two published component revisions, a synthetic MVP work order and eight test sessions with 56 evidence references. Follow a telemetry component replacement from revision A to B while the earlier batch retains its original configuration and failed session. Software manifests, requirements, test plans, multi-camera paths, protocols and explicitly synthetic logs show how to organize evidence without loading large files into the browser.

The guide explains how to create your own project from an empty structure. Reopening the current example selects its saved copy without replacing edits. When example content is updated, a new copy opens and earlier copies remain selectable in the project list. The offline package includes the guide, stable JSON and small synthetic text fixtures. Media and engineering binaries are not supplied.

[Complex example walkthrough](docs/COMPLEX_EXAMPLE.md) · [Example JSON](examples/inspection-complex.json) · [Synthetic companion files](examples/inspection-complex-files/README.md)

## Versioned engineering

Branches support parallel engineering alternatives and three-way merge review. Independently published component revisions can be pinned, reused in repeated occurrences, compared and explicitly updated. Manufacturing links retain expected component/document revisions, paths and optional hashes. Invalid dependencies, cycles, missing referenced targets and silent changes to pinned definitions are rejected.

A component package includes the selected revision, ancestry, dependency closure and file references. Catalog records remain inside each project, so exported configurations do not rely on another browser workspace.

[Component revisions](docs/COMPONENTS.md) · [Engineering workflow](docs/WORKFLOW.md) · [Schema 6](docs/FORMAT.md)

## Offline and data preservation

The hosted application caches its local assets after a successful visit. `dist/open-eskd.html` is a standalone build that can be opened locally without installation or a server. `dist/open-eskd-offline.zip` bundles that app, documentation and stable examples. Browser-origin workspaces are separate; export JSON before changing browser or address.

Only the current schema is accepted. Unsupported or damaged stored records remain untouched and can be exported for external recovery. Clearing browser data removes local workspaces; export first.

Test sessions use the optional `org.openeskd.verification` version-1 profile within schema 6. Existing schema-6 projects without it remain valid and require no conversion. Metadata limits are 1,000 sessions, 1,000 artifacts per session, 10,000 artifacts total and 16 MiB for the profile; the combined file-check inventory supports 21,000 entries. External video and log sizes do not consume these metadata limits.

[Offline guide](docs/OFFLINE.md)

## Development

Node.js 22.13 or newer is required for development only. The delivered app and generated filesystem scripts have no Node.js dependency.

```bash
npm ci
npm run dev
npm run validate
npm run preview
```

Validation checks code and formatting, runs domain, import, UI and filesystem regression tests, and builds the site, portable HTML and offline package. Bash scripts are executed using macOS Bash 3.2. PowerShell generation is covered locally by escaping/API checks; execution remains unverified on this macOS machine. A required Windows CI job exercises both PowerShell engines before Pages deployment.

[Architecture](docs/ARCHITECTURE.md) · [Contributing](docs/CONTRIBUTING.md) · [Pre-publication audit](docs/QA.md)

## GitHub Pages

The static build includes `CNAME` for **eskd.defencore.com** and `.nojekyll`. The included GitHub Actions workflow builds and publishes `dist/` when repository Pages settings are enabled. No backend or runtime CDN is required. Repository/DNS setup and publication are separate from preparing the local build.

[Deployment instructions](docs/DEPLOYMENT.md)

## Interoperability and organizational use

[JSON Schema](schema/project-v6.json) describes the exchange structure. The [conformance specification](docs/CONFORMANCE.md) adds graph, identity, file-path and production invariants. [Integration tools](docs/INTEGRATION.md) expose the same domain core used by the UI; the CLI validates manifests, lists files and generates scripts/reports without executing them.

[Self-hosting](docs/SELF_HOSTING.md) supports a static organizational deployment or a portable local HTML file. Hosting serves the application; engineers exchange JSON and external files themselves. It does not introduce a shared server database.

This is an open engineering information format and an implementation, **not an approved international standard or a claim of ISO/IEC/GOST compliance**. The [governance and roadmap](docs/GOVERNANCE.md) define how conformance profiles and future versions can be developed publicly. Formal approval authority, interface/requirements management, signed attestations and individual manufactured-instance traceability require additional models.

## License

Code and repository documentation are licensed under [Apache-2.0](LICENSE), with attribution in [NOTICE](NOTICE). Project manifests, engineering documents and generated reports retain the rights selected by their owners; the application does not assign a license to user data.
