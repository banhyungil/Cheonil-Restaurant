<script setup lang="ts">
import type { BTableColInfo } from '@/components/base/BTable.vue'
import { today } from '@/utils/CommonUtils'
import { addDays, addMonths } from 'date-fns'

const router = useRouter()
const apiExpense = useApiExpense()
const items = ref<ExpenseEntity[]>([])

apiExpense.selectList().then((res) => {
    items.value = res
})

const COL_INFOS = [
    { key: 'cateogry', title: '카테고리', colSize: 'minmax(100px, max-content)' },
    { key: 'name', title: '지출명', colSize: 'minmax(100px, 1fr)' },
    { key: 'store', title: '매장명', colSize: 'minmax(max-content, 1fr)' },
    { key: 'admouont', title: '금액', colSize: 'minmax(100px, 1fr)' },
    { key: 'expenseAt', title: '지출일자', colSize: 'minmax(160px, 1fr)' },
    { key: 'cmt', title: '지출목록', colSize: 'minmax(100px, max-content)' },
    { key: 'actions', title: 'ACTIONS', colSize: '100px' },
] as BTableColInfo[]

const expenseAtRange = ref<Date[]>([])
const isEdit = ref(false)

function addExpense() {
    router.push('/expenseEdit')
}

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
</script>

<template>
    <section class="account-view">
        <section class="top tw-flex tw-justify-between">
            <section class="left">
                <div class="form-item">
                    <label>지출일자</label>
                    <VueDatePicker
                        v-model="expenseAtRange"
                        range
                        :format="'yy.MM.dd'"
                        text-input
                        teleport
                        :max-date="today()"
                        :enable-time-picker="false"
                        auto-apply
                        locale="ko-KR"
                    >
                        <template #action-extra>
                            <div class="justify-center tw-flex tw-gap-1">
                                <button class="chi primary tw-w-8" @click="onAddDay(-1)">
                                    <font-awesome-icon :icon="['fas', 'minus']" />
                                </button>
                                <button class="chi primary" @click="onClickToday()">당일</button>
                                <button class="chi primary" @click="onClickThisMonth()">당월</button>
                                <button class="chi primary tw-w-8" @click="onAddDay(1)" :disabled="expenseAtRange[1] >= today()">
                                    <font-awesome-icon :icon="['fas', 'plus']" />
                                </button>
                            </div>
                        </template>
                    </VueDatePicker>
                </div>
            </section>
            <section class="right">
                <v-btn v-if="isEdit" @click="addExpense"> 추가 </v-btn>
                <v-btn @click="() => (isEdit = !isEdit)" :color="isEdit ? 'primary' : ''" v-tooltip="'편집'">
                    <font-awesome-icon :icon="['fas', 'pen']" />
                </v-btn>
            </section>
        </section>
        <section class="body">
            <BTablePaging :items="items" itemKey="seq" :colInfos="COL_INFOS" :showNo="true"> </BTablePaging>
        </section>
    </section>
</template>

<style lang="scss" scoped>
.account-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
