import AdminLayout from '@/layouts/AdminLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type Layout = 'default' | 'admin'
export const useLayoutStore = defineStore('layout', () => {
    const layout = ref<Layout>('default')

    const set = (lo: Layout) => {
        layout.value = lo
    }

    const cLayoutComp = computed(() => {
        switch (layout.value) {
            case 'default':
                return DefaultLayout
            case 'admin':
                return AdminLayout
            default:
                return DefaultLayout
        }
    })

    return { set, cLayoutComp }
})
