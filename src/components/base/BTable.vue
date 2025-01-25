<script generic="T extends object" lang="ts" setup>
import _ from 'lodash'
import type { CSSProperties } from 'vue'
import { useElementSize } from '@vueuse/core'
import useDictionary from '@/composable/useDictionary'
import { getUuid } from '@/utils/CommonUtils'

export interface BTableColInfo {
    key: string
    title: string
    /** grid body에 적용됨. header는 body 넓이로 결정됨 */
    colSize?: string
    colStyle?: CSSProperties
    inputType?: string
    editable?: boolean
    sortable?: boolean
}

export interface CellInfo<T> {
    originItem: T
    item: T
    originValue: any
    value: any
    rowIdx: number
    colIdx: number
    colKey: string
    cellElt: HTMLElement
}

export interface BTableChange<T> {
    item: T
    key: keyof T
    /** 변경된 값 */
    val: never
    rollback: () => void
}

export type BTableSlots<T> = { [slotName: string]: (props: CellInfo<T>) => any }
export type BTableEmtis<T> = {
    (e: 'changeSelected', value: T, selected: boolean): void
    (e: 'changeChecked', value: T[]): void
    (e: 'changeCell', value: CellInfo<T>): void
    (e: 'pressF2'): void
    (e: 'change', options: BTableChange<T>): void
}

export interface BTableProps<T> {
    items: T[]
    itemKey: keyof T
    colInfos: BTableColInfo[]
    /** 정렬 유형 */
    sortType?: 'single' | 'multy'
    /** 선택 유형 */
    selectType?: 'single' | 'multy'
    /** 체크박스 유형 */
    checkedType?: 'checkbox' | 'radio'
    /** 테이블 스타일 테마 */
    theme?: 'basic' | 'border'
    /** checkbox 비활성화 */
    disableCheckbox?: boolean
    /** 행별 클래스 부여 */
    rowClass?: (item: T) => any
}

const props = withDefaults(defineProps<BTableProps<T>>(), {
    sortType: 'single',
    theme: 'basic',
    disableCheckbox: false,
    rowClass: () => '',
})

const itemKeys = ref<string[]>([])
watch(
    () => (props.items.length > 0 ? Object.keys(props.items[0]) : []),
    (newVal, oldVal) => {
        if (_.isEqual(newVal, oldVal) == false) {
            itemKeys.value = newVal
        }
    }
)

// header가 최소한 보이게 설정할려면 어떻게할까
// header max-content를 설정한 넓이를 알아야함
// max-content 넓이와 그리드넓이를 비교해서 max-content가 큰 경우 max-content넓이로 결정해야한다.
// 그러나 body 그렇게 설정하는 경우 그다음 갱신이 제대로 안될 수 있다.

const contElt = ref<HTMLElement>()
const INIT_DISABLED = props.selectType != null
const emit = defineEmits<BTableEmtis<T>>()

const { dict: dItemExt } = useDictionary({
    items: computed(() => props.items),
    itemKey: props.itemKey,
    initFn: (_) => ({ selected: false }),
})

const selIds = defineModel<any[]>('selIds', { default: [] })
watch(selIds, () => {
    emit('changeChecked', getCheckedItems(selIds.value))
})
function onRadioChanged(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.checked) selIds.value = [target.value]
    else selIds.value = []
    console.log('selIds', selIds.value)
}

const checkAll = ref()
const cAllIds = computed(() => props.items.map((item) => item[props.itemKey]))
// checkAll composable
const { onCheck, onCheckAll } = useCheckAll({ checkedIds: selIds, checkAll, allIds: cAllIds })

// 컬럼정보
const DEFT_COLSTYLE: CSSProperties = {
    justifyContent: 'center',
}
const cColInfos = computed(() => {
    const colInfos: BTableColInfo[] = props.colInfos.map((colInfo) => {
        return {
            ...colInfo,
            colStyle: { ...DEFT_COLSTYLE, ...colInfo.colStyle, justifyContent: colInfo.inputType ? 'left' : DEFT_COLSTYLE.justifyContent },
            colSize: colInfo['colSize'] ?? 'minmax(max-content, 1fr)',
            // 정렬 가능한 key는 항목에 존재하는 key만 가능
            // true인 경우는 항목에 key가 존재하는지 확인해야함
            sortable: colInfo['sortable'] === false ? false : validKey(itemKeys.value ?? {}, colInfo.key),
        }
    })
    if (props.checkedType) {
        const colInfo = {
            key: '_check',
            title: '선택',
            colSize: '60px',
            colStyle: DEFT_COLSTYLE,
            sortable: false,
            inputType: props.checkedType,
        } as BTableColInfo
        colInfos.splice(0, 0, colInfo)
    }
    console.log('colInfos.length', colInfos.length)

    return colInfos
})

