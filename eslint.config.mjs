import globals from 'globals'
import js from '@eslint/js'

const config = [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.mocha }
    },
    ignores: ['tmp/**', 'coverage/**'],
    rules: {
      ...js.configs.recommended.rules
    }
  }
]

export default config

// console.dir(config, {depth: 5})