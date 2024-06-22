import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlaceCtgStore = defineStore('place-ctg', () => {
  const items = ref<PlaceCategoryEntity[]>([])

  return { items }
})
