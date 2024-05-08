<script setup lang="ts">
import useApiMenuCtg from '@/api/useApiMenuCtg'
import { computed, ref, type Ref } from 'vue'
import type { MenuCategoryEntity, MenuEntity } from '@/@types/Database'
import _ from 'lodash'
import useApiMenu from '@/api/useApiMenu'
import { getInitials } from '@/utils/CommonUtils'
import { useMenuStore } from '@/stores/menuStore'
import { useRouter } from 'vue-router'
import BInputCho from './base/BInputCho.vue'

const menuStore = useMenuStore()
const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()
const router = useRouter()

const emit = defineEmits<{
  (e: 'selectItem', item: MenuEntity): void
}>()

// 메뉴 조회
apiMenu.select().then((list) => {
  menuStore.items = list
})

// 메뉴 카테고리 조회
apiMenuCtg.select().then((list) => {
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
      return menuStore.items.filter((item) => item.categoryName == null)
    } else if (selCtg.value == 'all') {
      return menuStore.items
    } else {
      return menuStore.items?.filter(
        (item) => item.categoryName == (selCtg.value as MenuCategoryEntity).name
      )
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

function onClickCategory(ctg: MenuCategoryEntity | 'all' | null) {
  selCtg.value = ctg

  if (isEdit.value && typeof ctg == 'object' && ctg != null) {
    router.push({ path: `/menuCtg/${ctg.name}` })
  }
}

function onAddCategory() {
  router.push({ path: '/menuCtg' })
}

function onClickItem(item: MenuEntity) {
  emit('selectItem', item)

  if (isEdit.value) {
    router.push({ path: `/menu/${item.id}` })
  }
}

function onAddItem() {
  const ctgName = selCtg.value != null && typeof selCtg.value == 'object' ? selCtg.value.name : null
  router.push({ path: '/menu', query: { ctgName: ctgName } })
}
</script>

<template>
  <section class="comp-menu-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho v-model="srchText" />
      <button @click="onToggleEdit" class="edit" :class="{ on: isEdit }">
        <font-awesome-icon :icon="['fas', 'pen']" />
      </button>
    </section>
    <!-- tab.scss 참조 -->
    <section class="tab">
      <ul class="ctgs">
        <!-- 카테고리 목록 표시 -->
        <button @click="onClickCategory('all')" :class="{ on: selCtg == 'all' }">
          <span>{{ '전체' }}</span>
        </button>
        <button
          v-for="ctg in menuStore.categories"
          :key="ctg.name"
          :category="ctg"
          @click="onClickCategory(ctg)"
          :class="{ on: selCtg == ctg }"
        >
          <span>{{ ctg.name ?? '' }}</span>
        </button>
        <button @click="onClickCategory(null)" :class="{ on: selCtg == null }">
          <span>{{ '미지정' }}</span>
        </button>
        <Transition name="slide">
          <button v-show="isEdit" class="itemd" @click="onAddCategory">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </Transition>
      </ul>
      <section class="grid">
        <button
          class="item"
          v-for="item in cFilteredItems"
          :key="item.id"
          @click="onClickItem(item)"
        >
          <span class="main">{{ item['name'] }}</span>
          <span class="sub">{{ item['price'] }}</span>
        </button>
        <Transition name="slide">
          <button v-show="isEdit" class="add" @click="onAddItem">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </Transition>
      </section>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.comp-menu-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;

    button.edit {
      padding: 6px 10px;
      &.on {
        background-color: #2aac8e;
        color: #fff;
      }
    }
  }
}
</style>
