import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreStore = defineStore('store-ctg', () => {
  const items = ref<StoreEntity[]>([])
  const categories = ref<StoreCategoryEntity[]>([])

  return { items, categories }
})
