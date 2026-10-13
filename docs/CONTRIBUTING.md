# Development

Use Node.js 22.13 or newer. Install development dependencies with `npm ci`. There are no third-party browser runtime dependencies.

- `npm run dev`: build, serve `dist/` on localhost and rebuild after source changes. Refresh after a rebuild.
- `npm run preview`: serve an existing production build.
- `npm run check`: lint source, scripts and tests.
- `npm test`: run domain, file exchange and persistence regression tests.
- `npm run format`: format code and documentation.
- `npm run validate`: lint, check formatting, run tests and build all distribution artifacts.

All documentation and source comments must be English. User-facing strings belong in matching EN/UA feature dictionaries under `src/i18n/`. Project data can contain any language.

Add behavior to its feature module instead of growing the composition entry point. Domain and file modules must not depend on the DOM. Keep persistence outcomes separate from successful in-memory mutations: a storage failure must preserve the work and clearly request export or recovery.

Tests should exercise useful invariants and regressions: immutable saved snapshots, merge decisions, quantities, controlled file references, filesystem scripts and conformance, validation and concurrent writes. UI changes should also be checked in both languages, with keyboard navigation and on a narrow screen.

A build must not rewrite examples or user data. `public/` contains only static application assets. `dist/` is generated and ignored by Git. Never include project exports, confidential engineering files or browser profiles in deployment assets.

Contributions use the Apache-2.0 license. Do not copy paid standards text or third-party code without an appropriate license. Schema changes require updated normative rules, fixtures, semantic validators and distribution artifacts; see [GOVERNANCE.md](GOVERNANCE.md).

The audit regressions cover merge isolation, document replacement identity, long branch names, file-check races, archive limits and controls for external references. PowerShell execution tests skip only when the engine is unavailable locally; the Windows workflow requires both engines and cannot pass by skipping.
