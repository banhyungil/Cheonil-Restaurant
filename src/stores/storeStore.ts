import { defineStore } from 'pinia'
import { ref } from 'vue'
import _ from 'lodash'

export const useStoreStore = defineStore('store-ctg', () => {
  const settingStore = useSettingStore()

  const items = ref<StoreEntity[]>([])
  const categories = ref<StoreCategoryEntity[]>([])

  function order(ctgs: StoreCategoryEntity[]) {
    if (settingStore.setting?.config?.storeCtgOrders == null) return ctgs
    // 설정 순서에 맞게 추출
    const orderCtgs = settingStore.setting.config.storeCtgOrders
      .filter((ctgOd) => ctgs.find((ctg) => ctg.seq == ctgOd.seq))
      .map((ctgOd) => ctgs.find((ctg) => ctg.seq == ctgOd.seq)!)

    return _.unionBy(orderCtgs, ctgs, 'seq')
  }

  return { items, categories, order }
})
