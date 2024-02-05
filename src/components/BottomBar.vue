<script setup lang="ts"></script>

<template>
  <section class="btt-bar">
    <RouterLink class="item" to="/">주문</RouterLink>
    <RouterLink class="item" to="/orderstate">주문현황</RouterLink>
    <RouterLink class="item" to="/admin" v-tooltip.top="'관리자 화면'">
      <font-awesome-icon :icon="['fas', 'user']" />
    </RouterLink>
  </section>
</template>

<style lang="scss" scoped>
.btt-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  align-items: center;
  justify-items: center;
  width: 100%;
  background-color: #2aac8e;

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: #fff;
    border: 1px solid #fafafa;
    border-right: none;
  }
}
</style>
