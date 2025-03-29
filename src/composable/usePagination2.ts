export default function usePagination2<T>(items?: Ref<T[]>) {
    const PAGE_SIZE_LIST = [10, 25, 35, 50]
    const PAGE_GRP_SIZE = 5
    const pageSize = ref(PAGE_SIZE_LIST[0])
    const pageNo = ref(1)
    const cTotalPage = computed(() => Math.ceil((items?.value.length ?? 0) / pageSize.value))

    watch(
        () => pageSize.value,
        () => {
            // 페이지 크기가 커질때 현재 페이지 번호가 총페이지 수를 넘기지 않도록 수정
            if (pageNo.value > cTotalPage.value) pageNo.value = cTotalPage.value
        }
    )
    const cSIdx = computed(() => (pageNo.value - 1) * pageSize.value)
    const cPgItems = computed(() => items?.value.slice(cSIdx.value, pageNo.value * pageSize.value))
    return { pageSize, pageNo, cSIdx, cTotalPage, PAGE_GRP_SIZE, PAGE_SIZE_LIST, cPgItems }
}
