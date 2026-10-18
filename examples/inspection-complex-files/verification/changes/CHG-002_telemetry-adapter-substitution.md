# CHG-002: fictional supplier adapter substitution

Status: learning example; real substitution approval outstanding.

The current main branch replaces supplier telemetry adapter interface revision A with B. Catalog B has A as its parent and preserves the same component definition. The example does not specify the physical adapter, wiring, radio configuration or operating behavior.

Review the supplier interface reference, communications compatibility matrix, affected operations and test plan. The factory refreshes those controlled references explicitly before saving the new main-branch version. A real project needs an actual compatibility review and the required evidence.

The issued MVP work order stays at A. Its rejected bench result remains rejected until a separately recorded controlled rework and retest. Updating a catalog component does not approve, rewrite or silently upgrade units already in production.

The parallel rugged ground-station evaluation remains separate. Merge only after reviewing the variant, resolving any conflicts and accepting its documentation through the project's real process.
