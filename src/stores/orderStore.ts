import type { OrderResult } from '@/api/useApiOrder'
import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useOrderStore = defineStore('order', () => {
  const orders = ref([] as OrderResult[])

  return { orders }
})
