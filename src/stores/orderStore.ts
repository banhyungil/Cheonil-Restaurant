import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useOrderStore = defineStore('order', () => {
  const orders = ref([] as Order[])

  return { orders }
})
