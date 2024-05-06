import type { StoreCategoryEntity, StoreEntity } from './../@types/Database'
import type { StoreCategoryEntityC } from '@/@types/cheonil'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useStoreStore = defineStore('store-ctg', () => {
  const items = ref<StoreEntity[]>([])
  const categories = ref<StoreCategoryEntity[]>([])

  return { items, categories }
})
