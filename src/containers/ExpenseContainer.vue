<script setup lang="ts">
import type { ExpenseExt } from '@/api/useApiExpense'
import _ from 'lodash'
interface Props {
    type: 'LIST' | 'EDIT'
    seq?: number
}
//ANCHOR - Props
const props = defineProps<Props>()
const emit = defineEmits<{
    cancel: []
}>()

//ANCHOR - Hooks
onBeforeMount(async () => {
    apiExpense.selectList({ expand: 'expsPrds' }).then((res) => {
        expenses.value = res as RequiredK<ExpenseExt, 'expsPrds'>[]
    })
    apiExpenseCategory.selectList().then((res) => {
        expenseCategories.value = res
    })
    apiStore.selectList().then((res) => {
        stores.value = res
    })
})

//ANCHOR - Composable, Store

const Swal = useSwal()
const apiExpense = useApiExpense()
const apiExpenseCategory = useApiExpenseCategory()
const apiStore = useApiStore()

const expenses = ref<RequiredK<ExpenseExt, 'expsPrds'>[]>([])
const uExpense = ref<ExpenseEntity>()
const expenseCategories = ref<ExpenseCategoryEntity[]>([])
const stores = ref<StoreEntity[]>([])

watch(
    () => props.seq,
    async () => {
        if (props.seq) uExpense.value = await apiExpense.select(props.seq)
    }
)

async function onCreate(expense: ExpenseEntityCreation, expenseProducts: ExpenseProductEntityCreation[]) {
    await apiExpense.create(expense, expenseProducts)
}

async function onUpdate(expense: ExpenseEntity, expenseProducts: ExpenseProductEntityCreation[]) {
    await apiExpense.update(expense, expenseProducts)
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
    <section class="expense-container flex h-full w-full flex-1 flex-col">
        <ExpenseList v-if="type == 'LIST'" :expenses="expenses" :expenseCategories="expenseCategories" :stores="stores" @remove="onRemove"></ExpenseList>
        <ExpenseEdit
            v-else-if="type == 'EDIT'"
            :expenses="expenses"
            :expenseCategories="expenseCategories"
            :uExpense="uExpense"
            :stores="stores"
            :onCreate="onCreate"
            :onUpdate="onUpdate"
            :onCreateExpenseCategory="onCreateExpenseCategory"
            :onUpdateExpenseCategory="onUpdateExpenseCategory"
            :onRemoveExpenseCategory="onRemoveExpenseCategory"
            @cancel="$emit('cancel')"
        />
    </section>
</template>

<style lang="scss" scoped>
.expense-container {
    //
}
</style>
