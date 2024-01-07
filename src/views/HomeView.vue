<script setup lang="ts"></script>

<template>
  <!-- 매장선택 -->
  <!-- 주문하기 -->
  <!-- 주문현황 -->
  <!-- 관리화면 -->
  <main>
    <div class="c-link">
      <RouterLink class="link" to="/order">주문하기</RouterLink>
      <RouterLink class="link" to="/orderstate">주문현황</RouterLink>
      <RouterLink class="link" to="/admin">관리자</RouterLink>
    </div>
  </main>

  <!-- admin -->
  <!-- 일일정산 -->
  <!-- 식자재 등록 관리 -->
  <!-- 식자재 구입목록 관리 -->
  <!-- 주문내역 -->
  <!-- 
    미수 기능
   -->
  <!-- 매장등록 -->
</template>

<style lang="scss" scoped>
body {
  background-color: #fafafa;
}
main {
  width: 100vh;
  height: 100vh;
  .c-link {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    .link {
      font-family: 'Roboto', sans-serif;
      padding: 40px;
      background-color: #2aac8e;
      color: #fff;
      margin: 0 20px;
      font-size: 20px;
      border-radius: 10px;
    }
  }
}
</style>
