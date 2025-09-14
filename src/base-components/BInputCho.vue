<script setup lang="ts">
import { useFocus } from '@vueuse/core'
import { isCho, isJong, divideByJong } from 'hangul-util'
import { v4 as Uuid } from 'uuid'

const srchText = defineModel<string>()
const eltInp = ref<HTMLInputElement>()
const { focused: inpFocused } = toRefs(useFocus(eltInp))

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

function onCancel() {
    srchText.value = ''
    nextTick(() => eltInp.value?.focus())
}
const uuid = 'a' + Uuid()
defineExpose({ eltInp })
</script>

<template>
    <div class="b-input-cho" :class="{ focus: inpFocused }">
        <label :for="uuid"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></label>
        <input
            class="b-input-cho"
            :id="uuid"
            ref="eltInp"
            type="text"
            @keyup.esc="() => (srchText = '')"
            v-model="srchText"
            @input="onInput"
            v-bind="$attrs"
            placeholder="검색"
        />
        <button @click="onCancel">
            <font-awesome-icon :icon="['fas', 'circle-x']" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
.b-input-cho {
    border: 1px solid #000;
    border-radius: 8px;
    padding: 4px 6px;
    width: 220px;
    display: flex;
    align-items: center;

    & > label {
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    &.focus > label {
        color: rgb(var(--color-primary));
    }

    & > input {
        padding-inline-start: 6px;
        border: none;
        width: 100%;

        &:focus {
            outline: none;
        }
    }

    & > button {
        opacity: 0.6;

        &:hover {
            color: rgb(var(--color-danger));
            background-color: transparent;
            opacity: 1;
        }
    }

    @include vueSlide(10px);
}
</style>
