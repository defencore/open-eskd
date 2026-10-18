import { translationModules } from './modules.js';

export const strings = Object.fromEntries(
  ['en', 'ua'].map((language) => [
    language,
    Object.assign({}, ...translationModules.map((module) => module[language])),
  ]),
);

export const translate = (lang, key) => {
  const dictionary = Object.hasOwn(strings, lang) ? strings[lang] : strings.en;
  if (Object.hasOwn(dictionary, key)) return dictionary[key];
  return Object.hasOwn(strings.en, key) ? strings.en[key] : key;
};
