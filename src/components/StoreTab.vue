<script setup lang="ts">
import type { Store } from '@/@types/cheonil'
import TabEditor from './TabEditor.vue'
import { computed, ref, type Ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import type { StoreCategoryEntity } from '@/@types/Database'

const apiStoreCtg = useApiStoreCtg()

interface Props {
  items: Store[]
}
defineProps<Props>()
defineEmits<{
  (e: 'select', item: Store): void
}>()

const storeCtgs = ref([]) as Ref<StoreCategoryEntity[]>
const cCtgNames = computed(() => storeCtgs.value.map((ctg) => ctg.name))

// 매장 카테고리 조회
apiStoreCtg.select().then((list) => {
  storeCtgs.value = list
})
</script>

<template>
  <TabEditor
    :items="items"
    :categories="cCtgNames"
    @select="(item) => $emit('select', item)"
  ></TabEditor>
</template>

<style lang="scss" scoped>
.warapper {
  .top {
  }
  .ctgs {
  }
  .grid {
  }
}
</style>
