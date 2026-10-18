# Test sessions and external evidence

The optional `org.openeskd.verification` project extension records repeated tests without embedding engineering files. One session can reference many videos, logs, signed protocols, images, datasets and other files. A later test is a separate session; the earlier result remains visible.

## Engineering workflow

1. Save the product configuration as a version, or issue a batch that freezes its configuration.
2. Record a test session against that version or batch. Identify the test case, procedure, time, operator, component and optional manufacturing operation.
3. Add each evidence file as a relative path from the project root. Use a separate directory for every session, for example `verification/TC-COMMS/2026-10-18-01/`.
4. Record `passed`, `failed`, `blocked` or `inconclusive` and explain the observed result in the summary. The outcome is entered by the engineer; Open ESKD does not infer acceptance from file existence.
5. For another attempt, record a new session and set `retestOf` to the earlier session identifier. Describe the change that justified the repeated test.
6. Save the JSON and keep the actual files in their ordinary folders. The folder creation and checking scripts cover session procedures and evidence as well as current configuration documents.

Videos remain external files. Ten camera recordings and several logs belong in the same session as separate artifact entries; separate test attempts belong in separate sessions. A test protocol can be one artifact even when its procedure is referenced separately. Real files can be distributed selectively, while the shared manifest retains their expected paths and any configured hashes.

## Version and batch identity

Every session retains `commitId` and `branch`. A session with `batchId` uses that batch's frozen snapshot, including unsaved configuration changes that were captured when the batch was issued. Other sessions use the saved commit snapshot. Later changes to the working project do not change those identities, component revisions or routes.

`componentId: null` means a test of the complete configuration. `operationId` is optional and, when present, refers to an operation on the selected component in the pinned configuration. A repeated component placement is identified by its placement ID rather than by designation alone.

These records preserve the operator's stated result. They do not constitute electronic signatures, independent certification or automatic approval of a production operation.

## Profile shape

The profile is stored in the current project JSON as metadata:

```json
{
  "extensions": {
    "org.openeskd.verification": {
      "version": 1,
      "runs": [
        {
          "id": "RUN-002",
          "name": "Communications bench test, second attempt",
          "testCase": "TC-COMMS-001",
          "procedurePath": "verification/procedures/TC-COMMS-001-rev-B.pdf",
          "performedAt": "2026-10-18T09:30:00Z",
          "operator": "Test engineer",
          "componentId": "communications-placement",
          "commitId": "saved-configuration-id",
          "branch": "main",
          "batchId": null,
          "operationId": null,
          "retestOf": "RUN-001",
          "outcome": "passed",
          "summary": "The recorded observations satisfy the referenced procedure.",
          "artifacts": [
            {
              "id": "ARTIFACT-002-VIDEO-01",
              "title": "Camera 1 recording",
              "kind": "video",
              "path": "verification/TC-COMMS-001/RUN-002/camera-01.mp4",
              "sha256": null,
              "required": true,
              "notes": "Original recording; stored outside the browser."
            },
            {
              "id": "ARTIFACT-002-LOG-01",
              "title": "Acquisition log",
              "kind": "log",
              "path": "verification/TC-COMMS-001/RUN-002/acquisition.log",
              "sha256": null,
              "required": true,
              "notes": "Use the protocol for interpretation."
            }
          ]
        }
      ]
    }
  }
}
```

This fragment illustrates the profile, not an importable project: its commit, component and retest identities must exist in the containing manifest. Artifact kinds are `video`, `log`, `protocol`, `image`, `dataset` and `other`. An absent procedure is represented by an empty string. Hashes are either `null` or a lowercase 64-character SHA-256. No binary or base64 file content belongs in this profile.

The current limits are 1,000 sessions, 1,000 artifacts per session, 10,000 artifacts across the project and 16 MiB for this profile. The combined file-check inventory supports up to 21,000 entries: 10,000 current documents, 10,000 artifacts and 1,000 procedure paths, before deduplication. Media file sizes do not consume these metadata limits because their bytes are external.

## Local file checks

`projectFileInventory(project)` combines current configuration documents with procedures and artifacts from **all recorded sessions**, including sessions tied to earlier versions and other branches. Historical evidence therefore remains checkable after a component or its document has changed. Procedures are required files; artifact requirements are explicit.

The same exact path may appear in several sessions or documents. It is checked once. Required status is the logical OR of the references, and a configured SHA-256 is retained when another reference has no hash. Two different configured hashes for one path are rejected. Case-only or Unicode-normalization collisions are also rejected for portability. Use a different path for changed bytes, normally by including the session ID or document revision in the directory.

The file-check fingerprint includes the selected configuration and the complete verification profile. Adding a session, changing an evidence path, hash, requirement, result or summary makes the previous check stale. Regenerate the check script after such changes. This prevents a newly added recording from being mistaken for a file covered by an earlier check. A report covering only some expected paths cannot be imported as a complete check.

The manifest and metadata ZIP preserve every session and artifact reference. They do not include the referenced videos, logs or protocols. Creation scripts only create missing directories and optional absence markers. Checking scripts only read files. Neither operation deletes or replaces project files.

## HTML reports

The project report has a separate tests and evidence section grouped by test case. Each session shows its pinned version, branch, component revision, optional operation and batch, result, operator, time, procedure, retest relationship and all evidence links. Hashes are displayed when configured. Links are relative and open the ordinary local files; the report does not preload video bytes.

A batch report includes only sessions explicitly assigned to that batch. A facility report includes sessions whose pinned component or operation belongs to that facility. A session for the whole project is excluded from facility reports because its evidence has not been scoped to a particular production location. Historical tests of another batch are not presented as proof of acceptance for the selected batch.

An export freezes the project metadata before asynchronous fingerprinting. Editing the workspace during export cannot mix the new session list with an older structure or manifest.
