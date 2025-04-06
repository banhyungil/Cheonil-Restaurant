<script setup lang="ts">
interface Props {
    type: 'LIST' | 'EDIT'
    seq?: number
}
const props = defineProps<Props>()
defineEmits<{
    cancel: []
    toEditView: [seq?: number]
    create: []
    update: []
}>()

const Swal = useSwal()
const apiExpense = useApiExpense()
const expenses = ref<ExpenseEntity[]>([])
const uExpense = ref<ExpenseEntity>()

watch(
    () => props.seq,
    async () => {
        if (props.seq) uExpense.value = await apiExpense.select(props.seq)
    }
)

apiExpense.selectList().then((res) => {
    expenses.value = res
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
</script>

<template>
    <section class="expense-container">
        <ExpenseList
            v-if="type == 'LIST'"
            :expenses="expenses"
            @create="() => $emit('toEditView')"
            @update="(seq) => $emit('toEditView', seq)"
            @remove="onRemove"
        ></ExpenseList>
        <ExpenseEdit v-else-if="type == 'EDIT'" :expenses="expenses" :uExpense="uExpense" @create="onCreate" @update="onUpdate" @cancel="$emit('cancel')" />
    </section>
</template>

<style lang="scss" scoped>
.account-view {
    display: flex;
    flex-direction: column;
    height: 100%;
}
</style>
