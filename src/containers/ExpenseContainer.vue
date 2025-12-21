<script setup lang="ts">
import _ from 'lodash'
interface Props {
    type: 'LIST' | 'EDIT'
    seq?: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
    cancel: []
    toEditView: [seq?: number]
    create: []
    update: []
}>()

const Swal = useSwal()
const apiExpense = useApiExpense()
const apiExpenseCategory = useApiExpenseCategory()
const expenses = ref<ExpenseEntity[]>([])
const uExpense = ref<ExpenseEntity>()
const expenseCategories = ref<ExpenseCategoryEntity[]>([])

watch(
    () => props.seq,
    async () => {
        if (props.seq) uExpense.value = await apiExpense.select(props.seq)
    }
)

apiExpense.selectList().then((res) => {
    expenses.value = res
})
apiExpenseCategory.selectList().then((res) => {
    expenseCategories.value = res
})

async function onCreate(expense: ExpenseEntity) {
    if ((await Swal.fireCustom({ isConfirm: true, messageType: 'save' })) == false) return

    await apiExpense.create(expense)

    Swal.fireCustom()
}

async function onUpdate(expense: ExpenseEntity) {
    await apiExpense.update(expense)
}

async function onRemove(seq: number) {
    await apiExpense.remove(seq)
}

async function onCreateExpenseCategory(expenseCategory: ExpenseCategoryEntity) {
    const nItem = await apiExpenseCategory.create(expenseCategory)
    expenseCategories.value.push(nItem)
}
async function onUpdateExpenseCategory(expenseCategory: ExpenseCategoryEntity) {
    const uItem = await apiExpenseCategory.update(expenseCategory)
    const tgt = expenseCategories.value.find((ec) => ec.seq == uItem.seq)
    if (tgt) Object.assign(tgt, uItem)
}
async function onRemoveExpenseCategory(seq: number) {
    await apiExpenseCategory.remove(seq)
    _.remove(expenseCategories.value, (ec) => ec.seq == seq)
}
</script>

<template>
    <section class="expense-container flex h-full flex-1 flex-col">
        <ExpenseList
            v-if="type == 'LIST'"
            :expenses="expenses"
            @create="() => $emit('toEditView')"
            @update="(seq) => $emit('toEditView', seq)"
            @remove="onRemove"
        ></ExpenseList>
        <ExpenseEdit
            v-else-if="type == 'EDIT'"
            :expenses="expenses"
            :expenseCategories="expenseCategories"
            :uExpense="uExpense"
            @create="onCreate"
            @update="onUpdate"
            @cancel="$emit('cancel')"
            @createExpenseCategory="onCreateExpenseCategory"
            @updateExpenseCategory="onUpdateExpenseCategory"
            @removeExpenseCategory="onRemoveExpenseCategory"
        />
    </section>
</template>

<style lang="scss" scoped>
.expense-container {
    //
}
</style>
