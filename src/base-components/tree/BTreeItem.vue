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
    cbxSize?: 'sm' | 'lg'
    selectable?: boolean
    multiSelectable?: boolean
    /** 선택 항목 재선택시 토글 가능 여부 */
    activeSelectToggle?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    depthMargin: 10,
    expandVisible: true,
    cbxVisible: true,
    cbxType: 'NORMAL',
    selectable: true,
    multiSelectable: false,
    activeSelectToggle: true,
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
    item(props: { item: DataSourceNode<T>; itemText: string; expand: () => void }): any
    append(props: { item: DataSourceNode<T> }): any
}>()

//ANCHOR - Start
const getKey = (item: DataSourceNode<T>) => {
    return item[props.nodeKey] as PropertyKeyRecord
}

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

/** 재귀 자식 체크 */
function recursiveCCheck(dsNode: DataSourceNode<T>, dExt: DataSourceItemExtDict, checked?: boolean | null) {
    dsNode?.children?.forEach((cdsNode) => {
        dExt[getKey(cdsNode)].checked = checked

        if (cdsNode.children) recursiveCCheck(cdsNode, dExt, checked)
    })
}

/** 재귀 부모 체크 */
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
    const pdsItem = props.flatDsNodes.find((item) => item[props.nodeKey] == dExt[getKey(dsNode)].parentId)!
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
    if (props.selectable == false) {
        expand()
    }
    const ext = dExt.value[getKey(dsNode)]

    // toggle
    const selected = (() => {
        if (props.activeSelectToggle) return !ext.selected
        else return true
    })()

    if (selected && !props.multiSelectable) {
        // 기존 선택 된 것은 해제 해준다.
        const selDsNode = props.flatDsNodes.find((dsNode) => dExt.value[getKey(dsNode)].selected)
        if (selDsNode) dExt.value[getKey(selDsNode)].selected = false
    }

    ext.selected = selected
    emit('changedSelected', dsNode, selected)
}

function expand() {
    cExpanded.value = !cExpanded.value
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
        <section class="row" :class="{ selectable, on: dExt[getKey(dsNode)].selected, disabled: dExt[getKey(dsNode)].disabled }">
            <section class="left">
                <section class="expand" :class="{ exist: cExpandVisible }">
                    <BCheckbox v-if="cExpandVisible" v-model="cExpanded" type="EXPAND"></BCheckbox>
                </section>
                <BButton class="content" @click="onSelectRow(dsNode)" :class="[cbxType]">
                    <BCheckbox
                        v-if="cbxVisible && cCbxVisibleItem && cbxType == 'NORMAL'"
                        v-model="cChecked"
                        :size="cbxSize"
                        @change="onChangedChecked"
                        :type="cbxType"
                        :disabled="dExt[getKey(dsNode)].cbxDisabled"
                    />
                    <slot name="item" :item="dsNode" :itemText="assert(dsNode[nodeTextKey]) ?? getKey(dsNode)" :expand="expand"></slot>
                    <section class="flex">
                        <BCheckbox
                            v-if="cbxVisible && cCbxVisibleItem && cbxType == 'TOGGLE'"
                            v-model="cChecked"
                            :size="cbxSize"
                            @change="onChangedChecked"
                            :type="cbxType"
                            :disabled="dExt[getKey(dsNode)].cbxDisabled"
                        />
                    </section>
                </BButton>
            </section>
            <div class="right append ml-2"><slot name="append" :item="dsNode"> </slot></div>
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
                :cbxSize="cbxSize"
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
                <template #item="{ item, itemText, expand }">
                    <slot name="item" :item="item" :itemText="itemText" :expand="expand"></slot>
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
    @apply flex flex-col;

    & > .row {
        display: flex;
        justify-content: space-between;
        margin: 4px 8px;

        & > .left {
            @apply flex h-full flex-1;

            & > * {
                @apply flex items-center justify-center;
            }

            & > .expand {
                @apply w-6 rounded-md;

                cursor: initial;

                .bcheckbox {
                    @apply m-0 h-full w-full;
                }

                &.exist:hover {
                    @apply bg-primary text-secondary opacity-70;
                }
            }

            & > .content {
                @apply flex h-full items-center justify-start rounded-md border-none p-0 hover:transform-none hover:bg-inherit;

                width: max-content;

                .text {
                    display: inline-block;
                    padding: 10px;
                }

                &.TOGGLE {
                    @apply justify-between;
                }
            }
        }

        &.disabled > .left {
            & > .content {
                pointer-events: none;
                opacity: 0.7;
                background-color: #84838359;
                cursor: none;
            }
        }

        &.selectable > .left {
            & > .content {
                @apply cursor-pointer focus:ring-4 focus:ring-primary/50;

                &:hover {
                    opacity: 0.7;
                    color: rgb(var(--color-secondary));
                    background-color: rgb(var(--color-primary));
                }
            }
        }

        &.selectable.on > .left > .content {
            @apply bg-primary text-secondary hover:bg-primary hover:bg-primary/60 active:bg-primary/80;
        }

        & > .right.append {
            @apply flex items-center justify-center;
        }
    }
}
</style>
