import { watchArray } from '@vueuse/core'

interface Options<T extends object, K extends keyof T, DictVal> {
    items: Ref<T[]>
    itemKey: K
    // initFn이 없으면 null로 초기화
    dict?: Ref<Record<any, DictVal>>
    initFn?: (item: T) => DictVal
    onAdded?: (items: T[K][]) => any
    onRemoved?: (items: T[K][]) => any
}
export default function useDictionary<T extends object, K extends keyof T, DictVal>(options: Options<T, K, DictVal>) {
    const { items, itemKey, dict = ref<Record<any, DictVal>>({}), initFn = () => null, onAdded = () => {}, onRemoved = () => {} } = options

    watchArray(
        () => items.value.map((item) => item[itemKey]),
        (_, __, adds, dels) => {
            adds.forEach((keyVal) => {
                const item = items.value.find((item) => item[itemKey] == keyVal)
                if (item) {
                    const result = initFn(item)

                    if (result && typeof result == 'object') {
                        dict.value[keyVal as any] = Object.assign(result, dict.value[keyVal as any])
                    } else {
                        dict.value[keyVal as any] = result as any
                    }
                }
            })

            dels?.forEach((keyVal) => {
                if ((keyVal as any) in dict.value) delete dict.value[keyVal]
            })

            if (adds.length > 0) onAdded(adds)
            if (dels && dels.length > 0) onRemoved(dels)
        },
        { immediate: true }
    )

    return { dict }
}
