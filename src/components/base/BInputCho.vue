<template>
  <input ref="eltInp" type="text" v-model="cValue" @input="onInput" placeholder="검색" />
</template>

<script setup lang="ts">
import { isCho, isJong, divideByJong } from 'hangul-util'
import { computed, nextTick, ref, watch } from 'vue'

interface Props {
  modelValue: string
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
const eltInp = ref({} as HTMLInputElement)
const cValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

watch(
  () => props.modelValue,
  (val) => {
    console.log('watch:', cValue.value)
    eltInp.value.blur()
    setTimeout(() => {
      eltInp.value.focus()
    }, 0)
  }
)

function onInput(e: any) {
  console.log('onInput targetValue:', e.target.value)
  console.log('onInput srchText:', cValue.value)
  const last = e.target.value.slice(-1)

  // 자음군인 경우(ㄶ, ㄻ 등등..)
  if (!isCho(last) && isJong(last)) {
    const lastIdx = e.target.value.length > 1 ? -1 : 0
    cValue.value = e.target.value.slice(0, lastIdx) + divideByJong(last)
  } else {
    cValue.value = e.target.value
  }
}
</script>

<style scoped></style>
