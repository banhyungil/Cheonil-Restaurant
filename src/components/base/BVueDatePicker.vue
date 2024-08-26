<template>
  <VueDatePicker v-bind="{ ...$props, ...$attrs }" locale="ko-KR">
    <template v-for="(_, name) in $slots" v-slot="props">
      <slot :name="name" v-bind="props ?? {}"></slot>
    </template>
  </VueDatePicker>
</template>

<script setup lang="ts">
import VueDatePicker, { type VueDatePickerProps } from '@vuepic/vue-datepicker'
import { defineProps } from 'vue'

/**
 * pass slots throw to a child component
 * @see https://vue-land.github.io/faq/forwarding-slots
 */

// VueDatePicker의 props 타입 추출

// 래퍼 컴포넌트의 props 정의 (기존 타입 확장)
defineProps<VueDatePickerProps>()
</script>

<style scoped></style>