const cRowCnt = computed(() => props.items.length)
const cColCnt = computed(() => cColInfos.value.length)
const uuid = getUuid(true)

/**
 * 셀요소
 * 이슈
 * 1. vue-template에서 ref 속성에 바인딩 하였을 때 요소 삭제 처리시 성능 이슈가 있었음
 * - 해결: watch를 이용해 값을 갱신하는것으로 변경
 */
const cellElts = ref([]) as Ref<HTMLElement[]>
const bodyElt = ref() as Ref<HTMLElement>
const { width } = useElementSize(bodyElt)

const cCellFirstBElts = computed(() => cellElts.value.filter((elt) => elt.classList.contains('b') && elt.classList.contains('row-0')))

// header 크기를 body와 동일한 크기로 맞춤
const gridHeaderTemplateColumns = ref('')
watch(
    [() => props.colInfos.length, width, () => props.items.map((item) => item[props.itemKey])],
    async () => {
        console.time('gridHeaderTemplateColumns')
        cellElts.value = Array.from(contElt.value?.querySelectorAll('.btable-col') ?? []) as HTMLElement[]
        // 모든 그리드셀이 업데이트 된후에 그리드 최종 넓이가 결정됨됨
        const widthList = cCellFirstBElts.value.map((elt) => {
            return elt.getBoundingClientRect().width
        })
        gridHeaderTemplateColumns.value = widthList.length == 0 ? cGridBodyTemplateColumns.value : widthList.map((num) => `${num}px`).join(' ')

        console.timeEnd('gridHeaderTemplateColumns')
    },
    // grid 렌더링이 갱신 된후에 처리
    { flush: 'post' }
)

const cGridBodyTemplateColumns = computed(() => {
    return cColInfos.value.map((colInfo) => colInfo['colSize']).join(' ')
})

function validKey<T extends object>(item: T, key: any): key is keyof T {
    return key in item
}

function getCellInfo(rowIdx: number, colIdx: number) {
    const item = cOrderedItems.value[rowIdx]
    const originItem = props.items[rowIdx]
    const colInfo = cColInfos.value[colIdx]
    const colKey = colInfo.key
    const originValue = validKey(originItem, colKey) ? originItem[colKey] : null
    const value = validKey(item, colKey) ? item[colKey] : null
    const cellElt = cellElts.value[getCellIdx(rowIdx, colIdx)]

    return {
        item,
        colInfo,
        originItem,
        originValue,
        value,
        assign: () => {
            if (validKey(originItem, colKey)) originItem[colKey] = value as any
        },
        undo: () => {
            if (validKey(originItem, colKey)) item[colKey] = originValue as any
        },
        rowIdx,
        colIdx,
        cellElt,
        colKey,
    } as CellInfo<T>
}

const EDIT_INP_TYPES = ['text', 'number']

/**
 * cell 이동을 위해서는 정렬을 해줘야함
 * v-for는 최초 생성시에는 목록에 따른 렌더링 순서를 보장한다.
 * 그러나 key를 사용하면 기존과 같은 key를 가진 요소들은 cache되기 때문에 별도로 정렬이 필요
 */
const cOrderdCellElts = computed(() => {
    return cellElts.value.sort((a, b) => +(a.dataset.cellidx ?? 0) - +(b.dataset.cellidx ?? 0))
})
const { getCellIdx } = useMoveCell({ rowCnt: cRowCnt, colCnt: cColCnt, elts: cOrderdCellElts })

const cGrdSortable = computed(() => props.sortType != null)
const cMultiSortable = computed(() => props.sortType == 'multy')

const { toggle, cOrderDict, cOrdered: cOrderedItems } = useOrderBy({ items: computed(() => props.items) })

function onSort(colKey: string, colSortable?: boolean) {
    if (props.sortType == null || colSortable == false) return
    toggle(colKey as string, cMultiSortable.value)
}

const cSelectedItems = computed(() => props.items.filter((it) => dItemExt.value[it[props.itemKey]].selected))

function selectRow(rowIdx: number) {
    if (props.selectType == null) return
    const item = props.items[rowIdx]

    const selected = !dItemExt.value[item[props.itemKey]].selected
    if (selected && props.selectType != 'multy') {
        // 기존 선택 된 것은 해제 해준다.
        props.items.forEach((item) => {
            const ext = dItemExt.value[item[props.itemKey]]
            if (ext.selected) ext.selected = false
        })
    }

    dItemExt.value[item[props.itemKey]].selected = selected
    selIds.value = cSelectedItems.value.map((item) => item[props.itemKey])
    console.log('selIds', selIds)
    emit('changeSelected', item, selected)
}

