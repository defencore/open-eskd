# Atlas: complex engineering project walkthrough

Choose **Explore the example** on the project screen, or import `examples/inspection-complex.json` through **Open JSON / ZIP**. The example is a fictional civilian infrastructure inspection complex. It has 54 components, 75 relative document references, two parallel project branches, catalog revisions A/B and one frozen prototype batch with 17 synthetic production result records. Its separate verification journal contains eight synthetic test runs with 56 evidence references: 16 videos, 16 logs, eight protocols, eight datasets and eight images.

The application example follows the selected English or Ukrainian interface language when created. The shipped JSON and all companion file contents are English. Switching the interface language does not translate user-owned project records; choose the other language before opening a fresh example if needed.

This is a configuration and documentation example. It is not an aircraft design, flight manual, launcher design, parachute procedure or battery charging guide. No actual media, flight-control source, firmware binary, CAD model, manufacturing dimensions, operating settings or supplier approval is supplied. All components remain draft; no saved version is released or certified.

## Explore the complete product tree

| Subsystem                        | Designation   | What to inspect                                                                             |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| Complete inspection complex      | `ATL.000.000` | Product boundaries, requirements, configuration plan and facility handover references       |
| Inspection aircraft              | `ATL.100.000` | Airframe, service parts, supplier propulsion, avionics, software and recovery package       |
| Operator console                 | `ATL.200.000` | Enclosure, display, controller, input modules and console software release                  |
| Ground station                   | `ATL.300.000` | Computer, network, evidence archive, monitoring software and offline restoration reference  |
| Communications                   | `ATL.400.000` | Supplier module, antenna, harness, compatibility matrix and revision replacement            |
| Antenna tracker                  | `ATL.500.000` | Mechanical parts, procured positioning drive, controller and software compatibility set     |
| Battery service infrastructure   | `ATL.600.000` | Battery inventory, chargers, supplier adapters, storage and service records                 |
| Launch-assist / catapult package | `ATL.700.000` | Supplier-controlled black-box identity, document index and responsibility boundary          |
| Parachute recovery package       | `ATL.800.000` | Supplier-controlled modules, interface references and service status                        |
| Verification package             | `ATL.900.000` | Requirements matrix, test plan, bench fixture, synthetic logs and absent video placeholders |

The hierarchy is deeper than the designation's dotted groups. For example, `system → aircraft → avionics → aircraft software configuration → firmware release` is a five-level structure. Parent/child links define hierarchy; identifiers do not impose a three-level limit. Use your organization's classification rules and document their meaning.

Each quantity is relative to its immediate parent. The tracker contains two mounting brackets. A batch of two complete complexes therefore needs four brackets. Inspect the production view to see that multiplication rather than entering total quantities into every child.

## Ten learning stops

1. **Start at the complete complex.** Read the project description, then expand the structure by subsystem. Select an assembly to see its children and operation route. The supplier boundaries help separate work you own from documentation you need from another organization.
2. **Inspect a manufactured part.** Select the tracker mounting bracket or service cover. Examine its material description, drawing reference, facility, ordered operations and inspection check. The controlled drawing must supply actual geometry and acceptance criteria; an example description cannot replace it.
3. **Inspect logical software items.** Open the aircraft software configuration set. Software items use the `set` product type rather than pretending source code is a mechanical drawing. Review the release manifest, dependency inventory/SBOM, artifact path and bench test reference. Engineering revision `A` and software release `1.2.0` are different identifiers with different purposes.
4. **Follow infrastructure dependencies.** Select the ground station, communications subsystem and tracker. These are separate assemblies with their own ownership and documentation. The battery service station and supplier launch/recovery packages also belong to the complete system configuration, rather than being loose notes outside the project.
5. **Read the verification package and journal.** The test plan links selected subsystem operation prerequisites to the requirements matrix. The verification journal groups many files under each distinct test attempt, rather than replacing a single evidence path. A run identifies its case, saved configuration or frozen batch, selected component/operation, operator, time, outcome and optional earlier attempt. Artifacts carry independent IDs, kinds, titles, paths and notes. Do not infer those facts from filenames alone.
6. **Distinguish supplied fixtures from expected files.** The `inspection-complex-files` companion directory contains small synthetic CSV/log/text examples. No MP4 or JPEG is included. Paths ending in `.placeholder.mp4` or `.placeholder.jpg` are optional absent references. Other missing controlled documents are intentionally visible in file verification.
7. **Compare catalog revisions A and B.** Select the telemetry module, then inspect its catalog history. B descends from A and changes the supplier interface reference under `CHG-002`. The current main branch uses B. Controlled operation and document links were explicitly reviewed for that replacement; a real project must perform the actual compatibility review.
8. **Compare parallel work.** Switch to `ground/rugged-station`. It evaluates an alternative rugged ground computer while keeping telemetry A. Return to `main` to see telemetry B and the original ground computer. The common base is `0.2.0-mvp-a`. The branch is intentionally not merged: reviewers can compare and resolve its changes before adoption.
9. **Inspect the frozen MVP batch.** Open `MVP-001 · SYNTHETIC` in Production. It was issued for two systems at `0.2.0-mvp-a`, with telemetry A. Later changes on main do not rewrite its component revisions, documents, quantities or routes. Review the bracket preparation: three accepted plus one rejected, then one accepted replacement. Accepted quantity becomes four; rejected quantity stays one.
10. **Observe incomplete work.** The communications bench example has one accepted and one rejected result against a target of two. Final integration remains blocked by unaccepted prerequisites. A newer catalog revision does not complete an existing work order, erase a rejection or count as a successful retest.

