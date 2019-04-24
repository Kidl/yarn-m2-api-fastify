module.exports = {
  'extends': [
    'airbnb-base',
    'plugin:node/recommended',
  ],
  'rules': {
    'no-use-before-define': ['error', { 'functions': false }],
    'no-underscore-dangle': ['error'],
    'no-mixed-operators': 1,
    'no-console': 0,
    'no-param-reassign': 0,
    'consistent-return': 0,
    'no-shadow': 0,
    'max-len': ['error', { 'code': 120 }],
    'node/exports-style': ['error', 'module.exports'],
    'node/no-unsupported-features/es-syntax': 0,

    // ?
    'no-plusplus': 0,
    'import/prefer-default-export': 0,
    'no-continue': 0,
    'no-prototype-builtins': 1,
    'no-restricted-syntax': 1,
    'no-restricted-globals': 1,
    'guard-for-in': 1,
    'no-await-in-loop': 1,
  },
};