# Manufacturing workflow

## Choose a technology and starting values

Open a component and expand **Manufacturing details**. Choose 3D printing, milling, turning, casting, laser cutting, sheet-metal work, assembly, purchase/supply or Other. The technology is a classification; the ordered route may combine several technologies.

Units, materials, blanks, equipment and revision labels have editable suggestions. Engineer and facility fields reuse names already recorded in the current project. Choosing a material family does not specify its grade; add the exact designation from the drawing or specification. Suggestions do not change existing values when the interface language changes.

## Describe what is needed before work

Open **Manufacturing route** and enter:

- **Blank / stock:** material, form, dimensions, delivery condition and amount as applicable.
- **Preparation before work:** the documents, inputs, tooling, programs and checks needed before starting.

For assemblies, the manufacturing view also lists immediate child components and their quantities per parent item. Their drawings and saved revisions identify the inputs. Overall quantities multiply through the product structure.

## Create and edit the route

With a technology selected and an empty route, choose **Add typical operations**. For example, milling starts with preparation, blank cutting, milling, deburring and inspection. The sequence is a starting point that must match your actual process.

Add custom steps or use the arrows to reorder them. Remove operations that do not apply. Switching the technology preserves existing steps and typed values. Each step records:

1. Operation type.
2. What to do, with document references and required parameters.
3. Materials, blanks or input components and quantities per item.
4. Equipment, fixtures and tools.
5. Operation location; an empty value inherits the component's location for display.
6. Expected result and the acceptance check.
7. Explicit prerequisite operations from any component, revision-controlled component inputs or matching parts, and linked documents.

Templates supply operation names and order. They do not specify engineering parameters or acceptance criteria. Fill these from the controlled documentation. **Save** updates the component; closing the form without saving leaves the project unchanged. **Add & continue** starts the next component with the selected technology but an empty route and blank/preparation fields.

## Read the plan

Open **Manufacturing**:

- **Component routes** groups routes by product structure. **Operations order** gives a valid sequence across components, honoring route order, prerequisite operations and required inputs. Independent tasks can proceed in parallel. Expand an item to see its preparation, required children, linked documents and ordered operations. Search by component, designation, material, technology or location. The operations view also accepts operation names.
- **By location** groups operation tasks using each step's location, or the component location when the step has none. A component without a route is shown as an unplanned item. Facility rows show global plan numbers and prerequisite summaries, including work performed elsewhere; they also flag unreviewed links. Operation documents attached to other components count toward the task’s documentation. Repeated quantities in different operation rows refer to the same batch; they are not additional products.

The screen describes the active branch's working configuration. It records the planned process, not shop-floor completion or manufactured serial numbers. Save a project version to freeze the plan. Save a catalog revision to pin a reusable component and its route. A pinned component must be checked out before its route can change.

**Print** temporarily expands the complete filtered plan, including entries beyond the screen's pagination. CSV exports contain technology, stock, preparation and route summaries. Complete project ZIPs include `manufacturing/ASSEMBLY.md` with every operation, input, tool, location and check in manufacturing order.

## Link operations, inputs and documents

Expand **Prerequisites, components and documents** in a route step. Select a prerequisite component, then the specific operation. Earlier steps in the same route are already prerequisites. Links use placement and operation identities; component names and tree position can change without losing the link. Repeated placements show the parent path and sibling numbers where needed. The labels are derived from structure order; stored identities remain unchanged. Repeated document names also include placement context in selection and operation links.

Select required components as operation inputs or **Reference / matching part**. Their expected revision and pinned catalog identity are captured. Quantity describes the amount per processed item in the selected component’s unit; it does not change or add to BOM demand. A completed-input link waits for the entire component. For an intermediate condition, depend on its specific operation instead.

Link document references to record their expected revisions and file hashes. A revision change, checkout/replacement of a pinned input, or changed document paths or expected hashes marks the operation for review. **Confirm current revision** explicitly accepts the current identity after engineering review. Save the component, then save a project version. The release checklist blocks unreviewed links.

The app rejects cycles and missing targets. A referenced operation, component or document cannot be removed while the remaining configuration links to it. Invalid form changes stay in the form and leave the saved project intact.

### Staged assembly

An assembly completes after its own route and all children. Assembly, press-fitting and fastening steps without explicit inputs wait for all immediate children. Selecting explicit inputs narrows a step to the parts needed at that stage. Preparation can occur before those parts are finished. A container route without an assembly step or explicit inputs conservatively starts after its children.

This allows tube press fitting before piston manufacture even when both belong to the same final assembly: the press-fitting step needs only the housing and tube; piston turning depends on that step; later piston installation needs the completed piston. Requiring the whole unfinished assembly as a piston input would create a cycle.

Read [the staged assembly walkthrough](STAGED_ASSEMBLY.md) and open `examples/staged-assembly.json` for this exact demonstration. Drilling, press fitting, fitting/matching and fastening have dedicated operation choices and contextual tooltips.

Cross-component routes can be published as a reusable catalog revision only when the selected subtree contains every linked component and document. Publish their containing assembly. Repeated placements remap their links independently.

## Designation groups and structure depth

Three groups such as `PRJ.001.000` and four groups such as `PRJ.001.000.000` are both supported. Use the organization's identifier convention. An extra group can provide more classification detail when that convention requires it; it does not add a tree level automatically.

The product tree is defined by parent links and supports up to 64 levels. A designation remains stable when a component moves between assemblies. Revision labels identify definition changes separately. Identifier formats and example codes in the UI are illustrative, not a universal ESKD numbering mandate.

## Reference review

The supplied ESKD Atelier workspace was reviewed for its workshop screen, site/person selectors and `assemblyOrder` traversal. Its bottom-up workshop plan and location overview informed this workflow. Open ESKD implements routes as structured versioned records with explicit preparation, resources and checks, while retaining its browser-only distribution and catalog/history model.
