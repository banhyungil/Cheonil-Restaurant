import { watchOnce } from '@vueuse/core'

export default function useSetting() {
    const settingStore = useSettingStore()
    const storeStore = useStoreStore()
    const menuSTore = useMenuStore()

    watch(
        () => settingStore.setting?.config?.storeCtgOrders,
        () => {
            if (settingStore.setting?.config?.storeCtgOrders == null) {
                if (settingStore.setting?.config == null) return

                settingStore.setting.config.storeCtgOrders = storeStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))
            } else {
                storeStore.orderCtgs()
            }
        },
        { immediate: true, deep: true }
    )
    // settingStore.setting.config.storeCtgOrders
    // 매장, 설정 두개의 비동기가 엮인 문제.
    // 두개의 비동기 데이터의 데이터 변경시에 작업이 발생해야함.
    // 최초 설정이 변경되는 시점
}
