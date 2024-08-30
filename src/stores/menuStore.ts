import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import _ from 'lodash'
import { orderWithList } from '@/utils/CommonUtils'

export const useMenuStore = defineStore('menu', () => {
  const settingStore = useSettingStore()

  const items = ref<MenuEntity[]>([])
  const dict = computed(() => _.keyBy(items.value, 'seq'))
  const categories = ref<MenuCategoryEntity[]>([])

  function orderCtgs() {
    categories.value = orderWithList(settingStore.setting.config.menuCtgOrders, categories.value, 'seq')
  }

  return { items, dict, categories, orderCtgs }
})
