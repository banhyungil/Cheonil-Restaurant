<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import _ from 'lodash'

interface Props {
    /** 최초 값, foucus out시에도 해당 값으로 복원됨 */
    initValue?: any
}
const props = defineProps<Props>()
// 필요한 event 추가
const emit = defineEmits<{
    focusout: [val: any]
}>()

const attrs = useAttrs()
const exludeKeys = ['style', 'class']
const cAttrs = computed(() => _.omit(attrs, exludeKeys))

const inpVal = ref(props.initValue ?? attrs['value'])
/**
 * @type {import('vue').Ref<HTMLInputElement>}
 */
const inpElt = ref()
const editable = ref(false)

function onEditInp() {
    editable.value = true
    nextTick(() => {
        inpElt.value.focus()
    })
}

function onFocusout() {
    emit('focusout', inpVal.value)

    editable.value = false
    inpVal.value = props.initValue
}
</script>

<template>
    <div class="bedit-toggle-inp" :class="{ editable }">
        <input v-if="editable" class="inp" ref="inpElt" v-model="inpVal" v-bind="cAttrs" @focusout="onFocusout" />
        <template v-else>
            <span class="text">{{ inpVal }}</span>
            <button @click="onEditInp" class="btn-edit">
                <font-awesome-icon :icon="['fas', 'pen']" />
            </button>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.bedit-toggle-inp {
    border: none;
    font-size: inherit;
    padding: 0;

    .inp {
        display: inline-block;
        width: 100%;
        height: 100%;
        padding: 3px;
        font-size: inherit;

        &:focus {
            border: 3px solid rgb(var(--color-primary) / 50%);
        }
    }

    .btn-edit {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: inherit;
        color: inherit;
        display: none;
        padding: 4px;

        &:hover {
            font-weight: bold;
            color: var(--point-color);
        }
    }

    &:hover .btn-edit {
        display: inherit;
    }
}
</style>
