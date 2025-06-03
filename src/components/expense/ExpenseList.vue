<script setup lang="ts">
import type { BTableColInfo } from '@/base-components/BTable.vue'
import { today } from '@/utils/common'
import { addDays, addMonths } from 'date-fns'

interface Props {
    expenses: ExpenseEntity[]
}
defineProps<Props>()
defineEmits<{
    create: []
    update: [seq: number]
    remove: [seq: number]
}>()

const COL_INFOS = [
    { key: 'cateogry', title: '카테고리', colSize: 'minmax(100px, max-content)' },
    { key: 'name', title: '지출명', colSize: 'minmax(100px, 1fr)' },
    { key: 'store', title: '매장명', colSize: 'minmax(max-content, 1fr)' },
    { key: 'amount', title: '금액', colSize: 'minmax(100px, 1fr)' },
    { key: 'expenseAt', title: '지출일자', colSize: 'minmax(160px, 1fr)' },
    { key: 'cmt', title: '지출목록', colSize: 'minmax(100px, max-content)' },
    { key: 'actions', title: 'ACTIONS', colSize: '100px' },
] as BTableColInfo<ExpenseEntity>[]

const expenseAtRange = ref<Date[]>([])
const isEdit = ref(false)

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
        <section class="top flex justify-between">
            <section class="left">
                <div class="form-item">
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
            </section>
            <section class="right">
                <v-btn v-if="isEdit" @click="() => $emit('create')"> 추가 </v-btn>
                <v-btn @click="() => (isEdit = !isEdit)" :color="isEdit ? 'primary' : ''" v-tooltip="'편집'">
                    <font-awesome-icon :icon="['fas', 'pen']" />
                </v-btn>
            </section>
        </section>
        <section class="body">
            <BTablePaging :items="expenses" itemKey="seq" :colInfos="COL_INFOS" :showNo="true">
                <template #actions="{ item }">
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <button @click="() => $emit('update', item.seq)" style="color: rgb(var(--color-success))" v-tooltip="'수정'">
                            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                        </button>
                        <button @click="() => $emit('remove', item.seq)" style="color: rgb(var(--color-danger))" v-tooltip="'삭제'">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
            </BTablePaging>
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
