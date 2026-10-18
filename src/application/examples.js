import { demoProject, COMPLEX_EXAMPLE_SECTIONS } from '../data/demo.js';
import { isExampleProject } from './example-project.js';

export function createExamplesController(
  context,
  { createExample = demoProject } = {},
) {
  const { state } = context;
  async function handleAction(name, element) {
    if (name === 'demo') {
      let project = state.projects.find(isExampleProject);
      if (!project) {
        project = await createExample(state.lang);
        state.projects.push(project);
        await context.persist(project);
      }
      context.selectProject(project.id, 'exampleGuide');
      return true;
    }
    if (name !== 'example-section') return false;
    if (!isExampleProject(context.project())) return true;
    const section = COMPLEX_EXAMPLE_SECTIONS.find(
      (item) => item.id === element?.dataset.id,
    );
    if (
      !section ||
      !context
        .snapshot()
        .components.some((item) => item.id === section.componentId)
    )
      return true;
    state.collapsed.clear();
    context.inspectComponent(section.componentId);
    return true;
  }
  return { handleAction };
}
