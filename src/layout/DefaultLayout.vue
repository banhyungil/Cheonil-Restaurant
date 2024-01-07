<script setup lang="ts">
import BottomBar from '@/components/BottomBar.vue'
</script>

<template>
  <div class="layout-default">
    <section class="c-slot">
      <slot></slot>
    </section>
    <BottomBar clss="btt-bar"></BottomBar>
  </div>
</template>

<style lang="scss" scoped>
.layout-default {
  display: grid;
  grid-template-rows: calc(100vh - 60px) 60px;
  .c-slot {
  }

  .btt-bar {
  }
}
</style>
