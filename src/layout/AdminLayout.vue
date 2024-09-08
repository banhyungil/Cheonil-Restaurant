<script setup lang="ts">
import SideBar from '@/components/layout/SideBar.vue'
</script>

<template>
    <div class="admin-layout">
        <SideBar></SideBar>
        <div class="right">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss">
.admin-layout {
    display: grid;
    grid-template-columns: max-content 1fr;
    height: 100vh;
    padding-top: 20px;

    & > * {
        height: 100%;
        background-color: #fff;
    }

    & > .right {
        margin: 20px;
        margin-top: 0;
        box-shadow: var(--box-shadow-section);
    }
}
</style>
