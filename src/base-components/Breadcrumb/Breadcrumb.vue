<script setup lang="ts">
import { type HTMLAttributes, useSlots, provide } from 'vue'

export type ProvideBeradcrumb = {
    light?: boolean
}

interface BreadcrumbProps extends /* @vue-ignore */ HTMLAttributes {
    light?: boolean
}

const slots = useSlots()

const { light } = defineProps<BreadcrumbProps>()

provide<ProvideBeradcrumb>('breadcrumb', {
    light: light,
})
</script>

<template>
    <nav class="flex" aria-label="breadcrumb">
        <ol :class="['flex items-center text-primary dark:text-slate-300', { 'text-white/90': light }]">
            <component v-for="(item, key) in slots.default && slots.default()" :is="item" :index="key" :key="key" />
        </ol>
    </nav>
</template>
