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
    /** number 타입 */
    // arrow 버튼 숨김 여부
    hideArrow?: boolean
    // 숫자 포맷팅 (천단위 콤마)
    numberFormat?: boolean
}
const props = withDefaults(defineProps<BInputProps>(), {
    showSearchIcon: false,
    initFocus: false,
    inputDebounceTime: 0,
    activeCancel: true,
    hideArrow: true,
})

//ANCHOR - Models
const modelValue = defineModel<any>({ required: false })

//ANCHOR - Emits
const emit = defineEmits<{
    focus: []
    inputDeb: [val: any]
}>()

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

const cType = computed(() => {
    let type = (attrs.type as string | null) ?? 'text'

    // numberFormat이 활성화되면 항상 text 타입으로 변경
    if (props.numberFormat) {
        type = 'text'
    }

    return type
})

// numberFormat이 활성화된 경우 표시용 값
const cDisplayValue = computed(() => {
    if (!props.numberFormat) return cModelValue.value

    // 포커스 중일 때는 raw 값 표시 (입력 중)
    if (focused.value) {
        const val = cModelValue.value
        return val ?? ''
    }

    // blur 상태일 때 포맷팅
    const val = cModelValue.value
    if (val == null || val === '') return ''

    const numValue = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''))
    if (isNaN(numValue)) return val

    return numValue.toLocaleString('ko-KR')
})

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
    if (el.type == 'number') return

    // numberFormat이 활성화된 경우
    if (props.numberFormat) {
        const rawValue = el.value.replace(/,/g, '') // 콤마 제거
        const cleanValue = rawValue.replace(/[^0-9.-]/g, '') // 숫자, 소수점, 마이너스만 허용

        // 입력 필드의 값도 즉시 업데이트 (텍스트가 입력되지 않도록)
        if (rawValue !== cleanValue) {
            el.value = cleanValue
        }

        if (cleanValue === '' || cleanValue === '-') {
            modelValue.value = null
        } else {
            const numValue = parseFloat(cleanValue)
            modelValue.value = isNaN(numValue) ? null : numValue
        }
        return
    }

    modelValue.value = el.value
    cOnInputDeb.value(el.value)
}

// numberFormat일 때 keydown으로 숫자 외 입력 방지
function onKeyDown(e: KeyboardEvent) {
    if (!props.numberFormat) return

    const key = e.key
    // 허용: 숫자, 백스페이스, 딜리트, 화살표, 탭, Enter, 소수점, 마이너스
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '.', '-']
    const isNumber = /^[0-9]$/.test(key)
    const isAllowed = allowedKeys.includes(key)
    const isCtrlCmd = e.ctrlKey || e.metaKey // Ctrl+C, Ctrl+V 등

    if (!isNumber && !isAllowed && !isCtrlCmd) {
        e.preventDefault()
    }
}

function onCancel() {
    if (attrs.min) modelValue.value = +attrs.min
    else modelValue.value = null
}

function focus() {
    inpComp.value?.$el.focus()
}

function onBlur() {
    if (attrs.type == 'number') {
        if (modelValue.value == '') {
            if (attrs.min) modelValue.value = +attrs.min
            else modelValue.value = null
        } else if (attrs.min && +modelValue.value < +attrs.min) {
            modelValue.value = +attrs.min
        } else if (attrs.max && +modelValue.value > +attrs.max) {
            modelValue.value = +attrs.max
        }
    }
}

console.log('attrs.readonly', attrs.readonly != null ? 'readonly' : 'not readonly')

defineExpose({
    focus,
})
</script>
<template>
    <div
        class="binput relative flex items-center gap-4 text-inherit"
        v-bind="_.pick($attrs, ['style', 'class'])"
        :class="{ focused, readonly: attrs.readonly != null, disabled: attrs.disabled != null, hideArrow }"
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
            :type="cType"
            :style="{ paddingLeft: `${preWidth + 14}px`, paddingRight: `${postWidth + 14}px` }"
            :model-value="cDisplayValue"
            @update:model-value="
                (val) => {
                    if (!props.numberFormat) cModelValue = val
                }
            "
            @input="onInput"
            @keydown="onKeyDown"
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

    &.hideArrow :deep(input[type='number']) {
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
}
</style>
