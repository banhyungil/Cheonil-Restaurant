<script setup lang="ts">
import type { Menu } from '@/@types/cheonil'
import TabEditor from './TabEditor.vue'
import useApiMenuCtg from '@/api/useApiMenuCtg'
import { computed, ref, type Ref } from 'vue'
import type { MenuCategoryEntity } from '@/@types/Database'

const apiMenuCtg = useApiMenuCtg()

interface Props {
  items: Menu[]
}
defineProps<Props>()
defineEmits<{
  (e: 'select', item: Menu): void
}>()

const menuCtgs = ref([]) as Ref<MenuCategoryEntity[]>
const cCtgNames = computed(() => menuCtgs.value.map((ctg) => ctg.name))

// 메뉴 카테고리 조회
apiMenuCtg.select().then((list) => {
  menuCtgs.value = list
})
</script>

<template>
  <TabEditor
    :items="items"
    :categories="cCtgNames"
    @select="(item) => $emit('select', item)"
  ></TabEditor>
</template>

<style scoped></style>
