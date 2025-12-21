<script setup lang="ts">
import Dialog from '@/base-components/Headless/Dialog'

//ANCHOR - Props
interface Props {
    title?: string
    activeClose?: boolean
}
withDefaults(defineProps<Props>(), {
    title: '',
    activeClose: true,
})

const isOpen = defineModel<boolean>({ required: true })
</script>
<template>
    <Dialog class="bmodal text-white" :open="isOpen" :static-backdrop="true">
        <Dialog.Panel class="bg-white">
            <Dialog.Title>
                <slot name="title">
                    <h2 class="mr-auto text-base font-bold">{{ title }}</h2>
                    <BButton v-if="activeClose" variant="danger" size="sm" @click="isOpen = false">
                        <font-awesome-icon :icon="['fas', 'x']" />
                    </BButton>
                </slot>
            </Dialog.Title>
            <Dialog.Description>
                <slot name="content"></slot>
            </Dialog.Description>
            <Dialog.Footer>
                <slot name="footer"> </slot>
            </Dialog.Footer>
        </Dialog.Panel>
    </Dialog>
</template>

<style scoped>
.bmodal {
    /* empty */
}
</style>
