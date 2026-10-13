import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['scripts/templates/*.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ['src/**/*.js', 'public/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser, __STANDALONE__: 'readonly' },
    },
    rules: {
      'no-control-regex': 'off',
      'no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.js', '*.js'],
    languageOptions: { globals: globals.node },
  },
];
