<script setup lang="ts">
import type { ExpenseExt } from '@/api/useApiExpense'
import type { BTableColInfo } from '@/base-components/BTable.vue'
import { today } from '@/utils/common'
import { SwalExt } from '@/utils/swalExt'
import { addDays, addMonths, formatDate } from 'date-fns'
import _ from 'lodash'

//ANCHOR - Hooks
onBeforeMount(async () => {
    const [expensesRes, categoriesRes, storesRes] = await Promise.all([
        apiExpense.selectList({ expand: 'expsPrds' }),
        apiExpenseCategory.selectList(),
        apiStore.selectList(),
    ])

    expenses.value = expensesRes as RequiredK<ExpenseExt, 'expsPrds'>[]
    expenseCategories.value = categoriesRes
    stores.value = storesRes
})

//ANCHOR - Composables
const router = useRouter()
const apiExpense = useApiExpense()
const apiExpenseCategory = useApiExpenseCategory()
const apiStore = useApiStore()

const expenses = ref<RequiredK<ExpenseExt, 'expsPrds'>[]>([])
const expenseCategories = ref<ExpenseCategoryEntity[]>([])
const stores = ref<StoreEntity[]>([])

//ANCHOR - Start
function toEditView(seq?: number) {
    const path = seq ? `/${seq}` : ''
    router.push(`/expenseEdit${path}`)
}

const COL_INFOS = [
    { key: 'cateogry', title: '카테고리', colSize: 'minmax(100px, max-content)' },
    { key: 'name', title: '지출명', colSize: 'minmax(100px, 1fr)' },
    { key: 'storeName', title: '매장명', colSize: 'minmax(max-content, 1fr)' },
    { key: 'amount', title: '금액', colSize: 'minmax(100px, 1fr)' },
    { key: 'expenseAt', title: '지출일자', colSize: 'minmax(160px, 1fr)' },
    { key: 'productNms', title: '지출목록', colSize: 'minmax(max-content, 160px)' },
    { key: 'actions', title: 'ACTIONS', colSize: '100px' },
] as BTableColInfo<any>[]

const expenseAtRange = ref<Date[]>([])
const isEdit = ref(false)

// stores를 dictionary로 변환
const dStores = computed(() => _.keyBy(stores.value, 'seq'))
const dCategories = computed(() => _.keyBy(expenseCategories.value, 'seq'))

// expenses에 매장명 추가
const cExpensesWithStore = computed(() => {
    return expenses.value.map((expense) => ({
        ...expense,
        amount: expense.amount.toLocaleString(),
        cateogry: dCategories.value[expense.ctgSeq]?.path ?? '',
        expenseAt: formatDate(expense.expenseAt, 'yyyy-MM-dd HH:mm'),
        storeName: dStores.value[expense.storeSeq]?.name ?? '-',
        productNms: expense.expsPrds.map((ep) => ep.product.prdInfo.name).join(', '),
    }))
})

function onClickToday() {
    const range = [today(), today()]

    expenseAtRange.value = range
}

function onAddDay(add: number) {
    expenseAtRange.value = expenseAtRange.value.map((day) => addDays(day, add))
}

function onClickThisMonth() {
    const range = (() => {
        const st = today()
        st.setDate(1)
        const end = addMonths(today(), 1)
        end.setDate(1)
        return [st, addDays(end, -1)]
    })()

    expenseAtRange.value = range
}

async function onRemove(seq: number) {
    if ((await SwalExt.confirm({ messageType: 'remove' })) == false) return

    await apiExpense.remove(seq)
    _.remove(expenses.value, (exp) => exp.seq == seq)
    SwalExt.fireCustom({ toast: true, messageType: 'remove' })
}
</script>

<template>
    <section class="expense-list flex h-full w-full flex-col gap-4">
        <section class="top flex w-full justify-between">
            <section class="left">
                <div class="form-item flex flex-col">
                    <div class="row flex w-full items-center gap-2">
                        <label for="dp-input-expenseAtRange">지출일자</label>
                        <BDatePicker
                            v-model="expenseAtRange"
                            range
                            text-input
                            teleport
                            :max-date="today()"
                            :enable-time-picker="false"
                            auto-apply
                            uid="expenseAtRange"
                            class="max-w-72"
                        >
                            <template #action-extra>
                                <div class="flex justify-center gap-1">
                                    <button class="chi primary w-8" @click="onAddDay(-1)">
                                        <font-awesome-icon :icon="['fas', 'minus']" />
                                    </button>
                                    <button class="chi primary" @click="onClickToday()">당일</button>
                                    <button class="chi primary" @click="onClickThisMonth()">당월</button>
                                    <button class="chi primary w-8" @click="onAddDay(1)" :disabled="expenseAtRange[1] >= today()">
                                        <font-awesome-icon :icon="['fas', 'plus']" />
                                    </button>
                                </div>
                            </template>
                        </BDatePicker>
                    </div>
                    <div class="row flex flex-1 items-center gap-2">
                        <BInput label="매장명" :show-search-icon="true"></BInput>
                        <BInput label="지출명" :show-search-icon="true"></BInput>
                        <BButton class="chi danger small ml-2 text-sm" @click="expenseAtRange = []">
                            <sapn>검색</sapn>
                            <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="ml-2" />
                        </BButton>
                    </div>
                </div>
            </section>
            <section class="right">
                <v-btn v-if="isEdit" @click="toEditView"> 추가 </v-btn>
                <v-btn @click="() => (isEdit = !isEdit)" :color="isEdit ? 'primary' : ''" v-tooltip="'편집'">
                    <font-awesome-icon :icon="['fas', 'pen']" />
                </v-btn>
            </section>
        </section>
        <BDivider />
        <section class="body w-full flex-1">
            <BTablePaging :items="cExpensesWithStore" itemKey="seq" :colInfos="COL_INFOS" :showNo="true">
                <template #productNms="{ item }">
                    <span class="text-ellipsis text-nowrap" :title="item.productNms">{{ item.productNms }}</span>
                </template>
                <template #actions="{ item }">
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <button @click="() => toEditView(item.seq)" style="color: rgb(var(--color-success))" v-tooltip="'수정'">
                            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                        </button>
                        <button @click="onRemove(item.seq)" style="color: rgb(var(--color-danger))" v-tooltip="'삭제'">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
            </BTablePaging>
        </section>
    </section>
</template>

<style lang="scss" scoped>
.expense-list {
    :deep(.btable-paging) {
        @apply h-full;

        .body {
            @apply h-full;
            overflow-y: auto;
            grid-auto-rows: minmax(50px, 10%); // 모든 행에 적용
        }
    }
}
</style>
