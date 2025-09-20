<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'

//ANCHOR - Props
interface Props {
    value?: any
    type?: 'NORMAL' | 'EXPAND' | 'TOGGLE'
    size?: 'sm' | 'lg'
    disabled?: boolean
    label?: string
}
const props = withDefaults(defineProps<Props>(), {
    type: 'NORMAL',
    disabled: false,
})
//ANCHOR - Models
const checked = defineModel<any[] | any | null>({ default: false })
const cState = computed(() =>
    checked.value === true || (Array.isArray(checked) && (checked.value as any[]).includes(props.value))
        ? 'checked'
        : checked.value === false
          ? 'unchecked'
          : 'intermediate'
)

//ANCHOR - Emits
const emit = defineEmits(['change'])

//ANCHOR - Attrs
const attrs = useAttrs()

//ANCHOR - Start
const cSizeClass = computed(() => {
    switch (props.type) {
        case 'NORMAL':
            if (props.size === 'lg') return 'w-6 h-6'
            else if (props.size === 'sm') return 'w-4 h-4'
            else return 'w-5 h-5'
        case 'EXPAND':
            if (props.size === 'lg') return 'w-5 h-5'
            else if (props.size === 'sm') return 'w-3 h-3'
            else return 'w-4 h-4'
        case 'TOGGLE':
            if (props.size === 'lg') return 'w-10 h-6'
            else if (props.size === 'sm') return 'w-7 h-4'
            else return 'w-9 h-5'
    }
})
const inpElt = ref<HTMLInputElement>()
// General Styles
const generalClass = [
    props.type.toLowerCase(),
    'transition duration-200 border shadow-sm flex-center mx-0 my-2 rounded-md font-medium cursor-pointer', // Default
    'focus:ring-4 focus:ring-primary focus:ring-opacity-20', // On focus
    'focus-visible:outline-none', // On focus visible
    'dark:focus:ring-slate-700 dark:focus:ring-opacity-50', // Dark mode
    '[&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90', // On hover and not disabled
    '[&:not(button)]:text-center', // Not a button element
    'disabled:opacity-70 disabled:cursor-not-allowed', // Disabled
    cSizeClass.value,
    attrs.class,
    props.size,
]

const cId = computed(() => (typeof attrs.id == 'string' ? attrs.id : 'a' + uuidv4()))

const onChange = (e: Event) => {
    emit('change', e)
}
</script>

<template>
    <div class="bcheckbox gap-2 flex-center" :class="generalClass">
        <label :for="cId" v-if="label">{{ label }}</label>
        <label class="cbx h-full w-full flex-center" :class="[cState, { disabled }, props.type.toLowerCase()]" @click.stop tabindex="0" :for="cId">
            <input
                ref="inpElt"
                :id="cId"
                type="checkbox"
                v-model="checked"
                @change="onChange"
                :value="value"
                :disabled="disabled"
                v-bind="{ ..._.omit(attrs, ['class', 'style', 'id']) }"
            />
            <slot>
                <template v-if="type == 'NORMAL'">
                    <div v-if="Array.isArray(checked) ? checked.includes(value) === true : checked === true" class="check"></div>
                    <font-awesome-icon v-if="checked === null" :icon="['fas', 'square']" class="m-state" />
                </template>
                <FontAwesomeIcon v-else-if="type == 'EXPAND'" :icon="checked ? ['fas', 'caret-down'] : ['fas', 'caret-right']" class="icon" />
                <div v-else-if="type == 'TOGGLE'" class="btn h-full w-full"></div>
            </slot>
        </label>
    </div>
</template>

<style lang="scss" scoped>
.bcheckbox {
    .cbx {
        cursor: pointer;

        input[type='checkbox'] {
            margin: 0;
            display: none;
        }
        &.disabled {
            cursor: not-allowed;
            background-color: rgb(132 131 131 / 34.9%);

            &:focus {
                box-shadow: none;
            }
        }
    }
    &.normal {
        .cbx {
            // border: 2px solid #a1aabe;
            border-radius: 4px;
            display: inline-block;
            position: relative;

            &.checked {
                border: none;
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
    }
    &.expand {
        border: none;
        .cbx {
            @apply border-none;

            & > .icon {
                font-size: 14px;
                cursor: pointer;

                &:hover {
                    opacity: 0.7;
                }
            }
        }
    }
    &.toggle {
        border: none;

        .cbx {
            border: none;

            .btn {
                @apply bg-white;
                border-radius: 13px;

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
                    transition: all 0.2s;
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
                top: 45%;
                transition: left 0.2s;
            }

            &.intermediate > .btn::after {
                @apply bg-primary;
            }
        }

        &.sm {
            .cbx {
                .btn {
                    &::after {
                        width: 15px;
                        height: 17px;
                    }
                }
                input:checked + .btn::after {
                    left: 12px;
                    top: 46%;
                }
            }
        }
        &.lg {
            .cbx {
                .btn {
                    &::after {
                        width: 21px;
                        height: 21px;
                        border-radius: 100%;
                    }

                    input:checked + .btn::after {
                        left: 18px;
                        top: 46%;
                        transition: left 0.2s;
                    }
                }
            }
        }
    }
}
</style>
