import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import _ from 'lodash'

export const useMenuStore = defineStore('menu', () => {
  const settingStore = useSettingStore()

  const items = ref<MenuEntity[]>([])
  const dict = computed(() => _.keyBy(items.value, 'seq'))
  const categories = ref<MenuCategoryEntity[]>([])

  function order(ctgs: MenuCategoryEntity[]) {
    if (settingStore.setting?.config?.menuCtgOrders == null) return ctgs
    // 설정 순서에 맞게 추출
    const orderCtgs = settingStore.setting.config.menuCtgOrders
      .filter((ctgOd) => ctgs.find((ctg) => ctg.seq == ctgOd.seq))
      .map((ctgOd) => ctgs.find((ctg) => ctg.seq == ctgOd.seq)!)

    return _.unionBy(orderCtgs, ctgs, 'seq')
  }

  return { items, dict, categories, order }
})
