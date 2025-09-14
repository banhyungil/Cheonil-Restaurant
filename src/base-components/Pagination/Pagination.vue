<script setup lang="ts">
import Link from './Link.vue'
export interface PaginationProps {
    pageSize?: number
    pageGrpSize?: number
    totalSize: number
    next?: boolean
    grpNext?: boolean
}
const props = withDefaults(defineProps<PaginationProps>(), {
    pageSize: 10,
    pageGrpSize: 5,
    next: true,
    grpNext: true,
})
const pageNo = defineModel<number>({ required: true })

const cTotalPage = computed(() => Math.ceil(props.totalSize / props.pageSize))
const cGrpNo = computed(() => Math.ceil(pageNo.value / props.pageGrpSize))
const cGrpStPg = computed(() => (cGrpNo.value - 1) * props.pageGrpSize + 1)
const cPgList = computed(() => {
    const len = (() => {
        if (cTotalPage.value <= cGrpStPg.value + props.pageGrpSize - 1) return cTotalPage.value - cGrpStPg.value + 1
        else return props.pageGrpSize
    })()

    return Array.from({ length: len }, (_, i) => i + cGrpStPg.value)
})

watch(
    () => props.totalSize,
    () => {
        if (cTotalPage.value == 0) pageNo.value = 1
        else if (cTotalPage.value < pageNo.value) pageNo.value = cTotalPage.value
    }
)
</script>

<template>
    <nav class="pagination">
        <ul class="mr-0 flex w-full sm:mr-auto sm:w-auto">
            <Link v-if="grpNext" @click="$emit('update:modelValue', (cGrpNo - 1) * pageGrpSize)" :disabled="cGrpNo <= 1">
                <font-awesome-icon :icon="['fas', 'chevrons-left']" class="h-4 w-4" />
            </Link>
            <Link v-if="next" @click="$emit('update:modelValue', pageNo - 1)" :disabled="pageNo <= 1">
                <font-awesome-icon :icon="['fas', 'chevron-left']" class="h-4 w-4" />
            </Link>
            <slot>
                <Link
                    v-for="pgNo in cPgList"
                    :key="pgNo"
                    :active="pgNo === pageNo"
                    :class="{ active: pgNo === pageNo }"
                    @click="() => $emit('update:modelValue', pgNo)"
                >
                    {{ pgNo }}
                </Link>
            </slot>
            <Link v-if="next" @click="$emit('update:modelValue', pageNo + 1)" :class="{ disabled: pageNo >= cTotalPage }">
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="h-4 w-4" />
            </Link>
            <Link v-if="grpNext" @click="$emit('update:modelValue', cGrpNo * pageGrpSize + 1)" :class="{ disabled: cGrpNo * pageGrpSize >= cTotalPage }">
                <font-awesome-icon :icon="['fas', 'chevrons-right']" class="h-4 w-4" />
            </Link>
        </ul>
    </nav>
</template>

<style lang="scss">
.pagination {
    a {
        @apply text-white;

        &.active {
            @apply bg-primary text-white;
            opacity: 0.8;
        }
        &.hover {
            @apply bg-primary opacity-50;
        }
    }
}
</style>
