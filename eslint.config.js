import js from '@eslint/js';
import configPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  configPrettier,

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,
    },
  },

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier,
    },

    rules: {
      'prettier/prettier': 'warn',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'warn',

      eqeqeq: 'error',
      curly: 'error',

      'no-console': 'off',
    },
  },
];
