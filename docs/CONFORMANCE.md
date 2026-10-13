# Open ESKD conformance specification

Status: implementation specification, schema 6. This document defines interoperability for Open ESKD. It does not claim recognition by a standards body or compliance with another engineering standard. Normative keywords MUST, MUST NOT and SHOULD express requirements of this format only.

## Conformance layers

1. **Structural validity:** a JSON value MUST conform to [project-v6.json](../schema/project-v6.json), using JSON Schema draft 2020-12. Unknown core fields MUST be rejected. A consumer MUST NOT silently coerce values, insert missing mandatory data or discard fields to make an input valid.
2. **Semantic validity:** the identity, graph, pin, path, quantity and ledger rules below MUST pass. JSON Schema alone cannot check these relationships. The reference implementation is `validateProject` exported by `open-eskd/core`.
3. **Engineering readiness:** recorded ownership, release status, manufacturing location, drawings, evidence and controlled references are checked separately by `readiness`. A valid draft MAY be incomplete. Readiness MUST NOT be presented as a design approval, physical acceptance or certification.

Consumers MUST advertise the schema versions and conformance layers they support. This implementation accepts only version 6; it never guesses a schema or converts an unsupported input. Unsupported browser records MUST remain untouched until an owner explicitly handles them outside this version.

## Encoding and identity

- JSON text MUST be UTF-8. A leading UTF-8 BOM MAY be accepted. String values MUST be well-formed Unicode without lone surrogates. Scalar limits in the schema count Unicode code points unless a path rule states otherwise.
- IDs MUST be nonempty strings of at most 100 code points without whitespace, control characters or the reserved values `__proto__`, `constructor`, `prototype`. IDs identify records; names, designations and revision labels do not replace them.
- Timestamps MUST be UTC `YYYY-MM-DDTHH:mm:ss[.sss]Z`, with zero to three fractional digits and a valid calendar date. UI locale MUST NOT change serialized dates, enums or numeric values.
- Quantities MUST be finite and positive in structures. Tree totals MUST remain finite and no greater than `Number.MAX_SAFE_INTEGER`. Unit labels are explicit strings; the core performs no implicit conversion. Organizations SHOULD define agreed units in their conformance profile and use SI where appropriate.
- Branch names MUST use Unicode letters/numbers or `.`, `_`, `/`, `-`, with a 100-code-point limit and no reserved prototype names. Active branches and heads MUST resolve.

## Product structure and configurations

Parent references MUST resolve, MUST be acyclic and MUST have depth at most 64. Only assembly, complex and set elements may contain children. Multiple occurrences of one definition MAY share a designation; unrelated definitions MUST NOT share it in one snapshot. Empty structures are valid drafts.

Saved project commits and component catalog revisions MUST retain identity and immutable content during history exchange. Commit parents MUST resolve and form an acyclic graph; commit metadata MUST be nonblank where required. Catalog ancestry MUST belong to the same definition, and catalog dependencies MUST be acyclic. A catalog revision MUST have exactly one quantity-1 root whose revision matches the record label. Released project commits and catalog revisions MUST pass readiness.

Pinned placements MUST match their immutable source definition, internal tree, manufacturing routes, provenance, annotations and document signatures. Root parent/quantity are placement-specific. Expected revision/document links MUST NOT be silently updated after a change; stale expectations are readiness issues requiring explicit review.

The `decomposition` workflow describes an existing product from assemblies to parts. Provenance records distinguish observations, team designs and supplier information. Elements in a decomposition workflow MUST have a provenance record before readiness passes. Observed elements MUST carry measured/documented verification and a nonblank evidence reference before readiness passes. A declared reference is not an automatic verification of the evidence.

## Manufacturing graph

Operation references MUST resolve within the same snapshot. IDs MUST be unique within each route; duplicate prerequisite/input/document references are rejected. Input quantities are per one owning component; usage is `input` (consumed/installed) or `reference` (used for comparison or fitting).

