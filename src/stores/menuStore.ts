import type { MenuCategoryEntity, MenuEntity } from '@/@types/Database'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import _ from 'lodash'

export const useMenuStore = defineStore('menu-store', () => {
  const items = ref<MenuEntity[]>([])
  const dict = computed(() => _.keyBy(items.value, 'id'))
  const categories = ref<MenuCategoryEntity[]>([])

  return { items, dict, categories }
})