## Many attempts and many evidence files

Open the verification journal to explore these separate attempts. Every row is synthetic; the outcomes demonstrate record handling and do not establish actual engineering acceptance.

| Case      | Demonstration run                           | Configuration / outcome                             |
| --------- | ------------------------------------------- | --------------------------------------------------- |
| `COM-003` | Original interface identity review          | Frozen MVP A / failed                               |
| `COM-003` | Separate interface B retest                 | Saved main B / passed, links the failed A run       |
| `SW-001`  | Software release reference replay           | Saved main B / passed                               |
| `NCR-001` | Initial bracket blank identity review       | Frozen MVP A / failed                               |
| `NCR-001` | Replacement blank identity review           | Frozen MVP A / passed, links the original rejection |
| `PWR-001` | Incomplete battery inventory evidence       | Saved main B / inconclusive                         |
| `GST-001` | Ground station offline restoration exercise | Saved alternative ground-station branch / passed    |
| `SYS-001` | Final integration with unresolved inputs    | Saved main B / blocked                              |

Each attempt has seven artifact references: its protocol, separate application and observer logs, a dataset, two camera viewpoints and an overview image. The 32 protocol/log/dataset files in `SIM-002` are supplied small synthetic text fixtures. The 16 video and eight image paths are absent optional placeholders. No empty media files are generated to make verification appear complete.

The failed A attempt and the passed B attempt have different IDs, configuration references and evidence paths. The B retest does not rewrite the A attempt, the frozen batch or its quantities. The two bracket attempts show a retest within the same frozen configuration. A verification outcome never increments production acceptance or rejection quantities; those remain separate append-only production results.

For a real project, keep each attempt as a new record. Attach as many independent camera recordings, device logs, protocols, screenshots and datasets as needed to describe that attempt. Save the reviewed project configuration first, or select the issued batch's frozen configuration. Link a retest to the earlier attempt instead of editing its failure away. Large files stay in your local project directories; JSON stores only their metadata and relative paths.

## Use the example to start your own project

Treat the example as a pattern to inspect, not a set of ready-made engineering claims. Use **Create my own project** in the guide to start an empty structure with your own identity. Do not reuse the fictional production records as records of your own units.

1. Define the complete product boundary and choose `complex`, `assembly`, `set` or a standalone item as appropriate. For an existing product you are investigating, choose the decomposition workflow and record observed/supplier provenance, uncertainty and reference evidence.
2. List the top-level deliverables and support infrastructure. Add children until each leaf represents an independently identified part, purchased item, material, software configuration or document set. Keep unknown details marked as unknown; do not invent certainty to make the tree look complete.
3. Give every controlled item a stable designation and revision. Assign an owner and a facility. Keep purchased black boxes at the level of detail supported by supplier documentation.
4. Register relative paths to drawings, models, schematics, software release manifests and test procedures. Group test evidence under distinct verification attempts with their exact saved configuration. Store the actual files in your own local project root. Optional SHA-256 values should come from actual controlled files, not made-up example values.
5. Define preparation, material/blank references, operation order, inputs, responsible facilities and acceptance checks. Link exact input and document revisions. Give every required input an acceptance or production route before issuing a work order.
6. Save a reviewed configuration before creating a batch. Send relevant work orders and controlled files to each facility through your organization's process. Capture accepted quantity, rejected quantity, disposition notes and evidence paths without rewriting previous results.
7. Publish reusable component revisions when their boundaries are clear. Create a new revision for a change, review affected references and update occurrences explicitly. Decide separately how already issued batches should be reworked or superseded.

