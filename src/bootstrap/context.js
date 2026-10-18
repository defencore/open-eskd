import { working } from '../domain/index.js';
import { translate } from '../i18n/index.js';

export function createContext(state, { modal, reportError } = {}) {
  const context = {
    state,
    modal,
    reportError:
      reportError ||
      ((scope, error) =>
        console.error('Open ESKD ' + scope + ':', error.name, error.message)),
    t: (key) => translate(state.lang, key),
    project: () =>
      state.projects.find((project) => project.id === state.projectId),
    snapshot: () =>
      context.project()
        ? working(context.project())
        : { meta: {}, components: [], documents: [] },
    author: () => state.author || context.t('engineer'),
    fmtDate: (value) =>
      new Intl.DateTimeFormat(state.lang === 'ua' ? 'uk-UA' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value)),
    fmtSize: (size) =>
      size >= 1048576
        ? `${(size / 1048576).toFixed(1)} MB`
        : size >= 1024
          ? `${(size / 1024).toFixed(1)} KB`
          : `${size} B`,
  };
  return context;
}

export function attachFeature(context, factory) {
  const feature = factory(context);
  for (const name of Object.keys(feature)) {
    if (Object.hasOwn(context, name))
      throw new Error(`Duplicate application capability: ${name}`);
  }
  Object.assign(context, feature);
  return context;
}
