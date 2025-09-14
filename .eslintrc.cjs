/* eslint-env node */
// 별도 pacakge 설치 없이 plugin 사용 가능
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    plugins: ['eslint-plugin-vue'],
    // prettier-ignore
    extends: [
        'plugin:vue/vue3-essential', 
        'eslint:recommended', 
        '@vue/eslint-config-typescript', 
        '@vue/eslint-config-prettier/skip-formatting', 
        'plugin:prettier/recommended', 
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-debugger': 'error',
        'vue/multi-word-component-names': 'warn',
    },
    parserOptions: {
        ecmaVersion: 'latest',
    },
    ignorePatterns: ['**/assets/data/*'],
}
