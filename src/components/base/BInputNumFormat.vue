<template>
    <input ref="inpNum" type="text" v-model="cValue" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
    modelValue: number
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const inpNum = ref<HTMLInputElement>()
const cValue = computed({
    get() {
        return props.modelValue.toLocaleString('ko-KR')
    },
    set(val) {
        emit('update:modelValue', Number(val.replace(/\D/g, '')))
        inpNum.value!.value = props.modelValue.toLocaleString('ko-KR')
    },
})
</script>

<style scoped></style>
