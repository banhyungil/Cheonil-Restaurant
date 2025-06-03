<script setup lang="ts">
import _ from 'lodash'
/** @see https://vue3datepicker.com/installation/ */
import { type Slots, type VueDatePickerProps, type PublicMethods, type EmitEvents, type ModelValue } from '@vuepic/vue-datepicker'
// import VueDatePicker from '@vuepic/vue-datepicker'

//ANCHOR - Props
/**
 * @NOTE VueDatePickerProps를 모두 상속 받는 경우 invalid 상태로 진입하는 문제가 있음
 * * 그래서 선택적으로 필요한 속성만 상속 받음
 * */
interface Props extends Pick<VueDatePickerProps, 'range' | 'textInput' | 'teleport' | 'enableTimePicker' | 'autoApply' | 'uid'> {
    locale?: string
    format?: string
}
withDefaults(defineProps<Props>(), {
    locale: 'ko-KR',
    format: 'yy.MM.dd',
})

//ANCHOR - Models
const modelVal = defineModel<ModelValue>({
    default: () => new Date(),
    required: false,
})

//ANCHOR - Emits
// defineEmits<{ [key in EmitEvents]: [] }>()

//ANCHOR - Slots
defineSlots<Slots>()

//ANCHOR - Expose
defineExpose<PublicMethods>()
</script>

<template>
    <VueDatePicker v-bind="{ ...$props, ...$attrs }" v-model="modelVal"> </VueDatePicker>
</template>

<style>
.bdatepicker {
    /* empty */
}
</style>
