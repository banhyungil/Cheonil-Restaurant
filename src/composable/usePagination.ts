import type { ModelRef, Ref } from 'vue'

export const PAGE_SIZE_LIST = [10, 30, 50, 100, 200, null]
export default function usePagination(totalCnt: Ref<number>, pageSize: Ref<number | null> | ModelRef<number | null>) {
    const PAGE_GRP_SIZE = 5
    const pageNo = ref(1)
    const cTotalPage = computed(() => {
        if (pageSize.value == null || pageSize.value < 1) return 0
        else return Math.ceil(totalCnt.value / pageSize.value)
    })

    watch(
        () => cTotalPage.value,
        () => {
            if (pageNo.value > cTotalPage.value) {
                pageNo.value = cTotalPage.value == 0 ? 1 : cTotalPage.value
            }
        }
    )

    const cOffset = computed(() => {
        if (pageSize.value == null || pageSize.value < 1) return 0
        else return (pageNo.value - 1) * pageSize.value
    })
    return { pageNo, cOffset, cTotalPage, PAGE_GRP_SIZE, PAGE_SIZE_LIST }
}
