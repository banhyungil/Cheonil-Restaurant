<script setup lang="ts">
import { PAGE_SIZE_LIST } from '@/composables/usePagination'
import type { PaginationProps } from './Pagination.vue'

//ANCHOR - Props
interface Props extends Omit<PaginationProps, 'pageSize'> {
    pgSizeSelection?: boolean
    pgSizes?: number[]
    /** 스크롤 대상, 페이지 변경 시 스크롤 최상단 이동 */
    scrollTarget?: HTMLElement | string | null
}
const props = withDefaults(defineProps<Props>(), {
    pgSizeSelection: false,
    next: true,
    grpNext: true,
})
//ANCHOR - Models
const pageNo = defineModel('pageNo', { type: Number, default: 1, required: false })
const pageSize = defineModel('pageSize', { type: Number, default: 10, required: false })

const cPgSizes = computed(() => props.pgSizes ?? PAGE_SIZE_LIST)

watch(pageNo, () => {
    const tgt =
        props.scrollTarget instanceof HTMLElement
            ? props.scrollTarget
            : typeof props.scrollTarget === 'string'
              ? document.querySelector(props.scrollTarget)
              : null
    tgt?.scrollTo({
        top: 0,
        behavior: 'smooth',
    })
})
</script>
<template>
    <div class="bpagination intro-y col-span-12 my-5 flex flex-wrap items-center sm:flex-row">
        <Pagination class="w-full sm:mr-auto sm:w-auto" v-bind="$props" :pageSize="pageSize" v-model="pageNo"></Pagination>
        <div class="pg-size">
            <FormLabel htmlFor="form-1" class="total-lbl mx-5 mb-0 text-sm">총 {{ totalSize }} 건</FormLabel>
            <FormSelect v-if="pgSizeSelection" v-model="pageSize" id="form-1" class="!box mt-3 w-20 sm:mt-0">
                <option v-for="size in cPgSizes" :key="size" :value="size">{{ size }}</option>
            </FormSelect>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.bpagination {
}
</style>
