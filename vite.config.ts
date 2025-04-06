import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { Vuetify3Resolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            // global imports to register
            imports: [
                'vue',
                'vue-router',
                'pinia',
                {
                    uuid: ['v4', 'Uuid'],
                },
                {
                    '@vueuse/core': [
                        // named imports
                        'useElementHover', // import { useMouse } from '@vueuse/core',
                    ],
                },
                // example type import
                {
                    from: 'vue',
                    imports: ['Ref'],
                    type: true,
                },
            ],

            dirs: ['./src/stores', './src/composable', './src/api'],
            dts: true,
        }),
        Components({
            dts: true,
            resolvers: [
                Vuetify3Resolver(),
                (name) => {
                    // where `name` is always CapitalCase
                    if (name.includes('VueDatePicker')) return '@vuepic/vue-datepicker'
                    else if (name.includes('VSelectExt')) return 'vue-select'
                },
            ], // vuetify 컴포넌트 등록시 resolver 사용
            dirs: ['./src/components', './src/containers', './src/modals'],
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/api': 'http://127.0.0.1:8000',
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
            @import "@/scss/main.scss";
        `,
            },
        },
    },
})
