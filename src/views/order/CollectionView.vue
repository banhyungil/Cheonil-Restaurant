<script setup lang="ts">
import type { VDataTable } from 'vuetify/components'

const selected = ref([])
</script>

<template>
  <!-- <OrderList v-model="orders" title="수금"></OrderList> -->
  <OrderList title="수금" class="collection-view" :active-collection="true"></OrderList>
</template>

<style lang="scss" scoped></style>
