export default {
  verificationLatestExample: 'Open updated example',
  verificationOlderExample:
    'This saved example predates the test journal. Open the updated example as a separate project; your saved copy and edits remain available.',
  verification: 'Test journal',
  verificationSubtitle:
    'Keep each test attempt, its exact configuration and all related evidence together.',
  newVerificationRun: 'Record a test run',
  verificationJournalHint:
    'One test case can have many attempts. Each attempt keeps its own configuration, outcome and collection of recordings, logs, protocols and datasets. Files stay in your project directories.',
  verificationRunsCount: 'test runs',
  verificationArtifacts: 'Evidence files',
  verificationAll: 'All',
  verificationSearch: 'Search cases, components, notes or evidence paths',
  verificationArtifactSearch: 'Search evidence title, path, notes or SHA-256',
  verificationRun: 'Test run',
  verificationOpenRun: 'Open run',
  verificationMore: 'Show more test runs',
  verificationMoreArtifacts: 'Show more evidence files',
  verificationEmpty: 'No test runs recorded',
  verificationEmptyDescription:
    'Save a project version, then record a test attempt with its outcome and as many evidence references as needed. Each later attempt becomes a separate record.',
  verificationBack: 'Back to test journal',
  verificationRetest: 'Record a retest',
  verificationRetestLabel: 'Retest',
  verificationRetestOf: 'Retest of',
  verificationLaterRetests: 'Later retests',
  verificationImmutableHint:
    'This saved run is retained as a historical record. Record another attempt or retest to add a new outcome; the earlier result and evidence stay unchanged. Test outcomes do not change production quantities.',
  verificationNoArtifacts: 'No matching evidence files',
  verificationNoArtifactsDescription:
    'Clear the search or choose another file type. A test run may also explicitly record that no evidence was collected.',
  verificationGlobalScope: 'Whole saved configuration',
  verificationAnyOperation: 'No specific operation',
  verificationRecordHint:
    'Record one actual attempt, not the whole test campaign. Collect its recordings, logs and protocol paths below. The saved configuration and evidence collection remain together in history.',
  verificationSavedOnlyHint:
    'Select the version that was actually tested. Unsaved working changes are not included. A production batch uses its original frozen configuration.',
  verificationRecordRun: 'Save test run',
  verificationName: 'Run name',
  verificationCase: 'Test case ID',
  verificationPerformedAt: 'Performed at',
  verificationConfiguration: 'Tested configuration',
  verificationComponent: 'Tested component',
  verificationOperation: 'Related operation',
  verificationProcedure: 'Procedure path',
  verificationOperator: 'Operator / reviewer',
  verificationOutcome: 'Outcome',
  verificationSummary: 'Result and observations',
  verificationEvidencePaths: 'Evidence paths — one per line',
  verificationEvidenceKind: 'Evidence type',
  verificationEvidenceTitle: 'Evidence title',
  verificationEvidenceRequired: 'File expectation',
  verificationEvidenceNotes: 'Evidence notes',
  verificationEvidenceMetadata: 'Title, requirement, hash and notes',
  verificationBulkHint:
    'Paste multiple relative paths at once. Types are suggested from extensions; expand each file to refine its title, requirement, optional hash and notes. No file contents are uploaded.',
  verificationAutoKind: 'Detect from file extension',
  verificationAddPaths: 'Add these paths',
  verificationEvidenceLimit: 'A test run supports up to 1,000 evidence files.',
  verificationDuplicatePath:
    'Each evidence path must appear only once in a test run.',
  verificationArtifactKind_video: 'Video',
  verificationArtifactKind_log: 'Log',
  verificationArtifactKind_protocol: 'Protocol / report',
  verificationArtifactKind_image: 'Image',
  verificationArtifactKind_dataset: 'Dataset',
  verificationArtifactKind_other: 'Other',
  verificationOutcome_passed: 'Passed',
  verificationOutcome_failed: 'Failed',
  verificationOutcome_blocked: 'Blocked',
  verificationOutcome_inconclusive: 'Inconclusive',
  guideVerificationNameHelp:
    'A short name identifying this particular attempt within a test campaign.',
  guideVerificationNameExample: 'Interface review · first attempt',
  guideVerificationNameExample2: 'Software replay · release 1.2.0 · attempt 3',
  guideVerificationNameExample3:
    'Replacement bracket · inspection after rework',
  guideVerificationNameRule:
    'Use a new run for each attempt. Keep the stable case identifier in Test case ID and describe the specific attempt here.',
  guideVerificationCaseHelp:
    'The stable identifier of the requirement check or test case. Several attempts may share this identifier.',
  guideVerificationCaseExample: 'COM-003',
  guideVerificationCaseExample2: 'SW-RESTORE-014',
  guideVerificationCaseExample3: 'INSPECT-BRACKET-002',
  guideVerificationCaseRule:
    'Use the same case ID for a retest. The run ID is generated separately, so repeated attempts never overwrite one another.',
  guideVerificationPerformedAtHelp:
    'When the attempt took place, displayed and entered in your local time zone.',
  guideVerificationPerformedAtExample: '18 October 2026, 14:30',
  guideVerificationPerformedAtExample2:
    'Use the timestamp of the actual inspection',
  guideVerificationPerformedAtExample3: 'Retest tomorrow → a new date and run',
  guideVerificationPerformedAtRule:
    'Record the event time rather than a filename date. The project stores an explicit UTC timestamp for exchange between time zones.',
  guideVerificationConfigurationHelp:
    'The immutable project version or issued production batch that identifies exactly what was checked.',
  guideVerificationConfigurationExample:
    '0.3.0-interface-b · saved main configuration',
  guideVerificationConfigurationExample2:
    'MVP-001 · frozen telemetry A configuration',
  guideVerificationConfigurationExample3:
    '0.2.1-ground-variant · alternative ground station',
  guideVerificationConfigurationRule:
    'Save the intended configuration before recording a run. A later revision does not rewrite earlier attempts or the frozen batch. Select the actual tested configuration for every retest.',
  guideVerificationComponentHelp:
    'The occurrence of a component in the selected tested configuration, or the whole configuration when the scope is broader.',
  guideVerificationComponentExample: 'ATL.400.000 · Communications subsystem',
  guideVerificationComponentExample2: 'SW.140.010 · Firmware release 1.2.0',
  guideVerificationComponentExample3:
    'Whole saved configuration · integration review',
  guideVerificationComponentRule:
    'Choose from the tested baseline, not today’s working tree. A component may appear at several places, so confirm its parent path. Retests retain the same component scope.',
  guideVerificationOperationHelp:
    'The manufacturing, inspection or test operation related to this attempt, if one is applicable.',
  guideVerificationOperationExample: '4. Test · communications bench route',
  guideVerificationOperationExample2: '1. Prepare · blank identity inspection',
  guideVerificationOperationExample3:
    'No specific operation · independent review',
  guideVerificationOperationRule:
    'Choose an operation belonging to the selected component in the tested baseline. Recording a test does not automatically accept a production operation.',
  guideVerificationProcedureHelp:
    'A portable relative path to the controlled procedure, plan or acceptance criteria used for this attempt.',
  guideVerificationProcedureExample: 'verification/procedures/COM-003_B.pdf',
  guideVerificationProcedureExample2: 'verification/software/restore-plan_A.md',
  guideVerificationProcedureExample3: 'documentation/inspection/bracket_A.pdf',
  guideVerificationProcedureRule:
    'Use forward slashes from the project root. Avoid absolute system paths, parent traversal and web URLs. The referenced procedure is an expected file in the generated file checks.',
  guideVerificationOperatorHelp:
    'The person or team who performed, witnessed or recorded the attempt according to your process.',
  guideVerificationOperatorExample: 'Alex Smith · Inspection laboratory',
  guideVerificationOperatorExample2: 'Software verification team · reviewer 02',
  guideVerificationOperatorExample3: 'Workshop 3 · incoming inspection',
  guideVerificationOperatorRule:
    'Identify the actual responsible operator or reviewer. This text field records attribution; your organization manages approval authority separately.',
  guideVerificationOutcomeHelp:
    'The conclusion for this attempt against the identified procedure and configuration.',
  guideVerificationOutcomeExample: 'Passed · all reviewed criteria met',
  guideVerificationOutcomeExample2:
    'Failed · identity mismatch; retest required',
  guideVerificationOutcomeExample3:
    'Blocked · input missing; Inconclusive · evidence insufficient',
  guideVerificationOutcomeRule:
    'Choose Inconclusive when the evidence cannot justify pass or fail. Keep failed attempts in history and link a new retest. An outcome does not change accepted or rejected production quantities.',
  guideVerificationSummaryHelp:
    'The actual observations, acceptance criteria, deviations and disposition needed to interpret this attempt.',
  guideVerificationSummaryExample:
    'Case COM-003: one interface identity label differs from the controlled matrix. See protocol and both observer logs.',
  guideVerificationSummaryExample2:
    'Restore review completed for the saved ground variant; the reference dataset and manifest identifiers match.',
  guideVerificationSummaryExample3:
    'Blocked: the supplier acceptance record has not arrived. No test execution or acceptance is claimed.',
  guideVerificationSummaryRule:
    'State what was checked and what remains open. Reference evidence by its registered path. Distinguish actual observations from expectations and planned future work.',
  guideVerificationEvidencePathsHelp:
    'One relative file path per line. A single attempt may include many videos, device logs, protocols, photographs and datasets.',
  guideVerificationEvidencePathsExample:
    'verification/RUN-001/video/camera-01_part-01.mp4',
  guideVerificationEvidencePathsExample2:
    'verification/RUN-001/logs/controller.log',
  guideVerificationEvidencePathsExample3: 'verification/RUN-001/protocol.pdf',
  guideVerificationEvidencePathsRule:
    'Paste up to 1,000 distinct paths for this attempt. Files remain on your system. Add paths to review the inferred type and optional metadata; save only after the evidence collection is ready.',
  guideVerificationEvidenceKindHelp:
    'The purpose of an evidence artifact, used for filtering a large collection.',
  guideVerificationEvidenceKindExample: 'Video · camera-02_part-04.mp4',
  guideVerificationEvidenceKindExample2: 'Log · device-output.jsonl',
  guideVerificationEvidenceKindExample3:
    'Protocol / report · signed-inspection.pdf',
  guideVerificationEvidenceKindRule:
    'Automatic detection is a starting point. Choose the meaning of the file explicitly when its extension is ambiguous; changing the type does not rename or modify the file.',
  guideVerificationEvidenceTitleHelp:
    'A readable title explaining what this file contributes to the attempt.',
  guideVerificationEvidenceTitleExample:
    'Camera 2 · bench overview · segment 04',
  guideVerificationEvidenceTitleExample2:
    'Controller event stream · observer clock reference',
  guideVerificationEvidenceTitleExample3:
    'Inspection protocol · initial rejected blank',
  guideVerificationEvidenceTitleRule:
    'The filename is suggested initially. Use camera/device identity, viewpoint or segment information to distinguish many similar files.',
  guideVerificationEvidenceRequiredHelp:
    'Whether the file must be present when the project structure is checked.',
  guideVerificationEvidenceRequiredExample:
    'Required · completed inspection protocol',
  guideVerificationEvidenceRequiredExample2:
    'Required · original controller log',
  guideVerificationEvidenceRequiredExample3:
    'Optional · planned camera placeholder with no recording',
  guideVerificationEvidenceRequiredRule:
    'Required means an expected file, not an approved result. Missing optional media must not be described as recorded or reviewed evidence.',
  guideVerificationEvidenceNotesHelp:
    'Context needed to interpret this particular artifact without guessing from its filename.',
  guideVerificationEvidenceNotesExample:
    'Camera 2; segment 04; use the reference marker recorded in the protocol.',
  guideVerificationEvidenceNotesExample2:
    'Observer log; timestamps use the workstation clock stated in the protocol.',
  guideVerificationEvidenceNotesExample3:
    'Planned overview image only; no file has been captured or reviewed.',
  guideVerificationEvidenceNotesRule:
    'Describe source, viewpoint, segment, time reference and limitations where useful. Do not substitute file presence or a hash match for engineering review.',
};
