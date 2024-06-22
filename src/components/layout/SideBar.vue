<script setup lang="ts"></script>
<template>
  <div class="sidebar">
    <div class="c-home">
      <RouterLink to="/">
        <font-awesome-icon :icon="['fas', 'house']" />
      </RouterLink>
    </div>
    <div class="c-menues">
      <RouterLink to="/account">정산</RouterLink>
      <RouterLink to="/orderList">주문내역</RouterLink>
      <RouterLink to="/menu">메뉴 등록</RouterLink>
      <RouterLink to="/store">매장 등록</RouterLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  min-width: 140px;
  width: 10vw;
  height: 100%;
  box-shadow: var(--box-shadow-section);

  .c-home {
    font-size: 22px;
    color: var(--color-point);
    padding: 14px;
  }

  .c-menues {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    row-gap: 30px;

    & > a {
      width: 120px;
      padding: 20px 10px;
      box-shadow: var(--box-shadow);
    }
  }
}
</style>
