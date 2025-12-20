import { defineStore } from 'pinia'
import { orderWithList } from '@/utils/common'

export const useSettingStore = defineStore(
    'setting',
    () => {
        const setting = ref() as Ref<SettingEntity>

        function assertion(setting: SettingEntity | null): asserts setting is SettingEntity {
            if (setting == null) throw Error('not possible')
        }

        function orderStoreCtgs(storeCtgs: StoreCategoryEntity[]) {
            if (setting.value.config?.storeCtgOrders == null) setting.value.config.storeCtgOrders = []

            return orderWithList(setting.value.config.storeCtgOrders, storeCtgs, 'seq')
        }

        function orderMenuCtgs(storeCtgs: StoreCategoryEntity[]) {
            if (setting.value.config?.menuCtgOrders == null) setting.value.config.menuCtgOrders = []

            return orderWithList(setting.value.config.menuCtgOrders, storeCtgs, 'seq')
        }

        return { setting, assertion, orderStoreCtgs, orderMenuCtgs }
    },
    {
        persist: {
            pick: ['setting'],
        },
    }
)
