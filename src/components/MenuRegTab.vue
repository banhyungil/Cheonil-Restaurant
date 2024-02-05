<script setup lang="ts">
import type { Menu } from '@/@types/cheonil'
import TabEditor from './TabEditor.vue'
import useApiMenuCtg from '@/api/useApiMenuCtg'
import { ref, type Ref } from 'vue'
import type { MenuCategoryEntity } from '@/@types/Database'
import _ from 'lodash'
import useApiMenu from '@/api/useApiMenu'

const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()

defineEmits<{
  (e: 'select', item: Menu): void
}>()

const menues = ref([]) as Ref<Menu[]>
const menuCtgs = ref([]) as Ref<MenuCategoryEntity[]>

// 메뉴 조회
apiMenu.select().then((list) => {
  menues.value = list
})

// 메뉴 카테고리 조회
apiMenuCtg.select().then((list) => {
  menuCtgs.value = list
})

const srchText = ref('')
const search = _.debounce(() => {
  // 초성검색 util 사용
  // srchText.value
}, 50)

const isRegCategory = ref(false)
function onAddCategory() {
  console.log('onAddCategory')
  isRegCategory.value = true
}

const isRegMenu = ref(false)
function onAddMenu() {
  console.log('onAddMenu')
  isRegMenu.value = true
}
</script>

<template>
  <div>
    <section class="top">
      <!-- 초성 검색 구현 -->
      <input type="text" placeholder="검색" v-model="srchText" @input="search" />
      <!-- <button @click="onEdit">편집</button> -->
    </section>
    <TabEditor
      :items="menues"
      :categories="menuCtgs"
      @select="(item) => $emit('select', item)"
      @add-category="onAddCategory"
      @add-menu="onAddMenu"
      :is-edit="true"
    ></TabEditor>
    <div
      v-if="isRegCategory"
      style="
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background-color: yellow;
      "
    ></div>
  </div>
</template>

<style scoped>
.comp-store-tap {
  .top {
  }
}
</style>
