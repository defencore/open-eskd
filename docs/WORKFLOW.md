# Engineering workflow

## 1. Create and identify

Choose **Create project** and enter its name and designation. Choose the main product type: part, assembly, complex or set. An assembly is selected by default. The main component is created and the product structure opens immediately. Every project and component creation field has an info icon. Hover over it, focus it with the keyboard, or tap it to read the description, several examples and filling guidance. Type and status help follows the current selection. Examples are not entered as your data; use your organization's identifiers and real product information. Required fields are marked with an asterisk. Description and responsible lead are optional additional fields. You can uncheck the main-component option to start empty, then add an assembly, complex or set. Select an assembly and use **Add to this assembly** to avoid choosing the parent again. Add nested assemblies and leaf parts, purchased items, standard items and materials. Designations are unique within a branch. Define each quantity relative to its immediate parent; a top-level quantity represents the number of complete products.

For a larger structure, use **Paste a list**: copy designation, name and quantity columns from Excel, or use semicolons. Preview validates every row before adding the list. All rows use the selected parent and component type. Use **Add & continue** for repeated manual entries.

Expand **Manufacturing details** in the component form to assign responsibility, material, process and manufacturing location. Choose a technology, then open **Manufacturing route** to add a typical sequence or custom operations. Record the blank and preparation, then add instructions, inputs, equipment, location and result checks for each operation. Existing routes are never replaced by choosing another technology. Revision and status have their own expandable section. Separate facilities can use the manufacturing view to identify their work and download the relevant files. Units are free text so quantities can represent pieces, kilograms or metres.

## 2. Add documentation

Add relative file references from Documents or a component inspector. Describe the component, purpose, revision, requirement and optional expected SHA-256. Files remain on disk. Use the generated creation/check scripts and export a local HTML report for images and links; see [FILESYSTEM.md](FILESYSTEM.md).

Adding another revision of a document creates a new document entry. Remove the superseded entry from the working configuration if appropriate. Saving versions before replacing files preserves access to previous revisions.

## 3. Save an engineering version

Use **Save version**, enter a unique label, author and a meaningful change description. A saved snapshot contains the exact project metadata, structure and document references. It cannot be edited through the application. Subsequent work changes only the branch's working configuration.

A component's revision identifies its engineering definition; a project version identifies the complete configuration. These are separate fields. Describe the reason for a component change in the next saved project's change description.

## 4. Work in parallel

Save a shared baseline, export the ZIP and provide the same package to all participating engineers. Each engineer imports that package and creates a design variant (stored as a branch), such as `mechanical/rev-b` or `electronics/rev-c`. A branch starts from a saved version; uncommitted work stays in its original branch. Engineers then edit, save a uniquely named version and export their updated package.

Use version labels that include a meaningful branch suffix when engineers may save in parallel. Branch names and globally unique commit/component/document identities are preserved in the exported package.

## 5. Bring the results together

Import the colleague's ZIP or JSON. If the project identity already exists, choose **Add branches & history**. Local working changes and branch heads are preserved. New incoming branches receive an `incoming/` prefix. Repeatedly importing the same unchanged branch does not duplicate it.

Switch to an incoming branch with uncommitted changes and save a version before merging. Then return to the target branch and save its working changes too. Choose **Merge variants** and the source branch.

The application finds a shared ancestor and performs a three-way comparison:

- If only one side changed a field, take that change.
- If both sides made the same change, keep one copy.
- If both changed the same field differently, require a choice.
- If one side deletes an item that the other edits, require a choice for the whole item.
- After choices, validate parent links, document links, unique designations and cycles before creating the merge version.

Merging creates a new immutable version with two parents. Source branches remain available. Structural conflicts can arise even when individual fields do not conflict, such as deleting an assembly while another branch adds a child. In that case, repair the source configurations and compare again. The application never silently drops orphan components or documents.

A binary file is indivisible. If its contents differ, choose one document reference or retain both as separately named document entries. Open ESKD does not merge CAD geometry, spreadsheets or drawing contents.

## 6. Prepare manufacturing

Set component statuses, responsibilities, manufacturing locations and document links. The completeness checklist identifies missing records. A part or assembly must have an associated drawing, assembly drawing or model entry; standard and purchased items do not require these entries. Assembly locations are useful but are not mandatory for the completeness check.

Once all checks are resolved, **Save version** can mark a configuration as released. Review the actual documents through your organization's approval process. The app only validates metadata and links.

The manufacturing view offers component routes, a dependency-aware operation order and operation worklists by facility. Quantities multiply through all parent levels. For example, two assemblies containing four brackets each require eight brackets. Export the CSV or print the configuration. Complete ZIP exports include an English CSV inventory and an assembly inventory Markdown file for the active working configuration.

## 7. Keep transferable backups

Export after meaningful changes. JSON retains all saved versions, working copies, external file references and production records. ZIP bundles metadata, scripts and a report. Actual file bytes stay on disk and must be backed up and transferred separately. Historical references retain their paths and expected hashes; the tool cannot retain files that are removed from disk.

Opening a project as a separate copy generates a new project identity and intentionally breaks future cross-project merging. Use incoming history for continuing collaboration, and a separate copy for independent projects.

Route steps can select prerequisite operations, revision-controlled input or matching components, and controlled document references. Changed revisions, paths or expected hashes require explicit review and confirmation before release. For staged work such as piston manufacture after tube press fitting, follow [the staged assembly example](STAGED_ASSEMBLY.md).
