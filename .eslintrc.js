module.exports = {
    env: {
        commonjs: true,
        es6: true,
        node: true
    },
    extends: 'eslint:recommended',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-unsafe-finally': 'off',
        'no-console': 'off'
    }
};
