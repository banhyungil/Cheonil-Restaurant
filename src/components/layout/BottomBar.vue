<script setup lang="ts"></script>

<template>
  <section class="btt-bar">
    <RouterLink class="item" to="/order">주문</RouterLink>
    <RouterLink class="item" to="/orderState">주문현황</RouterLink>
    <RouterLink class="item link" to="/account" v-tooltip.top="'관리자 화면'">
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
  border: 1px solid var(--color-point);
  color: var(--color-point);
  //   background-color: #2aac8e;

  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-point);
    color: var(--color-point);
    border-right: none;
    font-weight: bold;

    &.router-link-active {
      color: #fff;
      background-color: var(--color-point);
    }

    &:hover {
      background-color: var(--color-point);
      color: #fff;
      opacity: 0.7;
    }

    &.link {
      border-color: var(--color-u);
      color: var(--color-u);

      &:hover {
        background-color: var(--color-u);
        color: #fff;
      }
    }
  }
}
</style>
