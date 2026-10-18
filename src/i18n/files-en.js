export default {
  file: 'File',
  documentType: 'Document type',
  component: 'Component',
  projectLevel: 'Project document',
  fileSize: 'Size',
  download: 'Download',
  noDocuments: 'No documentation yet',
  drawing: 'Part drawing',
  assemblyDrawing: 'Assembly drawing',
  specification: 'Specification',
  model: '3D model',
  schematic: 'Schematic',
  instructions: 'Instructions',
  test: 'Test report',
  other: 'Other document',
  editDocument: 'Document details',
  documentRevision: 'Document revision',
  deleteDocument: 'Delete document',
  deleteDocumentText:
    'Remove this file reference from the current branch. Saved versions keep the reference; the file on disk stays in place.',
  exportTitle: 'Export project',
  exportDescription:
    'The package includes branches, versions, file references and production records. Transfer real engineering files separately.',
  zipExport: 'ZIP · Metadata toolkit',
  jsonExport: 'JSON · Portable format',
  bomExport: 'CSV · Specification',
  bomExportText:
    'Current branch with total quantities and manufacturing locations.',
  exported: 'Export ready',
  importing: 'Importing…',
  imported: 'Project imported',
  importSameTitle: 'This project is already in your workspace',
  importSameText:
    'Choose how to bring in work from another engineer. Your existing changes will be preserved.',
  importHistory: 'Add branches & history',
  importHistoryText:
    'Imported branches appear with the incoming/ prefix. You can merge them afterwards.',
  importCopy: 'Open a separate copy',
  importCopyText: 'Create an independent project with a new identity.',
  historyImported: 'History and branches added',
  nothingToImport: 'No new versions or branches',
  fileIntegrity: 'File contents are verified using SHA-256.',
  fileMetadata: 'File details',
  hashError: 'File content SHA-256 verification failed. Import rejected.',
  downloadArchive: 'Save ZIP',
  noFilesForComponent: 'No files have been attached to this component.',
  documentsFor: 'Documents for',
  chooseFileTarget: 'Add files to',
  importUpdate: 'Add changes from JSON / ZIP',
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
  filePathError:
    'Use a unique relative path with / separators. Avoid .., reserved filenames and file/directory collisions.',
  verificationReportError:
    'This check does not cover the current project. Generate and run its current check script.',
  guideFileImageHelp:
    'Choose a local PNG, JPEG, WebP, GIF or SVG image. The HTML report displays it using a relative path. The image stays on disk.',
  guideFileImageExample: 'components/P.001.101/rev-A/preview.png',
  guideFileImageExample2: 'components/P.001.101/rev-A/photo.jpg',
  guideFileImageExample3: 'components/P.001.101/rev-A/assembly-view.svg',
  guideFileImageRule:
    'Save report.html at the project root so image paths resolve correctly.',
  reportParent: 'Parent assembly',
  metadataPackageOnly:
    'Import project.json or a metadata toolkit. Transfer real engineering files separately.',
  fileCheckUnavailable:
    'File check could not be compared; retry in a browser with local cryptography support',
  searchDocuments: 'Search documents…',
  allDocuments: 'All documents',
  snapshotFiles: 'Files in this version',
  filesImported: 'Archive files added',
  kind: 'Document type',
  size: 'Size',
  path: 'File path',
  jsonExportText:
    'One lightweight file: structure, paths, routes, history and production results.',
  zipExportText:
    'JSON, scripts, BOM and local HTML report. Original engineering files remain separate.',
  noDocumentsText:
    'Add expected relative paths to drawings, models and images.',
};