const editableInp = ref({}) as Ref<HTMLInputElement>
function onFocusCell(e: Event, rowIdx: number, colIdx: number) {
    const target = e.target as HTMLElement
    const inpElt = target.querySelector('input')

    if (inpElt && EDIT_INP_TYPES.includes(inpElt.type)) {
        if (props.selectType != null) {
            editableInp.value.disabled = true
            editableInp.value = inpElt

            // focus 전파 후 클릭 전파 발생. 모든 event 발생후에 false로 바꿔줘야 됨.
            setTimeout(() => {
                inpElt.disabled = false
            }, 0)
        }
    }

    onChangeCell(rowIdx, colIdx)
}

function onKeyupCell(e: KeyboardEvent) {
    if (e.currentTarget != e.target) return
    e.preventDefault()

    const target = e.target as HTMLElement
    const inpElt = target.querySelector('input')

    //spacebar

    if (e.key == 'F2') {
        console.log('F2')
        emit('pressF2')
        if (inpElt && EDIT_INP_TYPES.includes(inpElt.type)) {
            console.log('focus')
            if (inpElt.disabled) inpElt.disabled = false
            inpElt.focus()
        } else {
            const btnElt = target.querySelector('button')
            if (btnElt) btnElt.click()
        }
    } else if (e.key == ' ' && inpElt && (inpElt.type == 'checkbox' || inpElt.type == 'radio')) {
        inpElt.click()
    } else if (e.key == 'Enter') {
        console.log('Enter')
        target.click()
    }
}

function onValueChanged(item: T, key: keyof T, val: any) {
    item[key] = val
    const originItem = props.items.find((it) => it[props.itemKey] == item[props.itemKey])
    if (originItem) emit('change', { item: originItem, key, val: val as never, rollback: () => (item[key] = originItem[key]) })
}

/**
 * @param {KeyboardEvent} e
 */
function onEnterInp(rowIdx: number, colIdx: number) {
    cellElts.value[getCellIdx(rowIdx, colIdx)].focus()
}

function onChangeCell(rowIdx: number, colIdx: number) {
    emit('changeCell', { ...getCellInfo(rowIdx, colIdx) })
}

function getSelectedItems() {
    return props.items.filter((item) => cSelectedItems.value.some((selItem) => selItem[props.itemKey] == item[props.itemKey]))
}

function getCheckedItems(checkedIds: any[]) {
    return props.items.filter((item) => checkedIds.includes(item[props.itemKey]))
}

function rollback() {
    // syncItems()
}

defineExpose({ getSelectedItems, getCheckedItems, uuid, rollback })
</script>

