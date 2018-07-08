module.exports = {
    "extends": "google",
    "parserOptions": {
          "ecmaVersion": 7,
          "sourceType": "module",
          "ecmaFeatures": {
              "jsx": true,
          }
      },
      env: {
          'es6': true,
          'jasmine': true
      },
      rules: {
        "new-cap": [2, {
          "capIsNewExceptions": ["SwaggerUi"]
        }],
          "switch-colon-spacing": 0,
          // need to keep as it's known issue with a dependency of airbnb standards
          "arrow-parens": 0,
          'jsx-a11y/href-no-hash': 0,
          'camelcase': 0,    // allowing underscore case
          'semi': 0,    // allowing lines with or without semi colon at the end
          'arrow-body-style': ['error', 'always'],    // because we return BIG BIG promises
          'no-shadow': ['error', { 'builtinGlobals': true, 'hoist': 'all' }],
          'no-param-reassign': 0,
          'no-unused-vars': 'error',
          'no-use-before-define': 0,
          'radix': ['error', 'as-needed'],
          'max-len': ['error', { 'ignoreComments': true, 'ignoreTemplateLiterals': true, 'ignoreUrls': true }],
          'require-jsdoc': ['error', {
              'require': {
                  'FunctionDeclaration': true,
                  'MethodDefinition': true,
                  'ClassDeclaration': true,
                  'ArrowFunctionExpression': true
              }
          }],
          'valid-jsdoc': 2,
          'comma-dangle': ['error', 'never'],

          'one-var': 0,
          'one-var-declaration-per-line': 0,
          // disable linebreak-style check so that ESLint won't give WinOS trouble
          'linebreak-style': 0,
          'global-require': 0
      }
};
