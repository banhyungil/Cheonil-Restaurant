import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderWithList } from '@/utils/CommonUtils'

export const useStoreStore = defineStore('store-ctg', () => {
  const settingStore = useSettingStore()

  const items = ref<StoreEntity[]>([])
  const categories = ref<StoreCategoryEntity[]>([])

  function orderCtgs() {
    categories.value = orderWithList(settingStore.setting.config.storeCtgOrders, categories.value, 'seq')
  }

  return { items, categories, orderCtgs }
})
