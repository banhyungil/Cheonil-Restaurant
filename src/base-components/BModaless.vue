<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import _ from 'lodash'

defineOptions({
    inheritAttrs: false,
})

// Props
interface Props {
    title?: string
    activeClose?: boolean
}
withDefaults(defineProps<Props>(), {
    title: '',
    activeClose: true,
})

const emit = defineEmits<{
    close: []
}>()

//ANCHOR - Start
onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

const bmodalessEl = ref<HTMLElement | null>(null)
const titlebarEl = ref<HTMLElement | null>(null)
const { x, y, style } = useDraggable(bmodalessEl, { handle: titlebarEl })

// v-model
const isOpen = defineModel<boolean>({ required: true })

// ESC 키 닫기 (선택)
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') isOpen.value = false
}

watch(isOpen, async () => {
    if (isOpen.value) {
        // element가 준비되기 전에 위치 조정이 일어날 수 있으므로, 다음 틱에서 실행
        await nextTick()

        // 모달이 열릴 때 위치 조정
        x.value = window.innerWidth / 2 - bmodalessEl.value!.offsetWidth / 2
        y.value = window.innerHeight / 2 - bmodalessEl.value!.offsetHeight / 2
    } else {
        emit('close')
    }
})
</script>

<template>
    <Teleport to="body">
        <transition name="fade">
            <div
                v-if="isOpen"
                ref="bmodalessEl"
                class="bmodaless fixed z-10 flex h-[30vh] w-[30vw] flex-col bg-dark p-2 text-white"
                v-bind="_.pick($attrs, ['style', 'class'])"
                :style="style"
            >
                <!-- Title + 닫기 버튼 -->
                <div ref="titlebarEl" class="titlebar mb-2 flex items-center justify-between border-b-2 border-lightgray pb-1">
                    <slot name="title">
                        <h2 class="ml-2 text-lg font-bold">{{ title }}</h2>
                    </slot>
                    <BButton variant="danger" v-if="activeClose" @click="isOpen = false">
                        <font-awesome-icon :icon="['fas', 'x']" />
                    </BButton>
                </div>

                <!-- 본문 -->
                <div class="content mb-2 flex-1">
                    <slot name="content" />
                </div>

                <!-- 푸터 -->
                <div class="mt-2 flex justify-end border-t-2 border-lightgray pt-1">
                    <slot name="footer" />
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<style lang="scss" scoped>
.bmodaless {
    .content {
        @apply overflow-y-auto;
    }
    // empty
}
</style>
