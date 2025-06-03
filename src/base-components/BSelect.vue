<script setup lang="ts"></script>

<template>
    <select class="bselect sm:mt-0 mt-3 w-20">
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
