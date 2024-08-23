<script setup lang="ts">
import useApiMenuCtg from '@/api/useApiMenuCtg'
import { computed, ref } from 'vue'
import useApiMenu from '@/api/useApiMenu'
import { getInitials } from '@/utils/CommonUtils'
import { useMenuStore } from '@/stores/menuStore'
import { useRouter } from 'vue-router'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import useWebSocket from '@/api/useWebSocket'

const menuStore = useMenuStore()

type SelMenuCtg = MenuCategoryEntity | null
const selCtg = ref<SelMenuCtg>(null)

const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()
const router = useRouter()

const emit = defineEmits<{
  (e: 'selectItem', item: MenuEntity): void
}>()

// 메뉴 조회
apiMenu.selectList().then((list) => {
  menuStore.items = list
})

// 메뉴 카테고리 조회
apiMenuCtg.selectList().then((list) => {
  menuStore.categories = list
})

const srchText = ref('')

const isEdit = ref(false)
function onToggleEdit() {
  isEdit.value = !isEdit.value
}
const cFilteredItems = computed(() => {
  // 카테고리 필터링
  const items = (() => {
    if (selCtg.value == null) {
      return menuStore.items
    } else {
      return menuStore.items?.filter((item) => item.ctgSeq == (selCtg.value as MenuCategoryEntity).seq)
    }
  })() as MenuEntity[]

  // 검색 필터링
  if (srchText.value == '') {
    return items
  } else {
    const srchInitials = getInitials(srchText.value)

    return items.filter((item) => {
      const nameInititals = getInitials(item.name)

      return nameInititals.includes(srchInitials)
    })
  }
})

function onClickCategory(ctg: SelMenuCtg) {
  selCtg.value = ctg

  if (isEdit.value && ctg && typeof ctg == 'object') {
    selCtg.value = null
    router.push({ path: `/menuCtgEdit/${ctg.seq}` })
  }
}

function onAddCategory() {
  router.push({ path: '/menuCtgEdit' })
}

function onClickItem(item: MenuEntity) {
  if (isEdit.value) {
    router.push({ path: `/menuEdit/${item.seq}` })
  } else {
    emit('selectItem', item)
  }
}

function isCategory(selCtg: SelMenuCtg): selCtg is MenuCategoryEntity {
  return (selCtg as MenuCategoryEntity) != null
}

function onAddItem() {
  if (isCategory(selCtg.value)) router.push({ path: '/menuEdit', query: { ctgSeq: selCtg.value.seq } })
  else router.push({ path: '/menuEdit' })
}
useEventListener(document, 'keyup', (e) => {
  if (e.key == 'Escape') {
    if (isEdit.value) {
      isEdit.value = false
    }
  }
})

// WS.listen('/menu', 'POST', (resMenu) => {
//   debugger
// })
// WS.listen('/menu/:seq', 'PATCH', (resMenu) => {
//   debugger
// })
// WS.listen('/menu/:seq', 'DELETE', () => {
//   debugger
// })
</script>

<template>
  <section class="comp-menu-tab c-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho v-model="srchText" />
      <v-btn @click="onToggleEdit" class="edit" :class="{ on: isEdit }" v-tooltip="'편집'">
        <font-awesome-icon :icon="['fas', 'pen']" />
      </v-btn>
    </section>
    <!-- tab.scss 참조 -->
    <section class="tab" :class="{ edit: isEdit }">
      <ul class="ctgs">
        <!-- 카테고리 목록 표시 -->
        <button @click="onClickCategory(null)" :class="{ on: selCtg == null }">
          <span>{{ '전체' }}</span>
        </button>
        <button v-for="ctg in menuStore.categories" :key="ctg.name" :category="ctg" @click="onClickCategory(ctg)" :class="{ on: selCtg == ctg }">
          <span>{{ ctg.name ?? '' }}</span>
        </button>
        <Transition name="slide">
          <button v-show="isEdit" class="item" @click="onAddCategory">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </Transition>
      </ul>
      <section class="grid">
        <button class="item" v-for="item in cFilteredItems" :key="item.name" @click="onClickItem(item)">
          <span class="main">{{ item['name'] }}</span>
          <span class="sub">{{ item['price'].toLocaleString() }}</span>
        </button>
        <Transition name="slide">
          <button v-show="isEdit" class="item add" @click="onAddItem">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </Transition>
      </section>
    </section>
  </section>
</template>

<style lang="scss"></style>
