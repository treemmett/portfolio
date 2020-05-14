module.exports = {
  extends: 'zyehex/react',
  overrides: [
    {
      extends: 'zyehex/cypress',
      files: 'test/**/*',
    },
  ],
  rules: {
    'import/no-unresolved': ['error', { ignore: ['rudget'] }],
    'react/jsx-curly-newline': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-props-no-spreading': 'off',
    '@typescript-eslint/unbound-method': 'off',
  },
};
