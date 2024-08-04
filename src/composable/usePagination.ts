import type { Ref } from 'vue'

export default function usePagination<T>(items: Ref<T[]>) {
  const PAGE_SIZE_LIST = [10, 25, 35, 50]
  const PAGE_GRP_SIZE = 5
  const pageSize = ref(PAGE_SIZE_LIST[0])
  const pageNo = ref(1)
  const cTotalPage = computed(() => Math.ceil(items.value.length / pageSize.value))

  const cOffset = computed(() => (pageNo.value - 1) * pageSize.value)
  return { pageSize, pageNo, cOffset, cTotalPage, PAGE_GRP_SIZE, PAGE_SIZE_LIST }
}
