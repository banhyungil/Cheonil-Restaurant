<script setup lang="ts">
import { useDraggable, useElementSize } from '@vueuse/core'

interface Props {
    title: string
    draggable?: boolean
    onCancel?: () => void
}
withDefaults(defineProps<Props>(), {
    initOptions: () => ({
        isCenter: true,
    }),
    draggable: false,
    onCancel: () => {},
    onConfirm: () => {},
})

const bmodalEl = ref<HTMLElement>()
const topEl = ref<HTMLElement>()

const { style } = useDraggable(bmodalEl, {
    handle: topEl,
})
</script>

<template>
    <div class="bmodal" ref="bmodalEl" :style="draggable ? style : undefined">
        <section class="top" ref="topEl">
            <h1 class="title">{{ title }}</h1>
            <BButton @click="onCancel" variant="primary" class="cancel">
                <font-awesome-icon :icon="['fas', 'x']" />
            </BButton>
        </section>
        <section class="content">
            <slot></slot>
        </section>
    </div>
</template>

<style lang="scss" scoped>
.bmodal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;

    .top {
        display: flex;

        .title {
            flex-grow: 1;
        }
        .cancel {
            width: fit-content;
        }
    }
}
</style>
