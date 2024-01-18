import type { ConfigEntity } from '@/@types/Database'
import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useConfigStore = defineStore('order', () => {
  const config = ref({} as ConfigEntity)
  return { config }
})
