<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import _ from 'lodash'
import type { DataSourceNode, DataSourceItemExtDict } from './BTree.vue'
import { assert } from '@/utils/common'

//ANCHOR - Props
interface Props {
    dsNode: DataSourceNode<T>
    nodeKey: ValuePropKeys<DataSourceNode<T>>
    nodeTextKey: ValuePropKeys<DataSourceNode<T>>
    flatDsNodes: DataSourceNode<T>[]
    depth: number
    depthMargin?: number
    expandVisible?: boolean
    cbxVisible?: boolean
    cbxType?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    selectable?: boolean
    multiSelectable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    depthMargin: 10,
    expandVisible: true,
    cbxVisible: true,
    cbxType: 'NORMAL',
    selectable: true,
    multiSelectable: false,
})
//ANCHOR - Models
const dExt = defineModel<DataSourceItemExtDict>('dExt', { required: true })

//ANCHOR - Emits
const emit = defineEmits<{
    changedChecked: [dsNode: DataSourceNode<T>, checked?: boolean | null]
    changedExpanded: [dsNode: DataSourceNode<T>, expanded: boolean]
    changedSelected: [dsNode: DataSourceNode<T>, selected: boolean]
}>()

//ANCHOR - Slots
defineSlots<{
    item(props: { item: DataSourceNode<T>; itemText: string }): any
    append(props: { item: DataSourceNode<T> }): any
}>()

//ANCHOR - Start
const getKey = (item: DataSourceNode<T>) => item[props.nodeKey] as PropertyKeyRecord

const cCbxVisibleItem = computed(() => dExt.value[getKey(props.dsNode)].cbxVisible ?? true)

const cExpanded = computed({
    get() {
        return !!dExt.value[getKey(props.dsNode)].expanded
    },
    set(value) {
        const dsNode = props.dsNode
        dExt.value[getKey(props.dsNode)].expanded = value
        console.log('dExt.value', dExt.value)
        emit('changedExpanded', dsNode, value)
    },
})
const cExpandVisible = computed(() => {
    return props.expandVisible && !_.isEmpty(props.dsNode.children) && props.dsNode?.children?.some((cdsNode) => dExt.value[getKey(cdsNode)].visible)
})

const cChecked = computed({
    get() {
        return dExt.value[getKey(props.dsNode)].checked
    },
    set(value) {
        dExt.value[getKey(props.dsNode)].checked = value
    },
})

function recursiveCCheck(dsNode: DataSourceNode<T>, dExt: DataSourceItemExtDict, checked?: boolean | null) {
    dsNode?.children?.forEach((cdsNode) => {
        dExt[getKey(cdsNode)].checked = checked

        if (cdsNode.children) recursiveCCheck(cdsNode, dExt, checked)
    })
}

function recursivePCheck(dsNode: DataSourceNode<T>, dExt: DataSourceItemExtDict, childChecked?: boolean | null) {
    if (childChecked) {
        if (dsNode?.children?.every((cdsNode) => dExt[getKey(cdsNode)].checked)) dExt[getKey(dsNode)].checked = true
        else dExt[getKey(dsNode)].checked = null
    } else {
        if (dsNode?.children?.every((cdsNode) => dExt[getKey(cdsNode)].checked == false)) dExt[getKey(dsNode)].checked = false
        else dExt[getKey(dsNode)].checked = null
    }
    // 달라진 경우 변경 상태 설정.
    if (dExt[getKey(dsNode)].parentId == null) return
    const pdsItem = props.flatDsNodes.find((item) => item[props.nodeTextKey] == dExt[getKey(dsNode)].parentId)!
    recursivePCheck(pdsItem, dExt, dExt[getKey(dsNode)].checked)
}

//ANCHOR - Events
function onChangedChecked() {
    if (props.dsNode.children) recursiveCCheck(props.dsNode, dExt.value, cChecked.value)
    if (dExt.value[getKey(props.dsNode)].parentId) {
        const pdsItem = props.flatDsNodes.find((dsNode) => getKey(dsNode) == dExt.value[getKey(props.dsNode)].parentId)!
        recursivePCheck(pdsItem, dExt.value, cChecked.value)
    }

    emit('changedChecked', props.dsNode, cChecked.value)
}

