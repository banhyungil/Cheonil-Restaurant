<template>
    <label
        class="gcbx"
        :class="[cClass, { checked: copyModelValue === true || (Array.isArray(copyModelValue) && copyModelValue.includes(value)), disabled }]"
        tabindex="0"
        :for="uuid"
    >
        <input ref="inpElt" :id="uuid" type="checkbox" v-model="copyModelValue" @change="onChange" :value="value" :disabled="disabled" />
        <slot>
            <template v-if="type == 'NORMAL'">
                <div v-if="Array.isArray(copyModelValue) ? copyModelValue.includes(value) === true : copyModelValue === true" class="check"></div>
                <font-awesome-icon v-if="copyModelValue === null" :icon="['fas', 'square']" class="m-state" />
            </template>
            <FontAwesomeIcon v-else-if="type == 'EXPAND'" :icon="copyModelValue ? ['fas', 'caret-down'] : ['fas', 'caret-right']" class="icon" />
            <div v-else-if="type == 'TOGGLE'" class="btn"></div>
        </slot>
    </label>
</template>

<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { v4 as uuidv4 } from 'uuid'

const cClass = computed(() => {
    return props.type.toLowerCase()
})

const inpElt = ref<HTMLInputElement>()

interface Props {
    modelValue: any
    value?: any
    type?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    type: 'NORMAL',
    disabled: false,
})

const emit = defineEmits(['update:modelValue', 'change'])

const uuid = 'a' + uuidv4()

const copyModelValue = computed({
    get() {
        return props.modelValue
    },
    set(checked) {
        emit('update:modelValue', checked)
    },
})

const onChange = (e: Event) => {
    emit('change', e)
}
</script>

<style lang="scss" scoped>
.gcbx {
    display: inline-block;
    margin: 0 2px;
    cursor: pointer;

    input[type='checkbox'] {
        margin: 0;
        display: none;
    }

    &.normal {
        width: 16px;
        height: 16px;
        border: 2px solid #8f8f8f;
        border-radius: 4px;
        display: inline-block;
        position: relative;
        cursor: pointer;

        &.checked {
            border: none;
        }

        &:focus {
            --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
            --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);

            outline: 2px solid transparent;
            outline-offset: 2px;
            box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }

        .gcbx {
            display: inline-block;
            margin: 0 2px;
        }

        .gcbx input[type='checkbox'] {
            margin: 0;
            display: none;
        }

        & > div {
            display: none;
        }

        input:checked + div {
            width: 100%;
            height: 100%;
            font-size: 14px;
            color: #c8c8c8;
            background-color: rgb(var(--color-primary));
            display: block;
        }

        input:checked + div.check {
            background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
            border-radius: 4px;
        }

        & > * {
            width: 100%;
            height: 100%;
            border-radius: 4px;
            overflow: hidden;
            position: absolute;
            top: 0;
            left: 0;
        }

        & > .m-state {
            width: 80%;
            height: 80%;
            margin: 1px 0 0 1.4px;
            font-size: 12px;

            // color: #c8c8c8;
            color: rgb(var(--color-primary));
            display: block;
        }
    }

    &.expand {
        & > .icon {
            font-size: 14px;
            cursor: pointer;

            &:hover {
                opacity: 0.7;
            }
        }

        & > input[type='checkbox']:checked ~ .icon {
            color: rgb(var(--color-primary));
        }
    }

    &.toggle {
        .btn {
            width: 26px;
            height: 14px;
            border-radius: 13px;
            background-color: #7c7c7c;
            cursor: pointer;
            position: relative;

            &::after {
                content: '';
                width: 14px;
                height: 14px;
                border-radius: 7.5px;

                // background-color: #c8c8c8;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                transition: left 0.2s;
                z-index: 1;
            }
        }

        input:checked + .btn {
            background-color: #997065;
        }

        input:checked + .btn::after {
            background-color: rgb(var(--color-primary));
            left: 13px;
            transition: left 0.2s;
        }
    }

    &.disabled {
        cursor: not-allowed;
        background-color: rgb(132 131 131 / 34.9%);

        &:focus {
            box-shadow: none;
        }
    }
}
</style>
