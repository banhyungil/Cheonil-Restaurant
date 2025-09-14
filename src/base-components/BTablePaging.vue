<script setup lang="ts" generic="T extends object">
// Extends BTable
import { type BTableProps, type BTableSlots, type BTableEmtis } from './BTable.vue'
import usePagination, { PAGE_SIZE_LIST } from '@/composables/usePagination'
import _ from 'lodash'

//ANCHOR - Props, Models, Emits, Slots
interface Props extends BTableProps<T> {
    /** 페이지 크기 목록, selectBox에 표시된다 */
    pgSizes?: number[]
    pgGrpSize?: number
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
    pgGrpSize: 5,
})

const selIds = defineModel('selIds', { type: Array, default: [] })
const pageSize = defineModel('pageSize', { default: PAGE_SIZE_LIST[0], required: false })

type Emits = BTableEmtis<T> & {
    changedPage: [offset: number, pageSize: number]
}

const emit = defineEmits<Emits>()
defineSlots<BTableSlots<T>>()

//ANCHOR - Start

/** 선택 카테고리 개소 목록 페이징 */
const { pageNo, cOffset } = usePagination(
    computed(() => props.items.length),
    pageSize
)

watch(
    () => pageNo.value,
    () => {
        emit('changedPage', cOffset.value, pageSize.value)
    },
    { immediate: true }
)

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

        nextTick().then(() => {
            document.querySelector(`.id-${_.last(selIds.value)}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
        })
    },
    { deep: true }
)

const cPgItems = computed(() => props.items.slice(cOffset.value, pageNo.value * pageSize.value))
const cPgSizes = computed(() => props.pgSizes ?? PAGE_SIZE_LIST)

const cItems = computed(() => (props.disablePaging === true ? props.items : cPgItems.value))
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
function onColHover(item: any, key: any, event: MouseEvent) {
    emit('colHover', item, key, event)
}
</script>
<template>
    <div class="btable-paging">
        <BTable
            v-bind="{ ...($props as any) }"
            :items="cItems"
            :colInfos="cColInfos"
            @change-cell="changeCell"
            @change-selected="changeSelected"
            @change-checked="changeChecked"
            @colHover="onColHover"
            v-model:sel-ids="selIds"
            :booleanFormatter="booleanFormatter"
            class="btable"
        >
            <!-- no 컬럼이 추가되는 경우 rendering 됨 -->
            <template #no="{ rowIdx }">
                <span>{{ rowIdx + cOffset + 1 }}</span>
            </template>
            <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="{ ...(scope as any) }" />
            </template>
        </BTable>
        <section v-if="disablePaging == false" class="c-footer intro-y col-span-12 my-5 flex flex-wrap items-center sm:flex-row">
            <Pagination
                class="paging w-full sm:mr-auto sm:w-auto"
                v-model="pageNo"
                :pageSize="pageSize"
                :pageGrpSize="pgGrpSize"
                :totalSize="items.length"
                :next="showPgNext"
            >
            </Pagination>
            <div>
                <FormLabel htmlFor="regular-form-1" class="mx-5 mb-0">총 {{ items.length }} 건</FormLabel>
                <FormSelect v-if="pgSizeSelection" v-model="pageSize" class="select mt-3 w-20 sm:mt-0">
                    <option v-for="size in cPgSizes" :key="size" :value="size">{{ size }}</option>
                </FormSelect>
            </div>
        </section>
    </div>
</template>
<style lang="scss" scoped>
.btable-paging {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .btable {
        height: 100%;
    }
}
</style>
