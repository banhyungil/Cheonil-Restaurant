<script setup lang="ts">
import type { BTableColInfo } from '@/components/base/BTable.vue'

const apiExpense = useApiExpense()
// btable을 이용하기 위해선
// 컬럼 메타정보를 설정하고 조회할 리스트와 키정보가 필요하다.
const COL_INFOS = [
    { key: 'ctgNm', title: '카테고리', colSize: 'minmax(100px, max-content)' },
    { key: 'name', title: '지출명', colSize: 'minmax(max-content, 200px)' },
    { key: 'amount', title: '금액', colSize: 'minmax(80px, 1fr)' },
    { key: 'expenseAt', title: '지출일자', colSize: 'minmax(max-content, 1fr)' },
    { key: 'storeNm', title: '매장', colSize: 'minmax(110px, 1fr)' },
    { key: 'expensePrds', title: '지출목록', colSize: 'minmax(110px, 1fr)' },
    { key: 'cmt', title: '비고', colSize: 'minmax(max-content, 200px)' },
] as BTableColInfo[]
const expenses = ref<ExpenseExt[]>([])

apiExpense.selectList().then((res) => {
    expenses.value = res
})
</script>

<template>
    <div class="account-view">
        <section class="top">
            <h2>지출내역</h2>
            <div>
                <span>전체</span>
                <input type="text" />
            </div>
        </section>
        <section class="body">
            <BTablePaging :items="expenses" item-key="seq" :col-infos="COL_INFOS"></BTablePaging>
        </section>
    </div>
</template>

<style lang="scss" scoped>
.account-view {
    display: flex;
    height: 100%;
}
</style>
