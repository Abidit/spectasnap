import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
