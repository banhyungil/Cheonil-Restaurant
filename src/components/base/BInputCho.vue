<script setup lang="ts">
import { isCho, isJong, divideByJong } from 'hangul-util'

const srchText = defineModel<string>()
const eltInp = ref({} as HTMLInputElement)

function onInput(e: any) {
  console.log('onInput targetValue:', e.target.value)
  const last = e.target.value.slice(-1)

  // 자음군인 경우(ㄶ, ㄻ 등등..)
  if (!isCho(last) && isJong(last)) {
    const lastIdx = e.target.value.length > 1 ? -1 : 0
    srchText.value = e.target.value.slice(0, lastIdx) + divideByJong(last)
  } else {
    srchText.value = e.target.value
  }
}
</script>

<template>
  <input ref="eltInp" type="text" v-model="srchText" @input="onInput" placeholder="검색" />
</template>

<style scoped></style>
