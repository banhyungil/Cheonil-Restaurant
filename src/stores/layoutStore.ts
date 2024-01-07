import AdminLayout from '@/layout/AdminLayout.vue'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import { defineStore } from 'pinia'
import { ref } from 'vue'

type Layout = 'default' | 'admin'
export const useLayoutStore = defineStore('layout', () => {
  const layout = ref<Layout>('default')

  const set = (lo: Layout) => {
    layout.value = lo
  }

  const getComp = () => {
    switch (layout.value) {
      case 'default':
        return DefaultLayout
      case 'admin':
        return AdminLayout
    }
  }

  return { set, getComp }
})
