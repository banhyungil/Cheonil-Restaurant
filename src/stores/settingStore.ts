import { defineStore } from 'pinia'

export const useSettingStore = defineStore('setting', () => {
  const setting = ref() as Ref<SettingEntity>

  return { setting }
})
