# Work orders and production results

**Production** creates a prototype/MVP or series batch from the active working configuration. A batch captures its own structure, file revisions, manufacturing routes, branch and saved-version baseline. Working changes are included in the captured snapshot; the named baseline is not claimed to equal a dirty working configuration.

The target quantity counts complete project units and multiplies all BOM and operation quantities. A standalone component project works the same way. For example, three products containing two tubes each require six tubes at each tube operation.

Issuing a batch requires at least one operation and no stale controlled operation references. Other engineering checklist issues may remain; a work order is not a design release or an authorization to manufacture. Review approved drawings, stock, tools and acceptance criteria.

## Distributing work

- **Batch report** exports a standalone HTML report for the entire frozen configuration.
- **Facility work order** selects only that facility's operations, relevant component/input file references, and explicitly linked documents. Prerequisite component and operation names remain visible for coordination.
- Save these reports in the project root to preserve relative file links. Transfer required actual files separately. Optional/restricted files can be omitted and represented by absence markers; the JSON and report can still disclose their names and metadata.
- Every report contains a SHA-256 configuration fingerprint. Configuration changes require a new batch or new report, not silent edits to an existing order.

The UI records results directly in the project JSON. Different teams can exchange copies of that JSON using **Add branches & history**. Batch metadata must match for a shared batch ID. Immutable result events merge by event ID; duplicate imports do not double-count. Conflicting event content or accumulated accepted quantities beyond the target are rejected for review.

## Recording results

Each record includes an operation identity, timestamp, accepted quantity, rejected quantity, operator, inspection notes and optional relative evidence path. Records are append-only.

Accepted units cannot exceed the target. Rejected attempts remain in history; after rework or replacement, add another accepted result without erasing the rejection. This is a basic quantity ledger, not individual serial traceability or material consumption accounting.

The whole prerequisite batch must be accepted before a downstream result can be entered. Component-input completion includes inspection and all child operations. Independent operations can be recorded in parallel. An input without a defined route needs at least an incoming inspection operation before it can be accepted as complete. Partial transfer between operations is not modeled in this release.

For every component, define actual acceptance checks in the route and attach the applicable controlled file references. Matching references describe the required configuration; the app does not identify which physical tube was matched to which piston. Serial-number pairing, individual measurements, scheduling, inventory, signatures and ERP integration require additional functionality.

Batch issue validates that every required input has an inspection or manufacturing operation before the configuration is frozen. An unexecutable plan is rejected with the input designation; add its route and issue the batch again. Accepted quantities may cover the full remaining work-order target, including targets above one million units.
