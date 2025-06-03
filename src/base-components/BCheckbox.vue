<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

defineOptions({
    inheritAttrs: false,
})

//ANCHOR - Props
interface Props {
    value?: any
    type?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    type: 'NORMAL',
    disabled: false,
})
//ANCHOR - Models
const checked = defineModel<boolean[] | boolean | null>({ default: false })

//ANCHOR - Emits
const emit = defineEmits(['change'])

//ANCHOR - Start
const inpElt = ref<HTMLInputElement>()
// General Styles
const generalClass = [
    'transition duration-200 border shadow-sm flex-center mx-0 my-2 rounded-md font-medium cursor-pointer', // Default
    'focus:ring-4 focus:ring-primary focus:ring-opacity-20', // On focus
    'focus-visible:outline-none', // On focus visible
    'dark:focus:ring-slate-700 dark:focus:ring-opacity-50', // Dark mode
    '[&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90', // On hover and not disabled
    '[&:not(button)]:text-center', // Not a button element
    'disabled:opacity-70 disabled:cursor-not-allowed', // Disabled
]

const attrs = useAttrs()

const cClass = computed(() => {
    return [props.type.toLowerCase(), ...generalClass, _.pick(attrs, 'class')]
})

const uuid = 'a' + uuidv4()

const onChange = (e: Event) => {
    emit('change', e)
}
</script>

<template>
    <label
        class="bcheckbox"
        :class="[generalClass, cClass, { checked: checked === true || (Array.isArray(checked) && checked.includes(value)), disabled }]"
        :style="_.pick(attrs, 'style')"
        tabindex="0"
        :for="uuid"
    >
        <input
            ref="inpElt"
            :id="uuid"
            type="checkbox"
            v-model="checked"
            @change="onChange"
            :value="value"
            :disabled="disabled"
            v-bind="_.omit(attrs, ['class', 'style'])"
        />
        <slot>
            <template v-if="type == 'NORMAL'">
                <div v-if="Array.isArray(checked) ? checked.includes(value) === true : checked === true" class="check"></div>
                <font-awesome-icon v-if="checked === null" :icon="['fas', 'square']" class="m-state" />
            </template>
            <FontAwesomeIcon v-else-if="type == 'EXPAND'" :icon="checked ? ['fas', 'caret-down'] : ['fas', 'caret-right']" class="icon" />
            <div v-else-if="type == 'TOGGLE'" class="btn"></div>
        </slot>
    </label>
</template>

<style lang="scss" scoped>
.bcheckbox {
    input[type='checkbox'] {
        margin: 0;
        display: none;
    }

    &.normal {
        width: 16px;
        height: 16px;
        border: 2px solid #a1aabe;
        border-radius: 4px;
        display: inline-block;
        position: relative;
        cursor: pointer;

        &.checked {
            border: none;
        }

        .bcheckbox {
            display: inline-block;
            margin: 0 2px;
        }

        .bcheckbox input[type='checkbox'] {
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
        @apply border-none;

        & > .icon {
            font-size: 14px;
            cursor: pointer;

            &:hover {
                opacity: 0.7;
            }
        }
    }

    &.toggle {
        border: none;

        .btn {
            @apply bg-white;
            border-radius: 13px;
            padding: 12px 21px;

            cursor: pointer;
            position: relative;

            &::after {
                content: '';

                @apply bg-slate-400 shadow-lg;

                width: 20px;
                height: 20px;
                border-radius: 10px;

                // background-color: #c8c8c8;
                display: block;
                position: absolute;
                top: 50%;
                left: 3px;
                transform: translateY(-50%);
                transition: left 0.2s;
                z-index: 1;
            }
        }

        input:checked + .btn {
            // @apply bg-secondary;
            @apply border-primary bg-primary;
        }

        input:checked + .btn::after {
            @apply bg-slate-200;
            left: 18px;
            top: 46%;
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
