<script setup lang="ts">
import type { BTableColInfo } from '@/components/base/BTable.vue'

const apiExpense = useApiExpense()
const items = ref<ExpenseEntity[]>([])

apiExpense.selectList().then((res) => {
    items.value = res
})

const COL_INFOS = [
    { key: 'name', title: '이름', colSize: 'minmax(100px, 1fr)' },
    { key: 'latLng', title: '위경도', colSize: 'minmax(170px, max-content)' },
    { key: 'addrDetail', title: '주소', colSize: 'minmax(max-content, 1fr)' },
    { key: 'ctgCnt', title: '카테고리', colSize: 'minmax(100px, 1fr)' },
    { key: 'cameraCnt', title: '할당 카메라', colSize: 'minmax(160px, 1fr)' },
    { key: 'cmt', title: '비고', colSize: 'minmax(100px, max-content)' },
    { key: 'actions', title: 'ACTIONS', colSize: '80px' },
] as BTableColInfo[]
</script>

<template>
    <div class="account-view">
        <section class="top">
            <h2>지출내역</h2>
        </section>
        <section>
            <BTablePaging :items="items" itemKey="seq" :colInfos="COL_INFOS"></BTablePaging>
        </section>
    </div>
</template>

<style lang="scss" scoped>
.account-view {
    display: flex;
    height: 100%;
}
</style>
