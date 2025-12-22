<script setup lang="ts">
import _ from 'lodash'
import FormInput, { type FormInputProps } from '@/base-components/Form/FormInput.vue'
import { useElementSize, useFocus } from '@vueuse/core'

defineOptions({
    inheritAttrs: false,
})

//ANCHOR - Props, models
export interface BInputProps extends FormInputProps {
    showSearchIcon?: boolean
    // 이 컴포넌트가 처음 렌더링될 때 포커스를 맞출지 여부
    initFocus?: boolean
    label?: string
    // 입력값이 변경될 때 디바운스 시간 (ms)BCheckboxv
    inputDebounceTime?: number
    activeCancel?: boolean
}
const props = withDefaults(defineProps<BInputProps>(), {
    showSearchIcon: false,
    initFocus: false,
    inputDebounceTime: 0,
    activeCancel: true,
    hideArrow: false,
})

//ANCHOR - Models
const modelValue = defineModel<any>({ required: false })

export interface BInputEmits {
    focus: []
    inputDeb: [val: any]
    cancel: []
}

//ANCHOR - Emits
const emit = defineEmits<BInputEmits>()
watch(
    () => props.value,
    () => {
        if (props.value) modelValue.value = props.value
    },
    { immediate: true }
)

const cModelValue = computed({
    get() {
        return modelValue.value ?? props.value ?? ''
    },
    set(value) {
        modelValue.value = value
    },
})

onMounted(() => {
    if (props.initFocus) inpComp.value?.$el.focus()
})
//ANCHOR - Start
const id = _.uniqueId()
const attrs = useAttrs()

const inpComp = ref<InstanceType<typeof FormInput>>()
const absolutePreEl = ref<HTMLElement>()
const absolutePostEl = ref<HTMLElement>()
const { focused } = useFocus(computed(() => inpComp.value?.$el))
const { width: preWidth } = useElementSize(absolutePreEl)
const { width: postWidth } = useElementSize(absolutePostEl)

const cPlaceholder = computed(() => {
    const result = typeof attrs.placeholder == 'string' ? attrs.placeholder : null
    return result ?? (props.showSearchIcon ? '검색어를 입력하세요' : '')
})

const cOnInputDeb = computed(() =>
    _.debounce((text: string) => {
        if (props.inputDebounceTime > 0) emit('inputDeb', text)
    }, props.inputDebounceTime)
)

function onInput(e: Event) {
    const el = e.target as HTMLInputElement
    cOnInputDeb.value(el.value)
}

function onCancel() {
    modelValue.value = null
    emit('cancel')
}

function focus() {
    inpComp.value?.$el.focus()
}

console.log('attrs.readonly', attrs.readonly != null ? 'readonly' : 'not readonly')

defineExpose({
    focus,
    focused,
})
</script>
<template>
    <div
        class="binput relative flex h-10 items-center gap-4 border-2 text-inherit"
        v-bind="_.pick($attrs, ['style', 'class'])"
        :class="{ focused, readonly: attrs.readonly != null, disabled: attrs.disabled != null }"
    >
        <label v-if="props.label" :for="id" class="text-sm font-bold">{{ label }}</label>
        <div ref="absolutePreEl" class="absolute inset-y-0 left-2 flex items-center gap-2">
            <slot name="prepend"></slot>
        </div>
        <FormInput
            class="inp h-full flex-1 bg-inherit py-3"
            :id="id"
            ref="inpComp"
            v-bind="_.omit($attrs, ['style', 'class', 'type'])"
            :style="{ paddingLeft: `${preWidth + 14}px`, paddingRight: `${postWidth + 14}px` }"
            v-model="cModelValue"
            @input="onInput"
            @focus="$emit('focus')"
            @blur="onBlur"
            :placeholder="cPlaceholder"
            title=""
            autocomplete="off"
        ></FormInput>
        <div ref="absolutePostEl" class="absolute inset-y-0 right-2 gap-2 flex-center">
            <BButton v-if="activeCancel" @click="onCancel" class="cancel-btn"><span>X</span></BButton>
            <slot name="postpend"> </slot>
            <font-awesome-icon v-if="showSearchIcon" class="search-icon" :icon="['fas', 'magnifying-glass']" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.binput {
    .absolute {
        .cancel-btn {
            @apply flex h-4 w-4 rounded-[50%] p-2 text-xs transition flex-center hover:border-danger hover:bg-red-600 hover:font-bold hover:text-secondary;

            &:hover span {
                margin-right: 1.3px;
                margin-bottom: 1.5px;
            }
            visibility: hidden;
        }

        .search-icon {
            @apply inset-y-0 right-0 my-auto w-4 transition;
        }
    }

    &:hover {
        .cancel-btn {
            @apply visible;
        }

        &.readonly,
        &.disabled {
            .cancel-btn {
                @apply hidden;
            }
        }
    }

    &.focused {
        .search-icon {
            @apply text-primary;
        }
    }
}
</style>
