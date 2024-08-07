<script setup lang="ts">
import useApiMenuCtg from '@/api/useApiMenuCtg'
import { computed, ref } from 'vue'
import useApiMenu from '@/api/useApiMenu'
import { getInitials } from '@/utils/CommonUtils'
import { useMenuStore } from '@/stores/menuStore'
import { useRouter } from 'vue-router'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'

const menuStore = useMenuStore()
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

const selCtg = ref<MenuCategoryEntity | 'all' | null>('all')

const srchText = ref('')

const isEdit = ref(false)
function onToggleEdit() {
  isEdit.value = !isEdit.value
}
const cFilteredItems = computed(() => {
  // 카테고리 필터링
  const items = (() => {
    if (selCtg.value == null) {
      return menuStore.items.filter((item) => item.ctgNm == null)
    } else if (selCtg.value == 'all') {
      return menuStore.items
    } else {
      return menuStore.items?.filter((item) => item.ctgNm == (selCtg.value as MenuCategoryEntity).name)
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

function onClickCategory(ctg: MenuCategoryEntity | 'all') {
  selCtg.value = ctg

  if (isEdit.value && typeof ctg == 'object') {
    selCtg.value = 'all'
    router.push({ path: `/menuCtgEdit/${ctg.name}` })
  }
}

function onAddCategory() {
  router.push({ path: '/menuCtgEdit' })
}

function onClickItem(item: MenuEntity) {
  emit('selectItem', item)

  if (isEdit.value) {
    router.push({ path: `/menuEdit/${item.name}` })
  }
}

function onAddItem() {
  const ctgName = selCtg.value != null && typeof selCtg.value == 'object' ? selCtg.value.name : null
  router.push({ path: '/menuEdit', query: { ctgName: ctgName } })
}
useEventListener(document, 'keyup', (e) => {
  if (e.key == 'Escape') {
    if (isEdit.value) {
      isEdit.value = false
    }
  }
})
</script>

<template>
  <section class="comp-menu-tab c-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho v-model="srchText" />
      <v-btn @click="onToggleEdit" class="edit" :class="{ on: isEdit }">
        <font-awesome-icon :icon="['fas', 'pen']" />
      </v-btn>
    </section>
    <!-- tab.scss 참조 -->
    <section class="tab">
      <ul class="ctgs">
        <!-- 카테고리 목록 표시 -->
        <button @click="onClickCategory('all')" :class="{ on: selCtg == 'all' }">
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
