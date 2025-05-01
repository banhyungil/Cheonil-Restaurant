<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import Tree from '@/utils/tree'
import { assert } from '@/utils/common'

//ANCHOR - Types
export type DataSourceNode<T extends object> = T & {
    children?: DataSourceNode<T>[]
}

export interface DataSourceNodeExt {
    parentId?: PropertyKeyRecord | null
    checked?: boolean | null
    selected?: boolean
    expanded?: boolean
    visible?: boolean
    disabled?: boolean
    cbxVisible?: boolean
    cbxDisabled?: boolean
}

export type DataSourceItemExtDict = Record<PropertyKeyRecord, DataSourceNodeExt>

//ANCHOR - Props
interface Props<T extends object> {
    dsNodes: DataSourceNode<T>[]
    nodeKey: ValuePropKeys<DataSourceNode<T>>
    nodeTextKey: ValuePropKeys<DataSourceNode<T>>
    depthMargin?: number
    expandedAll?: boolean
    expandVisible?: boolean
    cbxVisible?: boolean
    cbxType?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    selectable?: boolean
    multiSelectable?: boolean
    initFn?: (item: DataSourceNode<T>) => DataSourceNodeExt
}

const props = withDefaults(defineProps<Props<T>>(), {
    depthMargin: 10,
    expandedAll: false,
    expandVisible: true,
    cbxVisible: true,
    cbxType: 'NORMAL',
    selectable: true,
    multiSelectable: false,
    initFn: () => ({}),
})

//ANCHOR - Models
const dExt = defineModel<DataSourceItemExtDict>('dExt', { default: {} })

//ANCHOR - Emits
const emit = defineEmits<{
    changedChecked: [tgtNode: DataSourceNode<T>, checkedNodes: DataSourceNode<T>[], uncheckedNodes: DataSourceNode<T>[]]
    changedSelected: [value: DataSourceNode<T>, selected?: DataSourceNodeExt['selected']]
    changedExpanded: [value: DataSourceNode<T>, expanded?: DataSourceNodeExt['expanded']]
}>()

//ANCHOR - Start
const getKey = (item: DataSourceNode<T>) => item[props.nodeKey] as PropertyKeyRecord

const cDsNodes = computed(() => (Array.isArray(props.dsNodes) ? props.dsNodes : [props.dsNodes]))
const cFlatNodes = computed(() => cDsNodes.value.flatMap((node) => Tree.flatten(node)))

useDictionary({
    items: cFlatNodes,
    itemKey: props.nodeKey,
    initFn: (item) => {
        const pnode = cFlatNodes.value.find((aitem) => aitem.children?.some((cnode) => getKey(cnode) == getKey(item)))
        return {
            parentId: pnode && pnode[props.nodeKey],
            selected: false,
            visible: true,
            disabled: false,
            cbxVisible: undefined,
            cbxDisabled: undefined,
            ...props.initFn(item),
        } as DataSourceNodeExt
    },
    dict: dExt,
})

defineExpose({
    getCheckedItems,
    getSelectedItems,
})

//ANCHOR - Expose
function getCheckedItems() {
    return cFlatNodes.value.filter((node) => dExt.value[getKey(node)].checked)
}

function getSelectedItems() {
    return cFlatNodes.value.filter((node) => dExt.value[getKey(node)].selected)
}

//ANCHOR - Events
function onChangedChecked(tgtDsItem: DataSourceNode<T>) {
    emit(
        'changedChecked',
        tgtDsItem,
        cFlatNodes.value.filter((node) => dExt.value[getKey(node)].checked),
        cFlatNodes.value.filter((node) => !dExt.value[getKey(node)].checked),
    )
}

function onChangedExpanded(tgtDsItem: DataSourceNode<T>, expanded: boolean) {
    emit('changedExpanded', tgtDsItem, expanded)
}

function onChangedSelected(tgtDsItem: DataSourceNode<T>, selected: boolean) {
    emit('changedSelected', tgtDsItem, selected)
}
</script>

<template>
    <div class="btree">
        <BTreeItem
            v-for="dsNode in cDsNodes"
            :key="assert(dsNode[nodeKey])"
            v-model:dExt="dExt"
            :dsNode="dsNode"
            :nodeKey="nodeKey"
            :nodeTextKey="nodeTextKey"
            :flatDsNodes="cFlatNodes"
            :depth="1"
            :depth-margin="depthMargin"
            :expandVisible="expandVisible"
            :cbx-visible="cbxVisible"
            :cbx-type="cbxType"
            :selectable="selectable"
            :multiSelectable="multiSelectable"
            @changedChecked="(tgtDsNode) => onChangedChecked(tgtDsNode)"
            @changedExpanded="onChangedExpanded"
            @changedSelected="onChangedSelected"
        >
            <template #item="{ item, itemText }">
                <slot name="item" :item="item" :itemText="itemText">
                    <span>{{ itemText }}</span>
                </slot>
            </template>
            <template #append="{ item }">
                <slot name="append" :item="item"> </slot>
            </template>
        </BTreeItem>
    </div>
</template>

<style lang="scss" scoped>
.btree {
    // background-color: var(--dark-1);
    // color: white;
}
</style>
