const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'src/frontend/src/data/**',
            'src/frontend/public/**',
            'src/frontend/node_modules/**',
            'src/backend/node_modules/**',
            'src/navigation-service/node_modules/**',
        ], // add your files here if prettier is breaking them!
    },
    {
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            ...eslintConfigPrettier.rules,
            'prettier/prettier': 'error', // Enable Prettier integration
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
];
