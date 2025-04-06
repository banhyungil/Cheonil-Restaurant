<template>
    <label class="grdo" :class="{ disabled }" :for="uuid">
        <label class="inp-c" tabindex="0" :for="uuid">
            <input type="radio" :id="uuid" :checked="checked" v-model="modelValue" :value="value" :disabled="disabled" :name="name" @change="onChange" />
            <div class="checkmark"></div>
        </label>
        <label v-if="label" style="margin-left: 4px" :for="uuid">{{ label }}</label>
    </label>
</template>

<script setup lang="ts">
import { getUuid } from '@/utils/common'

interface Props {
    value?: any
    name?: string
    label?: string
    checked?: boolean
    disabled?: boolean
}
defineProps<Props>()
const modelValue = defineModel({ default: false })

const emit = defineEmits(['change'])
const uuid = getUuid(true)

const onChange = (e: Event) => {
    emit('change', e)
}
</script>

<style lang="scss" scoped>
.grdo {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
    cursor: pointer;

    input[type='radio'] {
        margin: 0;
        display: none;
    }

    .inp-c {
        position: relative;
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 1px solid #8f8f8f;
        background-color: rgb(var(--color-primary) / 90%);
        border-radius: 50%;
        cursor: pointer;

        & > .checkmark {
            display: none;
        }

        & > input[type='radio']:checked + .checkmark {
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 60%;
            width: 60%;
            background-color: #fff;
            border-radius: 50%;
        }
    }

    &.disabled {
        cursor: not-allowed;

        .inp-c {
            cursor: not-allowed;
            background-color: rgb(132 131 131 / 70%);
        }
    }
}
</style>
