// ESLint 10 flat config for @trident/ui itself.
// The consumer convention (no-restricted-imports on money/auth/legal/admin directories) is in
// docs/ESLINT.md and exported for reuse as "@trident/ui/eslint" (eslint/restricted-surfaces.js);
// test/eslint-convention.test.ts proves it fires.
import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'fonts/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,js,mjs}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // Groups re-exported from the package root must never pull optional peers or server code.
    files: ['src/{a11y,layout,type,actions,forms,display,feedback,utils}/**/*.{ts,tsx}', 'src/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { regex: '^(three|@react-three/.*|motion(/.*)?|@radix-ui/.*|cmdk|sonner)$', message: 'Optional peers belong in the /three, /motion or /app subpath entries only (spec §1).' },
            { regex: '^react-dom/server', message: 'Server rendering belongs in src/server (the /server entry).' },
            { regex: '^\\.\\./(server|islands|motion-lite|motion|app|three)(/|$)', message: 'Root-entry groups must not import subpath-entry groups.' },
          ],
        },
      ],
    },
  },
  {
    files: ['test/**', '**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-non-null-assertion': 'off' },
  },
)
