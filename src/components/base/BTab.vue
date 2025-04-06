<script setup lang="ts" generic="T extends Record<string, unknown>">
import { assert } from '@/utils/common'
import { VueDraggableNext } from 'vue-draggable-next'

interface Props {
    /** 전체 버튼 표시 여부 */
    tabKey: ValidObjectKey<T>
    tabName: string
    showAll?: boolean
    draggable?: boolean
}

//ANCHOR - Props, Models, Emits
withDefaults(defineProps<Props>(), {
    draggable: false,
    showAll: false,
})
const tabs = defineModel<T[]>({ required: true })

defineEmits<{
    clickTab: [item: T | 'ALL']
}>()

const items = ref([
    { seq: 1, name: 'ban', age: 2 },
    { seq: 2, name: 'ban2', age: 3 },
])
const dict = ref({ 1: { isOnline: true } })

// get + key 함수를 이용하는건?

// 선택된 아이템은 어떻게 처리하나? 상위 컴포넌트랑 어떻게 통신할까
// 선택이란것을 v-model로 구현할까 아니면 내부에서 처리할까
// 선택된것은 상위에서도 알 필요가 있을 것같다.
// props로하냐 v-model로 하냐 그것이 문제다
// props는 데이터가 변경이 안되는 경우이다.
// v-model로 하면 데이터가 변경되는 경우이다.
// v-model로 하면 원본이 변경되지 않아야하는 법
</script>

<template>
    <section class="btab">
        <section class="tabs">
            <button @click="() => $emit('clickTab', 'ALL')" class="tab tab-all">
                <span>{{ '전체' }}</span>
            </button>
            <VueDraggableNext v-model="tabs" :animation="500" :disabled="!draggable">
                <template v-for="tab in tabs" :key="assert<PropertyKey>(tab[tabKey])">
                    <slot name="tab" :value="tab">
                        <button class="tab" @click="() => $emit('clickTab', tab)"></button>
                    </slot>
                </template>
            </VueDraggableNext>
            <slot name="postTab"> </slot>
        </section>
        <section class="list">
            <slot name="list"></slot>
        </section>
    </section>
</template>

<style lang="scss"></style>
