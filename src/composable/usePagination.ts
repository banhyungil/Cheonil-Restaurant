import type { Ref } from 'vue'

export default function usePagination(totalCnt: Ref<number>) {
  const PAGE_SIZE_LIST = [10, 25, 35, 50, 1000]
  const PAGE_GRP_SIZE = 5
  const pageSize = ref(PAGE_SIZE_LIST[0])
  const pageNo = ref(1)
  const cTotalPage = computed(() => {
    return Math.ceil(totalCnt.value / pageSize.value)
  })

  watch(
    () => cTotalPage.value,
    () => {
      if (pageNo.value > cTotalPage.value) {
        pageNo.value = cTotalPage.value
      }
    }
  )

  const cOffset = computed(() => {
    const result = (pageNo.value - 1) * pageSize.value
    return result < 0 ? 0 : result
  })
  return { pageSize, pageNo, cOffset, cTotalPage, PAGE_GRP_SIZE, PAGE_SIZE_LIST }
}
