<script setup lang="ts">
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
        <ul class="tw-sm:w-auto tw-sm:mr-auto tw-mr-0 tw-flex tw-w-full">
            <a v-if="grpNext" @click="$emit('update:modelValue', (cGrpNo - 1) * pageGrpSize)" :disabled="cGrpNo <= 1">
                <font-awesome-icon :icon="['fas', 'chevrons-left']" />
            </a>
            <a v-if="next" @click="$emit('update:modelValue', pageNo - 1)" :disabled="pageNo <= 1">
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </a>
            <slot>
                <a v-if="cPgList.length == 0">0</a>
                <a v-for="pgNo in cPgList" :key="pgNo" :active="pgNo === pageNo" @click="() => $emit('update:modelValue', pgNo)">
                    {{ pgNo }}
                </a>
            </slot>
            <a v-if="next" @click="$emit('update:modelValue', pageNo + 1)" :class="{ disabled: pageNo >= cTotalPage }">
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </a>
            <a v-if="grpNext" @click="$emit('update:modelValue', cGrpNo * pageGrpSize + 1)" :class="{ disabled: cGrpNo * pageGrpSize >= cTotalPage }">
                <font-awesome-icon :icon="['fas', 'chevrons-right']" />
            </a>
        </ul>
    </nav>
</template>
