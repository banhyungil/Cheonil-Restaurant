<script setup lang="ts">
export type ProvidePreview = ComputedRef<boolean>

const previewCode = ref(true)

provide<ProvidePreview>(
    'preview',
    computed(() => previewCode.value)
)
</script>

<template>
    <div>
        <slot
            :toggle="
                () => {
                    previewCode = !previewCode
                }
            "
        ></slot>
    </div>
</template>