The operation graph combines local route order, explicit prerequisite operations, input-component completion and assembly completion. It MUST be acyclic. Explicit inputs allow intermediate assembly stages. Without explicit inputs, assembly/press-fitting/fastening waits for immediate child completion. Readiness MUST report stale expected component revisions, catalog pins and document revision/path/hash references.

## External paths and checks

File paths MUST be relative, use `/`, contain no empty, `.` or `..` segments, and reject controls, backslashes, Windows-invalid characters, device names and trailing dots/spaces. Paths are bounded to 800 UTF-16 code units; segments to 120 code units and 200 UTF-8 bytes. Platform total-length limits may be stricter. Cross-platform inventories MUST reject case-insensitive/NFC conflicts, file/directory collisions, reserved root exchange names and `.eskd-placeholder` filenames.

A file record describes expected bytes and required/optional status. A hash is `null` or lowercase SHA-256. It MUST NOT imply that the file exists or has engineering approval. Generated create scripts MUST only create absent directories/marker sidecars, MUST NOT replace files, and MUST reject symbolic links/reparse points in managed paths. Check scripts MUST be read-only. Markers MUST NOT masquerade as real engineering files.

Verification imports MUST match the project ID, current configuration fingerprint and exact inventory coverage. The fingerprint is SHA-256 of UTF-8 serialized JSON for `{projectId, snapshot}`, recursively sorting object keys using JavaScript ordinal order and retaining array order. Independent producers MUST match reference serialization, including JSON number encoding; fixtures/reference tests are provided. This is a configuration check, not a digital signature or a universal JSON canonicalization standard.

## Production ledger

A batch captures an immutable configuration and saved baseline identity. Its baseline commit MUST exist and version label MUST match. Results are append-only by stable ID. A positive accepted/rejected total is required; rejection MUST include an inspection note. Accepted totals MUST NOT exceed operation targets; rejected attempts remain after replacements. Referenced prerequisite/input tasks MUST be fully accepted before downstream results are accepted by the validator.

Merge MUST reject changed batch definitions, changed events sharing an ID, or accepted totals exceeding the target. A batch snapshot may include working changes relative to its saved baseline. Batch quantities count project units; per-task targets multiply structure quantities by batch quantity. This ledger does not identify individual manufactured instances, sign approvals or implement inventory accounting.

## Extensions and preservation

Optional `extensions` maps are permitted only on the entities listed in [FORMAT.md](FORMAT.md). Namespace keys MUST be reverse-DNS names with at most 120 characters, such as `org.example.quality`; there are at most 16 namespaces per map. Payloads MUST be finite JSON values, without unsafe prototype keys or malformed Unicode, nesting at most 16 and total serialized size at most 65,536 UTF-8 bytes per map.

A conforming editor MUST preserve supported extension payloads through edits and whole-project exchange. It MUST NOT interpret an unknown payload as permission to relax core rules. An organization MUST publish its namespace, payload schema, version and semantics before requiring another tool to interpret it. Selective component exchange includes relevant component/document annotations; project-level annotations are not automatically transferred to an unrelated target project.

Conflicting immutable annotations MUST cause an identity collision; conflicting editable annotations MUST require review or explicit resolution. Additional core requirements need a new schema version and published change proposal, not an undocumented extension override.

## Reference fixtures and checks

`tests/fixtures/conformance/` includes a minimal valid manifest, a decomposition manifest and intentionally invalid manifests. `tests/conformance.test.js` exercises both validation layers, Unicode/path limits and extension preservation. `tests/filesystem.test.js` covers verification fingerprints, generated-script behavior and escaping. Run `npm run validate` to check the reference implementation and deterministic distributions.

Future versions SHOULD publish a compatibility matrix, positive/negative fixtures and implementation-independent test vectors before declaring interoperability. Resource limits are safety ceilings, not a guarantee of interactive performance at every maximum.
