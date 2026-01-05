<script setup lang="ts">
import type { BInputProps } from './BInput.vue'

//ANCHOR - Props
interface Props extends BInputProps {
    hideArrow?: boolean
    // 숫자 포맷팅 (천단위 콤마)
    numberFormat?: boolean
}
const props = defineProps<Props>()

//ANCHOR - Models
const modelValue = defineModel<any>({ required: false })

//ANCHOR - Composables
const attrs = useAttrs()

const cType = computed(() => {
    let type = (attrs.type as string | null) ?? 'text'

    // numberFormat이 활성화되면 항상 text 타입으로 변경
    if (props.numberFormat) {
        type = 'text'
    }

    return type
})

//ANCHOR - Start
const inpComp = useTemplateRef('inpComp')

const cModelValue = computed({
    get() {
        return modelValue.value ?? props.value ?? ''
    },
    set(value) {
        modelValue.value = value
    },
})

// numberFormat이 활성화된 경우 표시용 값
const cDisplayValue = computed(() => {
    if (!props.numberFormat) return cModelValue.value

    // 포커스 중일 때는 raw 값 표시 (입력 중)
    if (inpComp.value?.focused) {
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

function onCancel() {
    if (attrs.min) modelValue.value = +attrs.min
    else modelValue.value = null
}
</script>

<template>
    <BInput
        class="binput-number"
        ref="inpComp"
        :type="cType"
        :model-value="cDisplayValue"
        @update:model-value="(val: string | number) => (cModelValue = +val)"
        @keydown="onKeyDown"
        @cancel="onCancel"
        @blur="onBlur"
        @input="onInput"
        :class="hideArrow"
    ></BInput>
</template>

<style scoped>
.binput-number {
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
