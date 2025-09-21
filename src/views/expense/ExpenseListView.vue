<script setup lang="ts">
const router = useRouter()

function toEditView(seq?: number) {
    const path = seq ? `/${seq}` : ''
    router.push(`/expenseEdit${path}`)
}
</script>

<template>
    <section class="expense-list-view flex h-full w-full">
        <ExpenseContainer type="LIST" @toEditView="toEditView"></ExpenseContainer>
    </section>
</template>

<style lang="scss" scoped>
.expense-list-view {
    // 
}
</style>