<template>
    <div class="btable" :class="theme" :id="uuid" ref="contElt">
        <div class="header" role="grid" :style="{ gridTemplateColumns: gridHeaderTemplateColumns }">
            <div
                v-for="({ key, title, sortable, colStyle }, idx) in cColInfos"
                :key="key"
                :data-cellidx="idx"
                class="btable-col h"
                :class="{ sortable: cGrdSortable && sortable }"
                :style="colStyle"
                @click="onSort(key, sortable)"
                @keyup="onKeyupCell"
                role="gridcell"
                :tabindex="sortable || key == '_check' ? '0' : ''"
            >
                <BCheckbox v-if="key == '_check' && props.checkedType == 'checkbox'" v-model="checkAll" @change="onCheckAll" :disabled="disableCheckbox" />
                <span v-else>{{ title ?? key }}</span>
                <font-awesome-icon
                    v-if="cOrderDict[key as string] != null"
                    :icon="cOrderDict[key as string] == 'asc' ? ['fas', 'arrow-up'] : ['fas', 'arrow-down']"
                    class="icon"
                />
            </div>
        </div>
        <div class="flex justify-center items-center text-xl text-slate-500" v-if="cOrderedItems.length == 0">No Data</div>
        <div ref="bodyElt" class="body" role="grid" :style="{ gridTemplateColumns: cGridBodyTemplateColumns }">
            <template v-for="(item, rowIdx) in cOrderedItems" :key="item[itemKey as keyof T]">
                <div
                    v-for="({ key, inputType, editable, colStyle }, colIdx) in cColInfos"
                    :key="`${item[itemKey as keyof T]}colIdx${colIdx}`"
                    class="btable-col b"
                    :class="[key, selectType ? { selected: selIds.includes(item[itemKey as keyof T]) } : null, rowClass(item), `row-${rowIdx}`]"
                    :style="{ ...colStyle, animationDelay: `${(1 / items.length) * ((rowIdx * cColInfos.length) / cColInfos.length)}s` }"
                    @click="selectRow(rowIdx)"
                    @focus="onFocusCell($event, rowIdx, colIdx)"
                    @keyup="onKeyupCell"
                    role="gridcell"
                    tabindex="0"
                >
                    <!-- 
                        1.editable input
                        - onClickInp, onEnterInp event 등록하면 기본 셀 내 input 과 동일하게 동작 
                    -->
                    <slot :name="key" v-bind="{ ...getCellInfo(rowIdx, colIdx) }">
                        <template v-if="inputType">
                            <BCheckbox
                                v-if="key == '_check' && inputType == 'checkbox'"
                                v-model="selIds"
                                :value="item[itemKey as keyof T]"
                                :disabled="disableCheckbox"
                                @change="onCheck"
                                tabindex="1"
                            />
                            <GRadioButton
                                v-else-if="key == '_check' && inputType == 'radio'"
                                @vue:mounted="
                                    (e: any) => {
                                        if (rowIdx == 0) e.el.click()
                                    }
                                "
                                @change="onRadioChanged"
                                :value="item[itemKey as keyof T]"
                                :name="uuid + 'radio'"
                                :disabled="disableCheckbox"
                                tabindex="1"
                            />
                            <!-- 
                                1.cellinp-e
                                * editable input인 경우, 셀 f2 key 동작시 focus
                            -->
                            <template v-else-if="editable && validKey(item, key)">
                                <BEditToggleInput
                                    class="eti"
                                    :type="inputType"
                                    :init-value="item[key]"
                                    @focusout="(val) => onValueChanged(item, key as keyof T, val)"
                                    @keyup.enter="onEnterInp(rowIdx, colIdx)"
                                />
                            </template>
                            <input
                                v-else-if="EDIT_INP_TYPES.includes(inputType) && validKey(item, key)"
                                :type="inputType"
                                v-model="item[key]"
                                @keyup.enter="onEnterInp(rowIdx, colIdx)"
                                :disabled="INIT_DISABLED"
                            />
                            <input v-else :type="inputType" :value="validKey(item, key) ? item[key] : null" />
                        </template>
                        <span v-else>{{ validKey(item, key) ? item[key] : '' }}</span>
                    </slot>
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@keyframes slide-in {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.btable {
    display: grid;
    grid-template-rows: max-content 1fr;
    overflow: auto;
    height: 100%;

    .header,
    .body {
        display: grid;
        border: none;
        row-gap: 10px;
        align-items: start;
    }

    // body에만 세로 스크롤이 생기도록 구현할려고 했지만 이슈 발생
    // 세로 스크롤바가 생기면 body쪽 컨테이너 내부에 스크롤바가 생기므로 가로 스크롤이 발생하게 됨
    // hidden으로 설정시 끝 컬럼 데이터가 안보이는 이슈가 발생
    .header {
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .btable-col {
        position: relative;
        display: flex;
        align-items: center;
        height: 100%;
        padding: 8px;
        opacity: 0;
        transform: translateX(-50px);
        animation: slide-in 1s ease forwards;

        &:focus {
            outline: none;
            border: none;

            &::after {
                content: '';
                position: absolute;
                left: 0;
                width: 100%;
                height: 100%;
                outline: none;
                border: 3px solid rgb(var(--color-primary) / 50%);
                z-index: -1;
            }
        }

        &.sortable {
            position: relative;
            cursor: pointer;

            .icon {
                position: absolute;
                top: 50%;
                right: 10px;
                transform: translateY(-50%);
            }
        }

        & > * {
            overflow: hidden;
        }

        input {
            width: 100%;
            height: 100%;
            background-color: transparent;
            border: none;
            outline: none;
            color: inherit;

            &[type='text']:disabled,
            &[type='number']:disabled {
                cursor: pointer;
            }
        }

        .eti {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;

            &.editable {
                width: 100%;
            }
        }

        &.h {
            &:hover {
                opacity: 0.7;
            }
        }

        &.b {
            background-color: #fff;

            &.selectable {
                cursor: pointer;
            }

            &.selected {
                background-color: rgb(var(--color-primary) / 80%);
                color: #fff;
            }
        }
    }

    &.border {
        row-gap: 0;
        background-color: #fff;

        .body {
            row-gap: 0;
        }

        .btable-col {
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 8px;

            &.h {
                background-color: #fff;
                font-weight: bold;
                border-bottom-width: 2px;
            }
        }
    }
}

.dms {
    .btable {
        .btable-col {
            // border: 1px solid #525050;
        }
    }
}
</style>
