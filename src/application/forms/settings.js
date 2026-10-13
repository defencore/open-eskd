import { preference } from '../../storage/preferences.js';

export function createSettingsForms(context) {
  const { state } = context;
  const toast = (...args) => context.toast(...args);
  const render = (...args) => context.render(...args);
  const t = (...args) => context.t(...args);

  async function handleForm(form, data, get, submitter) {
    switch (form.dataset.form) {
      case 'profile':
        state.author = get('author');
        state.lang = get('language');
        preference('eskd-author', state.author);
        preference('eskd-language', state.lang);
        render();
        toast(t('profileSaved'));
        break;

      default:
        return false;
    }
    return true;
  }

  return { handleForm };
}
