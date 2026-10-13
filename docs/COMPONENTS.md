# Component and subsystem workflow

Use the same workflow for an individual part, a reusable assembly or a subsystem. The interface is available in English and Ukrainian.

## A single part

Create a project, choose **Part** as its main component type and fill in its designation. Add drawings and manufacturing information to that component. Save a project version and export the complete ZIP as usual. A catalog revision is optional until the part needs to be reused or exchanged independently.

## Reuse a component

Select an editable component and choose **Save revision to catalog**. Enter a revision label and author. The saved revision includes its subtree and component-linked documents, normalized to one unit of the root component. The current placement becomes pinned.

Open **Component catalog → Revisions and use**, choose the required revision and **Add to structure**. Choose a parent assembly and relative quantity. Repeating this creates distinct placements of the same component identity. Quantities multiply through the enclosing product structure. **Where used** lists the component placements and total quantities across current working configurations in this browser.

The workspace catalog discovers records from projects loaded in the current browser. Adding a component copies its revision ancestry, required dependencies and file references into the destination project. Clearing or removing the source project does not break the destination package.

## Change a component without changing other uses

Choose **Start a new revision** on the root of a pinned component. That placement becomes editable; other uses retain their original pinned revisions. Nested components that were independently pinned remain pinned after checkout of their parent.

After editing, save a new catalog revision. Its ancestry points to the revision used for checkout. The component's other placements do not update automatically. Choose **Change pinned revision** on a placement, select a revision and compare the changes before applying.

A project version captures the complete resolved configuration and exact revision references. Catalog publication does not replace project-version snapshots or manufacture approvals.

## Exchange a subsystem

Choose **Component ZIP** for a revision. The package includes the component's revision ancestry, dependencies and linked documents. Project-level documents, unrelated components and the original project's branches are excluded.

In the destination project, open the ZIP and choose **Add to project catalog**, then add the required revision to the structure. From the project-list screen, the package can also be opened as a standalone project for independent work. The recipient should use the same or a newer application build supporting schema version 6.

To return a revised subsystem, start a new revision from the received component, save it under a new label, and export its component ZIP. The integrator imports it and explicitly changes the pinned revision after comparison.

## Current scope

The app verifies identities, relationships, revision immutability and file integrity. Catalog release checks verify recorded ownership, status, manufacturing locations and drawing/model links. They do not establish formal approval authority or certify engineering correctness.

Formal change approval, requirement/interface traceability and the actual configuration of manufactured serial-numbered products require further development. Large documents remain subject to the documented file and memory limits.

An explicit revision update preserves a document occurrence ID when its component/purpose slot is unique, even if its filename or path changes. External operation links keep their earlier revision/path/hash expectations and require review. Ambiguous multiple-document replacements must be resolved explicitly; the service does not guess which drawing supersedes another. “Create similar” copies one element’s fields and route; add its children and file references separately. Use the catalog to reuse complete assemblies.
