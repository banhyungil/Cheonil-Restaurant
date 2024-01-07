<script setup lang="ts">
import SideBar from '@/components/SideBar.vue'
</script>

<template>
  <!-- 매장선택 -->
  <!-- 주문하기 -->
  <!-- 주문현황 -->
  <!-- 관리화면 -->
  <main>
    <RouterLink to="/order">주문하기</RouterLink>
    <RouterLink to="/orderState">주문현황</RouterLink>
    <RouterLink to="/admin">관리자</RouterLink>
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

  <div>
    <SideBar></SideBar>
  </div>
</template>
