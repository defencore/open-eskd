import en from './en.js';
import uk from './uk.js';
import workflowEn from './workflow-en.js';
import workflowUk from './workflow-uk.js';
import foundationEn from './foundation-en.js';
import foundationUk from './foundation-uk.js';
export const strings = {
  en: { ...en, ...workflowEn, ...foundationEn },
  ua: { ...uk, ...workflowUk, ...foundationUk },
};
export const translate = (lang, key) =>
  strings[lang]?.[key] ?? strings.en[key] ?? key;
