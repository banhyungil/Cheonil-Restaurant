<script setup lang="ts" generic="T extends object">
// Extends BTable
import { type BTableProps, type BTableSlots, type BTableEmtis } from './BTable.vue'
import { syncRef } from '@vueuse/core'

interface Props extends BTableProps<T> {
    /** 페이지 크기 목록, selectBox에 표시된다 */
    pgSizes?: number[]
    /** 페이지 크기 선택가능 여부 */
    pgSizeSelection?: boolean
    /** 다음 페이지 버튼 표시 여부 */
    showPgNext?: boolean
    /** no 컬럼 표시 여부 */
    showNo?: boolean
    disablePaging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    disabledCbx: false,
    pgSizeSelection: true,
    showPgNext: true,
    disablePaging: false,
})

interface BTablePagingEmits<T> extends BTableEmtis<T> {
    (e: 'changedPage', value: T[]): void
}
const emit = defineEmits<BTablePagingEmits<T>>()
defineSlots<BTableSlots<T>>()
const selIds = defineModel('selIds', { type: Array, default: [] })
const pageNo = defineModel('pageNo', { default: 1 })
const pageSize = defineModel('pageSize', { default: 10 })

/** 선택 카테고리 개소 목록 페이징 */
const { pageNo: pgNo, pageSize: pgSize, cPgItems, PAGE_SIZE_LIST, cSIdx } = usePagination2(toRef(() => props.items))
/** vue model과 값 동기화를 시켜준다. */
syncRef(pageNo, pgNo)
syncRef(pageSize, pgSize)

// 선택 id에 변화에 따라 페이지를 바꾸는 작업 필요
// 외부에서 selIds를 설정할떄 해당 페이지로 이동시킨다.
watch(
    () => selIds.value.sort().join(','),
    () => {
        if (selIds.value.length < 1) return

        const lastId = selIds.value[selIds.value.length - 1]
        const idx = props.items.findIndex((item) => item[props.itemKey] == lastId)
        const pgNo = Math.floor(idx / pageSize.value) + 1
        if (pageNo.value != pgNo) pageNo.value = Math.floor(idx / pageSize.value) + 1
    },
    { deep: true }
)

const cItems = computed(() => {
    const result = props.disablePaging === true ? props.items : cPgItems.value
    emit('changedPage', result ?? [])
    return result
})
const cPgSizes = computed(() => props.pgSizes ?? PAGE_SIZE_LIST)
const cColInfos = computed(() => {
    if (props.showNo) return [{ key: 'no', title: 'NO', colSize: '60px' }, ...props.colInfos]
    else return props.colInfos
})

// emit pass throwgh
// 이방법 밖에 찾지 못했음
function changeCell(v: any) {
    emit('changeCell', v)
}
function changeSelected(v: any, selected: boolean) {
    emit('changeSelected', v, selected)
}
function changeChecked(v: any) {
    emit('changeChecked', v)
}
</script>
<template>
    <div class="btable-paging">
        <BTable
            v-bind="{ ...($props as any) }"
            :items="cItems"
            :col-infos="cColInfos"
            @change-cell="changeCell"
            @change-selected="changeSelected"
            @change-checked="changeChecked"
            v-model:sel-ids="selIds"
            class="btable"
        >
            <!-- no 컬럼이 추가되는 경우 rendering 됨 -->
            <template #no="{ rowIdx }">
                <span>{{ rowIdx + cSIdx + 1 }}</span>
            </template>
            <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{ ...(scope as any) }" />
            </template>
        </BTable>
        <section
            v-if="disablePaging == false"
            class="c-footer tw-intro-y tw-sm:flex-row tw-sm:flex-nowrap tw-col-span-12 tw-my-5 tw-flex tw-flex-wrap tw-items-center"
        >
            <BPagination
                class="paging tw-sm:w-auto tw-sm:mr-auto tw-w-full"
                v-model="pageNo"
                :pageSize="pageSize"
                :pageGrpSize="5"
                :totalSize="items.length"
                :next="showPgNext"
            >
            </BPagination>
            <label htmlFor="regular-form-1" class="mx-5 mb-0">총 {{ items.length }} 건</label>
            <BSelect v-if="pgSizeSelection" v-model="pageSize" class="tw-sm:mt-0 tw-mt-3 tw-w-20">
                <option v-for="size in cPgSizes" :key="size" :value="size">{{ size }}</option>
            </BSelect>
        </section>
    </div>
</template>
<style lang="scss" scoped>
.btable-paging {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .btable {
        height: 100%;
    }
}
</style>
