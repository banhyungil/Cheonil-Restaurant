<script setup lang="ts">
import { today } from '@/utils/common'

// 매장
// 제품
// 카테고리리
interface Props {
    expenses: ExpenseEntity[]
    uExpense?: ExpenseEntity
}
const props = defineProps<Props>()
const cIsUpdate = computed(() => !!props.uExpense)
const expense = ref({} as ExpenseEntity)

watch(
    () => props.uExpense,
    () => {
        if (props.uExpense) expense.value = props.uExpense
    }
)

const emit = defineEmits<{
    create: [expense: ExpenseEntity]
    update: [expense: ExpenseEntity]
    cancel: []
}>()

const expenseAt = ref<Date>()

function onSave() {
    if (cIsUpdate.value) emit('create', expense.value)
    else emit('update', expense.value)
}
</script>
<template>
    <section class="expense-edit">
        <section class="top"></section>
        <section class="body tw-flex">
            <div class="row">
                <label>지출일자</label>
                <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
                </VueDatePicker>
            </div>
            <div class="row">
                <label>카테고리</label>
            </div>
            <div class="row">
                <label>지출명</label>
                <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
                </VueDatePicker>
            </div>
            <div class="row">
                <label>금액</label>
                <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
                </VueDatePicker>
            </div>
        </section>
        <section class="footer tw-flex tw-justify-end">
            <button @click="onSave">{{ cIsUpdate ? '수정' : '저장' }}</button>
            <button @click="() => $emit('cancel')">취소</button>
        </section>
    </section>
</template>

<style lang="scss" scoped>
.expense-edit {
}
</style>
