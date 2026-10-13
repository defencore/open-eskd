# Format governance and standards roadmap

Open ESKD is an open implementation and exchange specification. It is not currently an ISO, IEC, national or internationally approved standard. Apache-2.0 permits organizations to use, adapt and deploy the service; approval of an engineering standard requires an independent consensus and standards process.

## Scope and informative references

The current scope is product decomposition, configuration history, reusable component definitions, external-document references, manufacturing routes and basic batch execution. It leaves designation policies, organizational roles, engineering acceptance criteria and file ownership explicit.

These official references inform future mapping; their names do not establish compliance:

- [ISO 10007:2017](https://www.iso.org/standard/70400.html): configuration-management guidance; relevant to identification, change control, status accounting and audit.
- [ISO 7200:2004](https://www.iso.org/standard/35446.html): document-header/title-block data fields; relevant to document metadata exchange.
- [IEC 81346-1:2022](https://webstore.iec.ch/en/publication/64021): system structuring and reference designations; relevant to product/reference relationships.
- [JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core): machine-readable structural interchange rules.

Do not reproduce copyrighted normative text or claim conformance without reviewing the licensed standards and conducting the required assessment. Existing designations are free text; three/four dotted groups are examples, not an internationally prescribed classification.

## Proposed change process

Maintainers SHOULD publish format proposals as repository issues or pull requests containing the concrete problem, schema changes, semantic rules, sample data, compatibility impact and positive/negative tests. Feedback SHOULD include implementers and engineers from more than one organization/country before a common profile is called interoperable.

Changes that invalidate accepted core data MUST use a new `schemaVersion`. Optional core additions also need a published proposal and a compatibility decision because strict older validators reject unknown fields. Experimental organizational metadata belongs in documented extension namespaces. UI labels and implementation refactors may evolve without changing the format when serialized behavior remains the same.

A format release SHOULD include a tagged specification, JSON Schema, changelog, conformance fixtures, support matrix and at least two independent implementations before claiming cross-tool interoperability. Existing schema files at versioned URLs MUST remain stable after a public format release. Draft local development is not a ratified release.

## Next models requiring consensus

1. Unit/quantity semantics and multilingual document metadata; reference-designation profiles and external format mappings.
2. Requirements, interface contracts, engineering changes, approval authority and signed release evidence.
3. Manufactured-instance/lot genealogy, supplier certificates, inspection/rework disposition and serialized part pairing.
4. Controlled organizational exchange, authentication, access control and synchronization in derived systems.
5. Implementation-independent canonicalization, signatures, large-project benchmarks and archival policies.

The current service provides extension boundaries and pure APIs for these developments. It does not pretend that an annotation alone implements these workflows. Engineering projects and their files retain their owners' rights independently of the application's license.
