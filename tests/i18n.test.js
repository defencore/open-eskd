import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as espree from 'espree';
import { translationModules } from '../src/i18n/modules.js';
import { strings, translate } from '../src/i18n/index.js';

const locales = ['en', 'ua'];

test('feature dictionaries have matching locales and never shadow another feature', () => {
  const names = new Set();
  const defined = Object.fromEntries(
    locales.map((locale) => [locale, new Map()]),
  );
  for (const module of translationModules) {
    assert(
      !names.has(module.name),
      `Duplicate translation module: ${module.name}`,
    );
    names.add(module.name);
    assert.deepEqual(
      Object.keys(module.en).sort(),
      Object.keys(module.ua).sort(),
      module.name,
    );
    assert(
      Object.keys(module.en).length > 0,
      `Empty translation module: ${module.name}`,
    );
    for (const locale of locales) {
      for (const [key, value] of Object.entries(module[locale])) {
        assert(
          !defined[locale].has(key),
          `${locale}.${key} is defined in both ${defined[locale].get(key)} and ${module.name}`,
        );
        assert.equal(typeof value, 'string', `${locale}.${key}`);
        assert(value.trim().length > 0, `Empty translation: ${locale}.${key}`);
        defined[locale].set(key, module.name);
      }
    }
  }
  for (const locale of locales)
    assert.deepEqual(
      Object.keys(strings[locale]).sort(),
      [...defined[locale].keys()].sort(),
    );
});

test('interface translation calls use defined keys in both languages', () => {
  const missing = new Set();
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    if (value.type === 'CallExpression') {
      const { callee, arguments: args } = value;
      const isTranslation =
        (callee.type === 'Identifier' && callee.name === 't') ||
        (callee.type === 'MemberExpression' &&
          !callee.computed &&
          callee.property.name === 't');
      if (
        isTranslation &&
        args[0]?.type === 'Literal' &&
        typeof args[0].value === 'string'
      ) {
        for (const locale of locales)
          if (!Object.hasOwn(strings[locale], args[0].value))
            missing.add(`${locale}.${args[0].value}`);
      }
    }
    Object.values(value).forEach(visit);
  }
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(filename);
      else if (filename.endsWith('.js'))
        visit(
          espree.parse(fs.readFileSync(filename, 'utf8'), {
            ecmaVersion: 'latest',
            sourceType: 'module',
          }),
        );
    }
  }
  inspect(fileURLToPath(new URL('../src/ui/', import.meta.url)));
  assert.deepEqual([...missing].sort(), []);
});

test('translation lookup preserves language selection and readable fallback behavior', () => {
  assert.equal(translate('ua', 'newProject'), strings.ua.newProject);
  assert.notEqual(translate('ua', 'newProject'), strings.en.newProject);
  assert.equal(
    translate('unknown-language', 'newProject'),
    strings.en.newProject,
  );
  assert.equal(translate('en', 'unknown-key'), 'unknown-key');
  assert.equal(translate('ua', 'unknown-key'), 'unknown-key');
  for (const key of ['toString', 'constructor', '__proto__']) {
    assert.equal(translate('en', key), key);
    assert.equal(translate('ua', key), key);
    assert.equal(translate('__proto__', key), key);
  }
});
