<script setup lang="ts">
const orders = ref<Order[]>([])
const selected = ref<Order[]>([])
</script>

<template>
  <OrderList v-model:selected="selected" v-model="orders" title="주문내역" class="order-list-view"> </OrderList>
</template>

<style lang="scss" scoped></style>
