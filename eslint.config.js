/*
 * Copyright 2026 ADM Media Consulting SA
 * SPDX-License-Identifier: Apache-2.0
 */
import js from '@eslint/js';
import eslintReact from '@eslint-react/eslint-plugin';
import { defineConfig } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// The React rules come from two plugins: eslint-plugin-react-hooks (the React
// team's rules of hooks and React Compiler checks) and @eslint-react
// (everything else). @eslint-react ships its own copy of the hook rules; they
// are turned off here so each problem is reported once, by
// eslint-plugin-react-hooks.
const hookRulesOwnedByReactHooks = Object.fromEntries(
  [
    'error-boundaries',
    'exhaustive-deps',
    'purity',
    'rules-of-hooks',
    'set-state-in-effect',
    'set-state-in-render',
    'static-components',
    'unsupported-syntax',
    'use-memo',
  ].map((rule) => [`@eslint-react/${rule}`, 'off'])
);

export default defineConfig([
  { ignores: ['dist/', 'coverage/', 'examples/', 'node_modules/'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      eslintReact.configs['recommended-type-checked'],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...hookRulesOwnedByReactHooks,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Unit tests hand-build a double of the EvePlayer instance (fake emitter,
    // stubbed setSource/dispose/…), which is `any` by nature: the type-checked
    // `no-unsafe-*` family is pure noise there. `tsc --noEmit` still
    // type-checks these files.
    files: ['src/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
]);
