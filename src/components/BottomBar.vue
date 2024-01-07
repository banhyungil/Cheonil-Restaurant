<script setup lang="ts"></script>

<template>
  <section class="btt-bar">
    <RouterLink class="link" to="/order">주문</RouterLink>
    <RouterLink class="link" to="/orderstate">주문현황</RouterLink>
    <RouterLink class="link" to="/orderstate"
      ><font-awesome-icon :icon="['fas', 'user']"
    /></RouterLink>
  </section>
</template>

<style lang="scss" scoped>
.btt-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 100px;
  align-items: center;
  justify-items: center;
  width: 100vw;
  background-color: #fafafa;

  .link {
  }
}
</style>
