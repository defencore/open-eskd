export function isExampleProject(project) {
  return (
    project?.extensions?.['org.openeskd.example']?.id === 'inspection-complex'
  );
}
