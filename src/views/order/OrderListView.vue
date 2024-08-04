<script setup lang="ts">
import { type OrderResult } from '@/api/useApiOrder'

const orders = ref<OrderResult[]>([])
const isEdit = ref(false)
const selected = ref<OrderResult[]>([])
</script>

<template>
  {{ selected }}
  <OrderList v-model:selected="selected" v-model="orders" title="주문내역" class="order-list-view">
    <template #top>
      <section class="top">
        <v-btn @click="() => (isEdit = !isEdit)"> 편집 </v-btn>
      </section>
    </template>
  </OrderList>
</template>

<style lang="scss" scoped>
.order-list-view {
  section.top {
    display: flex;
    justify-content: end;
  }
}
</style>
