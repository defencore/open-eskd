export default {
  exampleGuide: 'Example walkthrough',
  exampleGuideSubtitle:
    'Learn to organize a complete engineering project by exploring its structure, files and changes.',
  exampleLearningLabel: 'LEARNING PROJECT',
  exampleTitle: 'Atlas · Civilian inspection complex',
  exampleHomeDescription:
    'Explore a complete project: an inspection UAV, operator console, ground station, communications, antenna tracker, batteries, supplier equipment, software and verification records. Follow the walkthrough, then create your own project.',
  exampleHardware: 'Hardware',
  exampleSoftware: 'Software',
  exampleEvidence: 'Tests and evidence',
  exampleInfrastructure: 'Supporting infrastructure',
  exampleVersions: 'Revisions and production',
  exampleOpen: 'Explore the example',
  exampleCreateOwn: 'Create my own project',
  exampleBranches: 'Design variants',
  exampleSavedVersions: 'Saved versions',
  exampleSyntheticNotice:
    'This fictional project teaches documentation and configuration management. All results are synthetic. Video and photo paths are optional placeholders; original engineering files remain separate. Example records do not approve a real product for manufacture or use.',
  exampleExploreTitle: 'Explore the project, one subsystem at a time',
  exampleExploreDescription:
    'Open a section to select its component in the product structure. Examine its children, quantities, file references, responsible team and operation sequence.',
  exampleExploreComponent: 'Open in structure',
  exampleSectionUnavailable:
    'This section is absent from the selected variant.',
  exampleSectionOverview: 'The complete product and its boundaries',
  exampleSectionOverviewDescription:
    'Start at the complex: separate products work together under one project. Follow the requirements, configuration plan and facility handover references, then expand each subsystem into assemblies, parts and purchased items.',
  exampleSectionAircraft: 'Aircraft, avionics and inspection equipment',
  exampleSectionAircraftDescription:
    'Follow the airframe, camera bracket, avionics board, supplier modules and parachute package. Compare a manufactured part with an assembly and a purchased item; check quantities per parent and the documents needed at each level.',
  exampleSectionSoftware: 'Software releases and configuration',
  exampleSectionSoftwareDescription:
    'Software is organized as logical sets with release manifests, dependency inventories, configuration references and bench test plans. The aircraft, console, ground station and tracker each retain their own release identity and artifact paths.',
  exampleSectionGround: 'Operator console and ground station',
  exampleSectionGroundDescription:
    'Explore the ground computer, network, evidence storage and monitoring software. The operator console is a separate subsystem with its enclosure, controls and application. A parallel variant evaluates another ground computer while preserving the original baseline.',
  exampleSectionCommunications: 'Communications and supplier interfaces',
  exampleSectionCommunicationsDescription:
    'Review the telemetry module, antenna and harness, their supplier documents and interface matrix. Operation links record the component and document revisions required for integration and bench verification.',
  exampleSectionTracker: 'Antenna tracker and distributed work',
  exampleSectionTrackerDescription:
    'Trace mechanical brackets, purchased drive and controller, and the tracker software release. Two brackets are required per tracker. The MVP work order shows a rejected blank, an accepted replacement and the subsequent operations without erasing the rejection.',
  exampleSectionPower: 'Batteries, chargers and service records',
  exampleSectionPowerDescription:
    'Battery packs, chargers, approved adapters and storage equipment belong to the supporting infrastructure. Compatibility and service registers link the supplier identities to the documentation and the responsible service team.',
  exampleSectionSuppliers: 'Launch assistance and parachute suppliers',
  exampleSectionSuppliersDescription:
    'The catapult package and aircraft parachute package are managed as supplier-controlled equipment: component identity, revision, responsibility, interface documents and service status. Their internal designs and operating procedures remain with the supplier.',
  exampleSectionVerification: 'Many test attempts, videos, logs and protocols',
  exampleSectionVerificationDescription:
    'Explore eight separate test attempts with 56 evidence paths: multiple cameras, independent log streams, protocols, images and datasets. Compare a failed A attempt with its B retest without rewriting the frozen MVP. Supplied text fixtures are synthetic; videos and images are absent optional references.',
  exampleSectionReplacement: 'Replacing a component without losing history',
  exampleSectionReplacementDescription:
    'Compare telemetry catalog revisions A and B and the CHG-002 interface review. Main uses B for future work, while the issued MVP-001 order retains A and its original routes. A component revision change therefore does not rewrite an existing work order.',
  exampleLifecycleTitle: 'Follow the same configuration through its lifecycle',
  exampleDocumentsDescription:
    'Inspect relative paths for drawings, software releases, test plans and evidence. Generate folders locally, place real files there, run the check script and import its result. File presence and a matching hash do not replace engineering review.',
  exampleManufacturingDescription:
    'Switch between component routes and operation order. Review preparation, input components, controlled documents, equipment, location and acceptance criteria. Dependencies explain what must be accepted before the next operation can proceed.',
  exampleHistoryDescription:
    'Compare the MVP A baseline, the separate ground-station variant and main after the interface change. Saved versions show what changed and who recorded it; each variant has its own working configuration.',
  exampleCatalogDescription:
    'Inspect the telemetry component revisions and their ancestry. Use a pinned revision when reusing a component, then review the differences before selecting another revision for a placement.',
  exampleProductionDescription:
    'Open MVP-001 to inspect its frozen baseline, facility work orders, accepted quantities, rejections and evidence paths. One communications test remains incomplete, so dependent work stays blocked. The later main revision does not alter this batch.',
  exampleOwnTitle: 'Build your project using the same approach',
  exampleOwnStructure:
    'Define the project boundary and main item: a complex, assembly, standalone part or set. Add subsystems and their components; assign stable designations, quantities per parent and responsible teams. Use a set for a logical software release with its own files.',
  exampleOwnFiles:
    'Register relative paths to controlled drawings, models, manifests and other documents. Generate the folder structure, move real files into it, run the verification script and import the report. Keep your project JSON alongside the project files.',
  exampleOwnRoutes:
    'Describe preparation and ordered operations for each manufactured, supplied or verified item. Link input components, prerequisite operations and the exact document revisions. Assign locations and measurable acceptance criteria.',
  exampleOwnEvidence:
    'Reference test plans and a requirements matrix. In the test journal, record each attempt against its saved hardware/software configuration and attach all related log, recording, protocol and dataset paths. Link a new retest to an earlier failure; keep missing evidence and unresolved checks visible.',
  exampleOwnHistory:
    'Save project versions with clear change descriptions. Publish reusable component revisions, explore alternatives in separate variants and review revision differences before replacing a component or merging changes.',
  exampleOwnProduction:
    'Issue a prototype or series work order from the reviewed configuration. Export instructions by operation location and record new accepted/rejected quantities, operators, inspection notes and evidence paths. An issued order keeps its original configuration.',
  exampleOwnNotice:
    'Use the example as a guide to organizing information. Your own project needs its own reviewed engineering documents, acceptance criteria and approvals. Save and share the project JSON regularly; it contains the description and history, while the actual files stay in your folders.',
};
