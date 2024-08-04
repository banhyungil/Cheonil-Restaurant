import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import _ from 'lodash'

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuEntity[]>([])
  const dict = computed(() => _.keyBy(items.value, 'name'))
  const categories = ref<MenuCategoryEntity[]>([])

  return { items, dict, categories }
})
