<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import _ from 'lodash'
import type { DataSourceItem, DataSourceItemExt, DataSourceItemExtDict } from './BTreeView.vue'

/**
 * props 변경 금지 원칙은 지키지 않음, selected, expanded, checked를 직접 변경하기 위함.
 * 변경된 item들은 change[*] flag를 이용하여 마킹함.
 * * GTreeView에서 해당 flag를 watch 하여 변경된 상태에 따른 이벤트를 발생시킴
 */
interface Props {
    dsItem: DataSourceItem<T>
    flatDataSource: DataSourceItem<T>[]
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

const emit = defineEmits<{
    changedChecked: [dsItem: DataSourceItem<T>]
    changedExpanded: [dsItem: DataSourceItem<T>, expanded: boolean]
}>()
defineSlots<{
    item(props: { item: DataSourceItem<T>; itemText: string }): any
    append(props: { item: DataSourceItem<T> }): any
}>()
const dExt = defineModel<Record<any, DataSourceItemExt>>('dExt', { required: true })

const cCbxVisibleItem = computed(() => dExt.value[props.dsItem.id].cbxVisible ?? true)

const cExpanded = computed({
    get() {
        return !!dExt.value[props.dsItem.id].expanded
    },
    set(value) {
        const dsItem = props.dsItem
        dExt.value[props.dsItem.id].expanded = value
        console.log('dExt.value', dExt.value)
        emit('changedExpanded', dsItem, value)
    },
})
const cExpandVisible = computed(() => {
    return props.expandVisible && !_.isEmpty(props.dsItem.children) && props.dsItem?.children?.some((cdsItem) => dExt.value[cdsItem.id].visible)
})

const cChecked = computed({
    get() {
        return dExt.value[props.dsItem.id].checked
    },
    set(value) {
        dExt.value[props.dsItem.id].checked = value
    },
})

function recursiveCCheck(dsItem: DataSourceItem<T>, dExt: DataSourceItemExtDict, checked?: boolean | null) {
    dsItem?.children?.forEach((cdsItem) => {
        dExt[cdsItem.id].checked = checked

        if (cdsItem.children) recursiveCCheck(cdsItem, dExt, checked)
    })
}

function recursivePCheck(dsItem: DataSourceItem<T>, dExt: DataSourceItemExtDict, childChecked?: boolean | null) {
    if (childChecked) {
        if (dsItem?.children?.every((cdsItem) => dExt[cdsItem.id].checked)) dExt[dsItem.id].checked = true
        else dExt[dsItem.id].checked = null
    } else {
        if (dsItem?.children?.every((cdsItem) => dExt[cdsItem.id].checked == false)) dExt[dsItem.id].checked = false
        else dExt[dsItem.id].checked = null
    }
    // 달라진 경우 변경 상태 설정.
    if (dExt[dsItem.id].parentId == null) return
    const pdsItem = props.flatDataSource.find((item) => item.id == dExt[dsItem.id].parentId)!
    recursivePCheck(pdsItem, dExt, dExt[dsItem.id].checked)
}

function onChangedChecked() {
    if (props.dsItem.children) recursiveCCheck(props.dsItem, dExt.value, cChecked.value)
    if (dExt.value[props.dsItem.id].parentId) {
        const pdsItem = props.flatDataSource.find((dsItem) => dsItem.id == dExt.value[props.dsItem.id].parentId)!
        recursivePCheck(pdsItem, dExt.value, cChecked.value)
    }

    emit('changedChecked', props.dsItem)
}

function onSelectRow(dsItem: DataSourceItem<T>) {
    const ext = dExt.value[dsItem.id]
    const selected = !ext.selected
    if (selected && !props.multiSelectable) {
        // 기존 선택 된 것은 해제 해준다.
        const selDsItem = props.flatDataSource.find((fdsItem) => dExt.value[fdsItem.id].selected)
        if (selDsItem) ext.selected = false
    }

    ext.selected = selected
    dsItem.changedSel = true
}
</script>

<template>
    <!--
         ban
        상위에서 v-show로 하는 경우는 visible에 관계없이 보여지게 됨. 
        child 생성시 v-show조건에 따라 보여지게 되는 듯.
        v-if로 변경하여서 해결함. visible은 v-if로 하여도 값 변경 빈도가 낮아 성능 문제가 없을 것이라 판단됨.
    -->
    <div class="gtvi" v-if="dExt[dsItem.id].visible">
        <div class="row" :class="{ sel: selectable, on: dExt[dsItem.id].selected, disabled: dExt[dsItem.id].disabled }">
            <div class="expand-c">
                <BCheckbox v-if="cExpandVisible" v-model="cExpanded" type="EXPAND"></BCheckbox>
            </div>
            <div class="content" @click="onSelectRow(dsItem)">
                <BCheckbox
                    v-if="cbxVisible && cCbxVisibleItem && cbxType == 'NORMAL'"
                    v-model="cChecked"
                    @change="onChangedChecked"
                    :type="cbxType"
                    :disabled="dExt[dsItem.id].cbxDisabled"
                />
                <slot name="item" :item="dsItem" :itemText="dsItem.text ?? dsItem.id"> </slot>
                <div class="tw-flex">
                    <slot name="append" :item="dsItem"> </slot>
                    <BCheckbox
                        v-if="cbxVisible && cCbxVisibleItem && cbxType == 'TOGGLE'"
                        v-model="cChecked"
                        @change="onChangedChecked"
                        :type="cbxType"
                        :disabled="dExt[dsItem.id].cbxDisabled"
                    />
                </div>
            </div>
        </div>
        <TransitionGroup name="vue-slide">
            <BTreeViewItem
                v-show="dExt[dsItem.id].expanded"
                v-for="cdsItem in dsItem.children"
                :key="cdsItem.id"
                :ds-item="cdsItem"
                :flat-data-source="flatDataSource"
                :depth="depth + 1"
                :expand-visible="expandVisible"
                :cbx-visible="dExt[cdsItem.id].cbxVisible ?? cbxVisible"
                :cbx-type="cbxType"
                :selectable="selectable"
                :multi-selectable="multiSelectable"
                :style="{
                    marginLeft: `${depth * depthMargin}px`,
                }"
                @changed-checked="(tgtItem) => $emit('changedChecked', tgtItem)"
                v-model:dExt="dExt"
            >
                <template #item="{ item, itemText }">
                    <slot name="item" :item="item" :itemText="itemText"></slot>
                </template>
                <template #append="{ item }">
                    <slot name="append" :item="item"></slot>
                </template>
            </BTreeViewItem>
        </TransitionGroup>
    </div>
</template>
<style lang="scss">
.gtvi {
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
                background-color: var(--point-color);
            }

            &.on > .content {
                background-color: var(--point-color);
            }
        }

        & > .expand-c {
            width: 12px;

            & > * {
                height: 100%;
            }
        }

        & > .content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;

            .text {
                display: inline-block;
                padding: 10px;
            }
        }
    }
}
</style>