function onSelectRow(dsNode: DataSourceNode<T>) {
    const ext = dExt.value[getKey(dsNode)]
    // toggle
    const selected = !ext.selected

    if (selected && !props.multiSelectable) {
        // 기존 선택 된 것은 해제 해준다.
        const selDsNode = props.flatDsNodes.find((dsNode) => dExt.value[getKey(dsNode)].selected)
        if (selDsNode) dExt.value[getKey(selDsNode)].selected = false
    }

    ext.selected = selected
    emit('changedSelected', dsNode, selected)
}
</script>

<template>
    <!--
         ban
        상위에서 v-show로 하는 경우는 visible에 관계없이 보여지게 됨. 
        child 생성시 v-show조건에 따라 보여지게 되는 듯.
        v-if로 변경하여서 해결함. visible은 v-if로 하여도 값 변경 빈도가 낮아 성능 문제가 없을 것이라 판단됨.
    -->
    <div class="btree-item" v-if="dExt[getKey(dsNode)].visible">
        <section class="row" :class="{ sel: selectable, on: dExt[getKey(dsNode)].selected, disabled: dExt[getKey(dsNode)].disabled }">
            <section class="expand">
                <BCheckbox v-if="cExpandVisible" v-model="cExpanded" type="EXPAND"></BCheckbox>
            </section>
            <section class="content" @click="onSelectRow(dsNode)">
                <BCheckbox
                    v-if="cbxVisible && cCbxVisibleItem && cbxType == 'NORMAL'"
                    v-model="cChecked"
                    @change="onChangedChecked"
                    :type="cbxType"
                    :disabled="dExt[getKey(dsNode)].cbxDisabled"
                />
                <slot name="item" :item="dsNode" :itemText="assert(dsNode[nodeTextKey]) ?? getKey(dsNode)"> </slot>
                <section class="flex">
                    <slot name="append" :item="dsNode"> </slot>
                    <BCheckbox
                        v-if="cbxVisible && cCbxVisibleItem && cbxType == 'TOGGLE'"
                        v-model="cChecked"
                        @change="onChangedChecked"
                        :type="cbxType"
                        :disabled="dExt[getKey(dsNode)].cbxDisabled"
                    />
                </section>
            </section>
        </section>
        <TransitionGroup name="vue-slide">
            <BTreeItem
                v-show="dExt[getKey(dsNode)].expanded"
                v-for="cdsNode in dsNode.children"
                :key="getKey(cdsNode)"
                :dsNode="cdsNode"
                :nodeKey="nodeKey"
                :nodeTextKey="nodeTextKey"
                :flatDsNodes="flatDsNodes"
                :depth="depth + 1"
                :depthMargin="depthMargin"
                :expand-visible="expandVisible"
                :cbx-visible="dExt[getKey(cdsNode)].cbxVisible ?? cbxVisible"
                :cbx-type="cbxType"
                :selectable="selectable"
                :multi-selectable="multiSelectable"
                :style="{
                    marginLeft: `${depth * depthMargin}px`,
                }"
                @changedSelected="(dsNode, selected) => $emit('changedSelected', dsNode, selected)"
                @changedChecked="(dsNode, checked) => $emit('changedChecked', dsNode, checked)"
                @changedExpanded="(dsNode, expanded) => $emit('changedExpanded', dsNode, expanded)"
                v-model:dExt="dExt"
            >
                <template #item="{ item, itemText }">
                    <slot name="item" :item="item" :itemText="itemText"></slot>
                </template>
                <template #append="{ item }">
                    <slot name="append" :item="item"></slot>
                </template>
            </BTreeItem>
        </TransitionGroup>
    </div>
</template>
<style lang="scss" scoped>
.btree-item {
    @include vue-slide(translateX, -20px, 0.15s);

    & > .row {
        display: flex;
        align-items: center;
        margin: 4px 8px;

        &.disabled > .content {
            pointer-events: none;
            opacity: 0.7;
            background-color: #84838359;
            cursor: none;
        }

        &.sel {
            & > * {
                cursor: pointer;
            }

            & > .content:hover {
                opacity: 0.7;
                color: #fff;
                background-color: rgb(var(--color-primary));
            }

            &.on > .content {
                color: #fff;
                background-color: rgb(var(--color-primary));
            }
        }

        & > .expand {
            width: 12px;

            & > * {
                height: 100%;
            }
        }

        & > .content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: max-content;

            .text {
                display: inline-block;
                padding: 10px;
            }
        }
    }
}
</style>
