<script setup lang="ts"></script>

<template>
    <select class="bselect tw-sm:mt-0 tw-mt-3 tw-w-20">
        <slot></slot>
    </select>
</template>

<style scoped>
.bselect {
    border: 1px solid grey;
    border-radius: 6px;
    padding: 6px;
}
</style>
