<script setup lang="ts">
import Link from './Link.vue'

interface Props {
    pageSize: number
    pageGrpSize: number
    totalSize: number
    next?: boolean
    grpNext?: boolean
}
const props = withDefaults(defineProps<Props>(), {
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
    <nav>
        <ul class="flex w-full mr-0 sm:w-auto sm:mr-auto">
            <button v-if="grpNext" @click="$emit('update:modelValue', (cGrpNo - 1) * pageGrpSize)" :disabled="cGrpNo <= 1">
                <Lucide icon="ChevronsLeft" class="w-4 h-4" />
            </button>
            <button v-if="next" @click="$emit('update:modelValue', pageNo - 1)" :disabled="pageNo <= 1">
                <Lucide icon="ChevronLeft" class="w-4 h-4" />
            </button>
            <slot>
                <button v-for="pgNo in cPgList" :key="pgNo" :active="pgNo === pageNo" @click="() => $emit('update:modelValue', pgNo)">
                    {{ pgNo }}
                </button>
            </slot>
            <button v-if="next" @click="$emit('update:modelValue', pageNo + 1)" :class="{ disabled: pageNo >= cTotalPage }">
                <Lucide icon="ChevronRight" class="w-4 h-4" />
            </button>
            <button v-if="grpNext" @click="$emit('update:modelValue', cGrpNo * pageGrpSize + 1)" :class="{ disabled: cGrpNo * pageGrpSize >= cTotalPage }">
                <Lucide icon="ChevronsRight" class="w-4 h-4" />
            </button>
        </ul>
    </nav>
</template>
