<script setup lang="ts">
import BottomBar from '@/layouts/components/BottomBar.vue'
</script>

<template>
    <div class="layout-default">
        <section class="c-slot">
            <slot></slot>
        </section>
        <BottomBar class="btt-bar"></BottomBar>
    </div>
</template>

<style lang="scss" scoped>
.layout-default {
    display: grid;
    grid-template-rows: calc(100vh - 60px) 60px;

    .c-slot {
        padding: 20px 30px;
        overflow: hidden;
    }

    .btt-bar {
    }
}
</style>
