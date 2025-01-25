<script setup lang="ts" generic="T extends object">
import { computed, watch } from 'vue'
import Tree from '@/utils/tree'

export interface DataSourceItemBase {
    id: string | number
    text: string
    children?: DataSourceItemBase[]
    changedSel?: boolean
    changedChk?: boolean
    changedExp?: boolean
}
/**
 * 유의사항
 * modelValue는 반응형 데이터여야 한다.
 * checked, selected, expanded에 대해선 변경이 된다.
 */
export interface DataSourceItem<T> extends DataSourceItemBase {
    item?: T
    children?: DataSourceItem<T>[]
    pdsItem?: DataSourceItem<T>
}

export interface DataSourceItemExt {
    parentId?: string | number | null
    checked?: boolean | null
    selected?: boolean
    expanded?: boolean
    visible?: boolean
    disabled?: boolean
    cbxVisible?: boolean
    cbxDisabled?: boolean
}

export type DataSourceItemExtDict = Record<any, DataSourceItemExt>

interface Props {
    depthMargin?: number
    expandedAll?: boolean
    expandVisible?: boolean
    cbxVisible?: boolean
    cbxType?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    selectable?: boolean
    multiSelectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    depthMargin: 10,
    expandedAll: false,
    expandVisible: true,
    cbxVisible: true,
    cbxType: 'NORMAL',
    selectable: true,
    multiSelectable: false,
})

const modelValue = defineModel<DataSourceItem<T>[] | DataSourceItem<T>>({ default: {} })
const cModelValues = computed(() => (Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value]))
const cFlatDataSource = computed(() => cModelValues.value.flatMap((dsItem) => Tree.flatten(dsItem)))

const dExt = defineModel<DataSourceItemExtDict>('dExt', { default: {} })
useDictionary({
    items: cFlatDataSource,
    itemKey: 'id',
    initFn: (item) =>
        ({
            parentId: cFlatDataSource.value.find((aitem) => aitem.children?.some((citem) => citem.id == item.id))?.id,
            selected: false,
            visible: true,
            disabled: false,
            cbxVisible: undefined,
            cbxDisabled: undefined,
        }) as DataSourceItemExt,
    dict: dExt,
})

function cascadeChecked(dsItem: DataSourceItem<T>, dExt: DataSourceItemExtDict) {
    dsItem?.children?.forEach((cdsItem) => {
        if (cdsItem.children) cascadeChecked(cdsItem, dExt)
    })

    const checked = (() => {
        if (dsItem?.children?.every((cdsItem) => dExt[cdsItem.id].checked)) return true
        else if (dsItem?.children?.every((cdsItem) => dExt[cdsItem.id].checked == false)) return false
        else return null
    })()
    dExt[dsItem.id].checked = checked
}

const emit = defineEmits<{
    (e: 'changedChecked', tgtNode: DataSourceItem<T>, checkedNodes: DataSourceItem<T>[], uncheckedNodes: DataSourceItem<T>[]): void
    (e: 'changedSelected', value: DataSourceItem<T>, selected?: DataSourceItemExt['selected']): void
    (e: 'changedExpanded', value: DataSourceItem<T>, expanded?: DataSourceItemExt['expanded']): void
}>()
defineExpose({
    getCheckedItems,
    getSelectedItems,
})

watch(
    () => cFlatDataSource.value.find((dsItem) => dsItem.changedSel),
    (changedItem) => {
        if (changedItem == null) return
        changedItem.changedSel = false
        emit('changedSelected', changedItem, dExt.value[changedItem.id].selected)
    }
)

/************** expose **************/
function getCheckedItems() {
    return cFlatDataSource.value.filter((dsItem) => dExt.value[dsItem.id].checked)
}

function getSelectedItems() {
    return cFlatDataSource.value.filter((dsItem) => dExt.value[dsItem.id].selected)
}

function onChangedChecked(tgtDsItem: DataSourceItem<T>) {
    emit(
        'changedChecked',
        tgtDsItem,
        cFlatDataSource.value.filter((node) => dExt.value[node.id].checked),
        cFlatDataSource.value.filter((node) => !dExt.value[node.id].checked)
    )
}

function onChangedExpanded(tgtDsItem: DataSourceItem<T>, expanded: boolean) {
    emit('changedExpanded', tgtDsItem, expanded)
}
</script>

<template>
    <div class="gtv">
        <BTreeViewItem
            v-for="dsItem in cModelValues"
            :key="dsItem.id"
            :ds-item="dsItem"
            :flat-data-source="cFlatDataSource"
            :depth="1"
            :depth-margin="depthMargin"
            :expandVisible="expandVisible"
            :cbx-visible="dExt[dsItem.id].cbxVisible ?? cbxVisible"
            :cbx-type="cbxType"
            :selectable="selectable"
            :multi-selectable="multiSelectable"
            @changed-checked="(tgtDsItem) => onChangedChecked(tgtDsItem)"
            @changed-expanded="onChangedExpanded"
            v-model:dExt="dExt"
        >
            <template #item="{ item, itemText }">
                <slot name="item" :item="item" :itemText="itemText">
                    <span>{{ itemText }}</span>
                </slot>
            </template>
            <template #append="{ item }">
                <slot name="append" :item="item"> </slot>
            </template>
        </BTreeViewItem>
    </div>
</template>

<style>
.gtv {
    background-color: var(--dark-1);
    color: white;
}
</style>
