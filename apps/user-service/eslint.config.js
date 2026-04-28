import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: './tsconfig.json',
            },
        },
    },

    prettier,

    {
        ignores: ['dist/', 'node_modules/', 'eslint.config.js', 'tests/'],
    },
]
