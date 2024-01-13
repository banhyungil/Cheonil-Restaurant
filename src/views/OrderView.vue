<script setup lang="ts"></script>

<template>
  <div class="order-view">
    <section class="left">
      <section class="top">
        <!-- 초성 검색 구현 -->
        <input type="text" placeholder="검색" />
      </section>
      <ul class="ctgs">
        <!-- v-for 카테고리 표시 -->
        <li></li>
      </ul>
      <section class="grid">
        <!-- 메뉴 목록 표시 -->
        <div class="item"></div>
      </section>
    </section>
    <section class="right">
      <section class="top"></section>
      <section class="content">
        <ul class="orders">
          <!-- 주문 목록을 표시, 주문 목록 정보 객체를 만들어야함 -->
          <li></li>
        </ul>
        <div class="c-total"></div>
      </section>
      <section class="btt"></section>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.order-view {
  display: flex;
  flex-direction: column;

  .left {
    .top {
    }
    .ctgs {
    }
    .grid {
    }
  }
  .right {
    .top {
    }
    .content {
      .orders {
      }
      .c-total {
      }
    }
    .btt {
    }
  }
}
</style>
