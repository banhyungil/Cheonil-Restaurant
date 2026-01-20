<script setup lang="ts">
export interface BDividerProps {
    /** 방향: horizontal(기본) | vertical */
    orientation?: 'horizontal' | 'vertical'
    /** 텍스트 정렬: center(기본) | left | right */
    align?: 'center' | 'left' | 'right'
    /** 두께 (px) */
    thickness?: number
    /** 색상 */
    color?: string
    /** 상하 여백 (horizontal) 또는 좌우 여백 (vertical) */
    spacing?: string
}

const props = withDefaults(defineProps<BDividerProps>(), {
    orientation: 'horizontal',
    align: 'center',
    thickness: 1,
    color: '#e5e7eb',
    spacing: '1rem',
})

const hasSlot = computed(() => !!useSlots().default)

const cStyle = computed(() => {
    if (props.orientation === 'vertical') {
        return {
            height: '100%',
            width: `${props.thickness}px`,
            margin: `0 ${props.spacing}`,
            backgroundColor: props.color,
        }
    }
    return {
        margin: `${props.spacing} 0`,
    }
})

const cLineStyle = computed(() => ({
    backgroundColor: props.color,
    height: `${props.thickness}px`,
}))
</script>

<template>
    <div v-if="orientation === 'vertical'" class="bdivider-vertical" :style="cStyle"></div>
    <div v-else class="bdivider-horizontal" :style="cStyle" :class="[`align-${align}`]">
        <div v-if="!hasSlot" class="line" :style="cLineStyle"></div>
        <template v-else>
            <div class="line" :style="cLineStyle"></div>
            <span class="content">
                <slot></slot>
            </span>
            <div class="line" :style="cLineStyle"></div>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.bdivider-horizontal {
    @apply flex w-full items-center;

    .line {
        @apply flex-1;
    }

    .content {
        @apply px-3 text-sm text-gray-500;
    }

    &.align-left {
        .line:first-child {
            flex: 0 0 0;
        }
    }

    &.align-right {
        .line:last-child {
            flex: 0 0 0;
        }
    }
}

.bdivider-vertical {
    @apply inline-block;
}
</style>