The service organizes records and enforces data/operation consistency. Your engineering review, approval authority and applicable regulations determine whether real documentation and results are sufficient.

## File layout and checking exercise

Use `examples/inspection-complex-files/` as a disposable project root. It contains only the small synthetic text fixtures whose paths are represented by the manifest. A larger real project might use this layout:

```text
project-root/
  project.json
  report.html
  documentation/system/
  hardware/
    aircraft/
    airframe/
    avionics/
    console/
    communications/
    tracker/
  software/
    aircraft/1.2.0/
    payload/0.8.0/
    console/0.9.0/
    ground/0.6.0/
    tracker/0.4.0/
  infrastructure/
    ground/
    power/
  suppliers/
    avionics/
    propulsion/
    communications/
    tracker/
    power/
    launch-assist/
    recovery/
  verification/
    requirements-verification-matrix.csv
    system-bench-test-plan.md
    changes/CHG-002_telemetry-adapter-substitution.md
    fixtures/
    software/
    console/
    communications/
    tracker/
    evidence/SIM-001/
      dataset-manifest.json
      evidence-index.md
      telemetry.synthetic.csv
      console-replay.synthetic.log
      communications-bench.synthetic.log
      bracket-inspection.synthetic.csv
      battery-identity.synthetic.csv
      ground-replay.synthetic.log
      video/       # Optional recordings are absent from the example.
      images/      # Optional photographs are absent from the example.
    evidence/SIM-002/
      com-a/       # Failed attempt on frozen MVP A.
      com-b/       # Separate retest on saved B; A remains unchanged.
      software/
      bracket-initial/
      bracket-replacement/
      battery/
      ground-restore/
      integration/
        protocol.synthetic.md
        application.synthetic.log
        observer.synthetic.log
        dataset.synthetic.csv
        video/     # Two absent optional camera recordings per attempt.
        images/    # One absent optional overview image per attempt.
```

Export the project JSON and, optionally, an HTML report into the root. Copy the generated creation script for your system and run it from that root. It creates only missing directories and small sidecar markers; it does not manufacture empty engineering files or overwrite existing work. Move real controlled files into the expected paths yourself.

Run the generated verification script from the same root. Save its output in a new JSON file and import that report into Open ESKD. Supplied text fixtures should be present; missing controlled drawings, software artifacts and supplier records should remain reported as missing. Optional absent videos must not be represented as reviewed recordings. File presence or an optional hash match is a file fact, not an engineering approval.

Project ZIP exports contain metadata, reports and scripts. They do not embed the companion files, CAD data, firmware or videos. Transfer the required controlled engineering files separately.

## Example maintenance

`src/data/complex-example/` separates shared builders, aircraft, ground systems, support infrastructure, verification, verification runs and the revision/production scenario. `createComplexExample(lang)` returns a deterministic validated project; `demoProject(lang)` gives a new workspace identity while retaining stable internal learning anchors. The example marker is `project.extensions['org.openeskd.example']` with ID `inspection-complex` and content version `2`. The verification profile is `project.extensions['org.openeskd.verification']` with version `1` and a `runs` array.

`tests/complex-example.test.js` verifies both locales, stable JSON, navigation anchors, controlled references, revision ancestry, frozen production, rejection/prerequisite behavior, many-artifact attempts, retest links, synthetic fixture references and JSON/ZIP round trips. Ukrainian immutable identities carry a `-uk` namespace so localized catalog, history and verification IDs can coexist with the English example; navigation placement/operation IDs remain stable. Companion fixture contents describe the English canonical training project. Regenerate the shipped English JSON deliberately when the factory changes; builds do not rewrite it or user data.
