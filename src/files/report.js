import { reportContext } from './report/context.js';
import { reportLayout } from './report/layout.js';

export async function projectReport(
  project,
  language = 'en',
  batch = null,
  facility = null,
) {
  return reportLayout(await reportContext(project, language, batch, facility));
}
