export default {
  production: 'Production',
  productionSubtitle: 'Frozen work orders and production results',
  saveProjectJson: 'Save project JSON',
  exportWorkingHint:
    'The export includes the current working configuration and changes made since the last saved version.',
  addReference: 'Add file reference',
  fileReference: 'File reference',
  referenceHint:
    'Describe the files by relative paths. CAD, drawings and images stay in your local project directory.',
  filePath: 'Relative file path',
  fileHash: 'SHA-256 (optional)',
  fileRequirement: 'File requirement',
  requiredFile: 'Required',
  optionalFile: 'Optional / restricted',
  image: 'Component image',
  suggestFilePath: 'Suggest a standard path',
  localReferencePreview:
    'Open the file in your local project directory. The exported HTML report contains relative links and component images.',
  noFileHash: 'No hash specified; verification checks presence only.',
  copyPath: 'Copy path',
  localFileStructure: 'Local project files',
  fileWorkflow1: 'Describe expected paths',
  fileWorkflow2: 'Create folders and move real files',
  fileWorkflow3: 'Check completeness and export the report',
  createDirectories: 'Create folders',
  checkFiles: 'Check files',
  importFileCheck: 'Import check result',
  exportHtmlReport: 'HTML report',
  lastFileCheck: 'Last matching file check',
  fileCheckStale: 'Structure changed; repeat the file check',
  fileProblems: 'file warnings',
  verificationDetails: 'Verification details',
  noFileCheck: 'Local file existence has not been checked.',
  createScriptHint:
    'Open a terminal in the project root and paste this script, or download and run it there. It only creates missing folders. Existing files are preserved. Save project.json in that root separately.',
  checkScriptHint:
    'Run in the project root. The script reads files, lists missing/empty/placeholder files and compares configured SHA-256 hashes. It does not modify files.',
  scriptPlatform: 'Operating system',
  placeholderMode: 'Absence markers',
  directoriesOnly: 'Folders only',
  directoriesAndMarkers: 'Folders + .eskd-placeholder markers',
  generatedScript: 'Generated script',
  copyScript: 'Copy script',
  downloadScript: 'Download script',
  copied: 'Copied',
  copyManually: 'Text selected. Copy with Ctrl+C / Cmd+C.',
  checkCaptureHint:
    'To import the result, download check-files and capture its output to a NEW JSON filename. Existing output files are not overwritten by these commands.',
  fileCheckImported: 'File check imported',
  reportRootHint:
    'Save this HTML in the project root alongside project.json. Links and images use relative paths.',
  reportReadiness: 'Readiness and verification',
  engineeringIssues: 'Engineering checklist items',
  fileCheckMeaning:
    'Presence does not certify drawing correctness or approve manufacture. Verification is an imported point-in-time observation of the files.',
  reportFrozen:
    'Static report of this configuration. Regenerate after changes.',
  newBatch: 'Issue a batch / MVP',
  productionHint:
    'Issue a work order from the current configuration, distribute instructions by facility, and record accepted/rejected quantities per operation. The batch retains its original routes after project edits.',
  productionBatch: 'Batch',
  noBatches: 'No work orders yet',
  noBatchesText: 'Define routes, then issue a prototype or series batch.',
  batchName: 'Batch / work order name',
  batchMode: 'Production mode',
  prototype: 'Prototype / MVP',
  series: 'Series',
  batchQuantity: 'Project units to produce',
  batchAuthor: 'Issued by',
  issueBatch: 'Issue work order',
  batchFrozenHint:
    'The current structure, file revisions and routes will be frozen in this batch. Quantities multiply the project BOM. Later edits do not update existing work orders.',
  batchSnapshotHint:
    'This batch retains the structure, file revisions and routes captured when it was issued. Quantities multiply that configuration. Later project edits do not update this work order.',
  operationsRecorded: 'operations accounted for',
  batchReport: 'Batch report',
  facilityWorkOrder: 'Facility work order',
  recordResult: 'Record result',
  acceptedQuantity: 'Accepted quantity',
  rejectedQuantity: 'Rejected quantity',
  resultOperator: 'Performed / inspected by',
  resultNotes: 'Inspection result / rejection reason',
  evidencePath: 'Inspection record path (optional)',
  operationComplete: 'Accounted for',
  waitingPrerequisites: 'Waiting for accepted prerequisites',
  resultHistory: 'Result records',
  remainingQuantity: 'Quantity remaining',
  checkNotDefined: 'Acceptance criteria have not been defined.',
  operation: 'Operation',
  issue_prerequisiteRevision: 'A prerequisite revision needs review',
  jsonExportText:
    'One lightweight file: structure, paths, routes, history and production results.',
  zipExportText:
    'JSON, scripts, BOM and local HTML report. Original engineering files remain separate.',
  noDocumentsText:
    'Add expected relative paths to drawings, models and images.',
  attachmentHint:
    'File references are included in JSON; file bytes stay on disk.',
  addFiles: 'Add references',
  browseFiles: 'Add file reference',
  fileStatus_unknown: 'Not checked',
  fileStatus_present: 'Present; content not verified',
  fileStatus_verified: 'SHA-256 matches',
  fileStatus_missing: 'Missing',
  fileStatus_placeholder: 'Absence marker only',
  fileStatus_empty: 'Empty file',
  fileStatus_mismatch: 'SHA-256 mismatch',
  fileStatus_unsafe: 'Link or invalid file type',
  fileStatus_unreadable: 'Cannot read',
  'fileStatus_hash-unavailable': 'Hash tool unavailable',
  guideFileComponentHelp:
    'Associate the file with a component or the whole project.',
  guideFileComponentRule:
    'Use the controlled project requirements and approved documentation.',
  guideFileComponentExample: 'Printed housing',
  guideFileComponentExample2: 'Tube assembly',
  guideFileComponentExample3: 'Project quality plan',
  guideFileTypeHelp:
    'Choose its engineering purpose. Component image is displayed in the local HTML report.',
  guideFileTypeRule:
    'Use the controlled project requirements and approved documentation.',
  guideFileTypeExample: 'drawing → .pdf',
  guideFileTypeExample2: 'model → .step',
  guideFileTypeExample3: 'image → preview.png',
  guideFileRevisionHelp:
    'Record the document revision independently from its filename. Update linked operation expectations after reviewing changes.',
  guideFileRevisionRule:
    'Use the controlled project requirements and approved documentation.',
  guideFileRevisionExample: 'A',
  guideFileRevisionExample2: 'B',
  guideFileRevisionExample3: '03',
  guideFilePathHelp:
    'Path from the project root. Use / separators, no absolute path or .. segments. The standard suggestion uses designation and revision.',
  guideFilePathRule:
    'Use the controlled project requirements and approved documentation.',
  guideFilePathExample: 'components/PRJ.001.101/rev-A/PRJ.001.101_drawing.pdf',
  guideFilePathExample2: 'components/PRJ.001.101/rev-A/preview.png',
  guideFilePathExample3: 'documents/inspection-plan.pdf',
  guideFileHashHelp:
    'Optional expected SHA-256. Obtain it locally and paste the 64 lowercase hexadecimal characters. Large files never enter the browser.',
  guideFileHashRule:
    'Use the controlled project requirements and approved documentation.',
  guideFileHashExample: 'macOS: shasum -a 256 ./drawing.pdf',
  guideFileHashExample2: 'Linux: sha256sum ./drawing.pdf',
  guideFileHashExample3:
    'PowerShell: (Get-FileHash -LiteralPath ./drawing.pdf).Hash.ToLowerInvariant()',
  guideFileRequirementHelp:
    'Required files are necessary for this package. Optional files may be intentionally withheld; markers identify missing content without pretending to be a drawing.',
  guideFileRequirementRule:
    'Use the controlled project requirements and approved documentation.',
  guideFileRequirementExample: 'Required: manufacturing drawing',
  guideFileRequirementExample2: 'Optional: supplier source model',
  guideFileRequirementExample3: 'Optional: component preview',
  guideBatchNameHelp:
    'Use a unique, readable production identifier. The record will contain a frozen configuration.',
  guideBatchNameRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchNameExample: 'MVP-001',
  guideBatchNameExample2: 'BATCH-2026-004',
  guideBatchNameExample3: 'Housing trial run',
  guideBatchModeHelp:
    'Prototype and series use the same operation tracking. Choose the purpose of this run.',
  guideBatchModeRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchModeExample: 'Prototype: fit check',
  guideBatchModeExample2: 'MVP: complete demonstrator',
  guideBatchModeExample3: 'Series: approved production run',
  guideBatchQuantityHelp:
    'Number of full project units. All component and operation quantities are multiplied by it.',
  guideBatchQuantityRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchQuantityExample: '1 product × 4 screws = 4 screws',
  guideBatchQuantityExample2: '10 products × 2 tubes = 20 tubes',
  guideBatchQuantityExample3: '3 standalone parts = 3 parts',
  guideBatchAuthorHelp:
    'Person issuing the work order. This remains with the batch.',
  guideBatchAuthorRule:
    'Use the controlled project requirements and approved documentation.',
  guideBatchAuthorExample: 'Project engineer',
  guideBatchAuthorExample2: 'Production planner',
  guideBatchAuthorExample3: 'Workshop supervisor',
  guideAcceptedHelp:
    'Add newly inspected conforming units. Do not include quantities already recorded. Downstream operations wait for the whole prerequisite batch to be accepted.',
  guideAcceptedRule:
    'Use the controlled project requirements and approved documentation.',
  guideAcceptedExample: '5 conforming tubes',
  guideAcceptedExample2: '1 accepted prototype',
  guideAcceptedExample3: '0 accepted / 2 rejected',
  guideRejectedHelp:
    'Add newly rejected units and explain the reason in the inspection notes. Accepted units cannot exceed the order. Rejected attempts remain recorded when a replacement or reworked unit is accepted.',
  guideRejectedRule:
    'Use the controlled project requirements and approved documentation.',
  guideRejectedExample: '1: hole outside tolerance',
  guideRejectedExample2: '2: failed visual inspection',
  guideRejectedExample3: '0: all units conform',
  guideOperatorHelp:
    'Identify the person performing or inspecting the operation.',
  guideOperatorRule:
    'Use the controlled project requirements and approved documentation.',
  guideOperatorExample: 'Machinist name',
  guideOperatorExample2: 'Assembly technician',
  guideOperatorExample3: 'Quality inspector',
  guideResultNotesHelp:
    'Record the acceptance evidence or the specific rejection reason. Results are append-only; they are exchanged with the project JSON.',
  guideResultNotesRule:
    'Use the controlled project requirements and approved documentation.',
  guideResultNotesExample: 'Dimensions checked against drawing B',
  guideResultNotesExample2: 'Fit check passed; inspection record attached',
  guideResultNotesExample3: 'Rejected: burrs remain at hole exit',
  guideEvidenceHelp:
    'Optional relative path to a measurement sheet, photograph or test protocol. It is linked from the exported batch report.',
  guideEvidenceRule:
    'Use the controlled project requirements and approved documentation.',
  guideEvidenceExample: 'reports/MVP-001/tube-check.pdf',
  guideEvidenceExample2: 'reports/MVP-001/fit-check.jpg',
  guideEvidenceExample3: 'reports/BATCH-004/test.csv',
  productionSearch: 'Find an operation, component or facility…',
  productionMore: 'Show more operations',
  operationInstruction: 'Instructions and prerequisites',
  productionQuantityError: 'Accepted quantity exceeds the work order target.',
  productionPrerequisiteError:
    'Accept the whole prerequisite batch before recording the next operation.',
  productionResultError:
    'Enter valid new quantities, an operator, and an inspection note for any rejection.',
  batchNameUsed: 'A batch with this name already exists.',
  filePathError:
    'Use a unique relative path with / separators. Avoid .., reserved filenames and file/directory collisions.',
  verificationReportError:
    'This check does not cover the current project. Generate and run its current check script.',
  productionNeedsOperations:
    'Define manufacturing or inspection operations before issuing a work order.',
  guideFileImageHelp:
    'Choose a local PNG, JPEG, WebP, GIF or SVG image. The HTML report displays it using a relative path. The image stays on disk.',
  guideFileImageExample: 'components/P.001.101/rev-A/preview.png',
  guideFileImageExample2: 'components/P.001.101/rev-A/photo.jpg',
  guideFileImageExample3: 'components/P.001.101/rev-A/assembly-view.svg',
  guideFileImageRule:
    'Save report.html at the project root so image paths resolve correctly.',
  reportParent: 'Parent assembly',
};
