<script lang="ts">
export default {
    inheritAttrs: false,
}
</script>

<script setup lang="ts">
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'
import { computed, type LiHTMLAttributes, useAttrs } from 'vue'

interface LinkProps extends /* @vue-ignore */ LiHTMLAttributes {
    as?: string | object
    active?: boolean
    disabled?: boolean
}

const props = withDefaults(defineProps<LinkProps>(), {
    as: 'a',
    active: false,
    disabled: false,
})

const attrs = useAttrs()

const computedClass = computed(() =>
    twMerge([
        'min-w-0 sm:min-w-[40px] shadow-none font-normal flex items-center justify-center border-transparent text-slate-800 sm:mr-2 dark:text-slate-300 px-1 sm:px-3',
        props.active && '!box font-medium dark:bg-darkmode-400',
        typeof attrs.class === 'string' && attrs.class,
        props.disabled && 'disabled',
    ])
)
</script>

<template>
    <li class="flex-1 bg-darkmode-900 sm:flex-initial">
        <BButton :as="as" :class="computedClass" v-bind="_.omit(attrs, 'class')">
            <slot></slot>
        </BButton>
    </li>
</template>

<style lang="scss" scoped>
.disabled {
    color: grey;
    opacity: 0.8;
    pointer-events: none;
}
</style>
