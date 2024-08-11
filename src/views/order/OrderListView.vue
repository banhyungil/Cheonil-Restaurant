<script setup lang="ts">
const orders = ref<Order[]>([])
const isEdit = ref(false)
const selected = ref<Order[]>([])
</script>

<template>
  <OrderList v-model:selected="selected" v-model="orders" title="주문내역" class="order-list-view">
    <template #top>
      <section class="top">
        <v-btn @click="() => (isEdit = !isEdit)" class="toggle" :class="{ on: isEdit }"> <font-awesome-icon :icon="['fas', 'pen']" /> </v-btn>
      </section>
    </template>
  </OrderList>
</template>

<style lang="scss" scoped>
.order-list-view {
  section.top {
    display: flex;
    justify-content: end;

    .toggle {
      width: 40px;
    }
  }
}
</style>
