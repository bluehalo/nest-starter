module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import'
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 'tab'],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/order': ['error', {
      'pathGroups': [{
        'pattern': '@nestjs',
        'group': 'builtin',
        'position': 'after'
      }, {
        'pattern': '\\.\\..*/common',
        'group': 'internal',
        'position': 'after'
      }, {
        'pattern': '\\.\\..*/common',
        'group': 'internal',
        'position': 'after'
      }, {
        'pattern': '\\.\\..*/common',
        'group': 'internal',
        'position': 'after'
      }],
      'newlines-between': 'always'
    }]
  }
};
