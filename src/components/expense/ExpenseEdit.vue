<script setup lang="ts">
import { today } from '@/utils/common'

// 매장
// 제품
// 카테고리리
interface Props {
    expenses: ExpenseEntity[]
    uExpense?: ExpenseEntity
    expenseCategories: ExpenseCategoryEntity[]
}
const props = defineProps<Props>()
const cIsUpdate = computed(() => !!props.uExpense)
const expense = ref({} as ExpenseEntity)
const isShowModal = ref(false)

watch(
    () => props.uExpense,
    () => {
        if (props.uExpense) expense.value = props.uExpense
    }
)

const emit = defineEmits<{
    create: [expense: ExpenseEntity]
    update: [expense: ExpenseEntity]
    createExpenseCategory: [expenseCategory: ExpenseCategoryEntity]
    updateExpenseCategory: [expenseCategory: ExpenseCategoryEntity]
    removeExpenseCategory: [seq: number]
    cancel: []
}>()

const expenseAt = ref<Date>()

function onSave() {
    if (cIsUpdate.value) emit('create', expense.value)
    else emit('update', expense.value)
}

function onCreateExpenseCategory(expenseCategory: ExpenseCategoryEntity) {
    emit('createExpenseCategory', expenseCategory)
}
function onUpdateExpenseCategory(expenseCategory: ExpenseCategoryEntity) {
    emit('updateExpenseCategory', expenseCategory)
}
function onRemoveExpenseCategory(seq: number) {
    emit('removeExpenseCategory', seq)
}
</script>
<template>
    <section class="expense-edit">
        <section class="top"></section>
        <section class="body tw-flex tw-flex-col">
            <div class="row">
                <label>지출일자</label>
                <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
                </VueDatePicker>
            </div>
            <div class="row">
                <label>카테고리</label>
                <VSelect :items="expenseCategories" item-title="name" item-value="seq" v-model="expense.ctgSeq" density="compact" :hide-details="true">
                    <template v-slot:append-item>
                        <VBtn @click="() => (isShowModal = true)" color="primary" class="tw-w-full"
                            ><span class="tw-mr-2">추가</span><font-awesome-icon :icon="['fas', 'plus']"
                        /></VBtn>
                        <VDivider class="test tw-mt-2 tw-h-4" style="border: 2px solid black"></VDivider>
                    </template>
                </VSelect>
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
        <ExpenseCategoryModal
            v-if="isShowModal"
            :expense-categories="expenseCategories"
            :onCreate="onCreateExpenseCategory"
            :onUpdate="onUpdateExpenseCategory"
            :onRemove="onRemoveExpenseCategory"
            :onCancel="() => (isShowModal = !isShowModal)"
        >
        </ExpenseCategoryModal>
    </section>
</template>

<style lang="scss" scoped>
.expense-edit {
}
</style>
