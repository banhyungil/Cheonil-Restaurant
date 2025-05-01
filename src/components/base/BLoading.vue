<script setup lang="ts">
//ANCHOR - Models
const isLoading = defineModel({ required: true })
</script>
<template>
    <Transition name="fade" mode="in-out">
        <div v-if="isLoading" class="base-loading">
            <div class="base-loading__spinner">
                <font-awesome-icon :icon="['fas', 'spinner']" spin class="fa-spinner" />
            </div>
        </div>
        <template v-else>
            <slot></slot>
        </template>
    </Transition>
</template>
<style lang="scss" scoped>
@use 'sass:color';

.base-loading {
    &__overlay {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
        height: 100%;
        width: 100%;
        background-color: rgba(#000, 0.3);
    }

    &__spinner {
        position: absolute;
        z-index: 100;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        height: 100%;

        .fa-spinner {
            color: rgba(var(--color-primary) / 70%);
            width: 50%;
            height: 50%;
            max-width: 100px;
            max-height: 100px;
        }
    }
}
</style>
