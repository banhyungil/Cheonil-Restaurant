<script setup lang="ts">
import { computed, ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import useApiStore from '@/api/useApiStore'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/storeStore'
import { getInitials } from '@/utils/CommonUtils'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import useSwal from '@/composable/useSwal'

const storeStore = useStoreStore()
const apiStore = useApiStore()
const apiStoreCtg = useApiStoreCtg()
const router = useRouter()

const emit = defineEmits<{
  (e: 'selectItem', item: StoreEntity): void
}>()

// 매장 조회
apiStore.selectList().then((list) => {
  storeStore.items = list
})

// 매장 카테고리 조회
apiStoreCtg.selectList().then((list) => {
  storeStore.categories = list
})

const selCtg = ref<StoreCategoryEntity | 'all' | null>('all')

const srchText = ref('')

const isEdit = ref(false)
function onToggleEdit() {
  isEdit.value = !isEdit.value
}
const cFilteredItems = computed(() => {
  // 카테고리 필터링
  const items = (() => {
    if (selCtg.value == null) {
      return storeStore.items?.filter((item) => item.ctgNm == null)
    } else if (selCtg.value == 'all') {
      return storeStore.items
    } else {
      return storeStore.items?.filter((item) => item.ctgNm == (selCtg.value as StoreCategoryEntity).name)
    }
  })() as StoreEntity[]

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

function onClickCategory(ctg: StoreCategoryEntity | 'all') {
  selCtg.value = ctg

  if (isEdit.value && typeof ctg == 'object') {
    selCtg.value = 'all'
    router.push({ path: `/storeCtgEdit/${ctg.name}` })
  }
}

function onAddCategory() {
  router.push('/storeCtgEdit')
}

function onAddItem() {
  router.push('/storeEdit')
}

function onClickItem(item: StoreEntity) {
  if (isEdit.value) {
    router.push({ path: `/storeEdit/${item.seq}` })
  } else {
    emit('selectItem', item)
  }
}

useEventListener(document, 'keyup', (e) => {
  if (e.key == 'Escape') {
    if (isEdit.value) {
      isEdit.value = false
    }
  }
})
</script>

<!-- 
  카테고리 등록은 탭에서 이름만 등록하는 것으로(지금은 다른 속성이 없음..) 
  메뉴 등록만 팝업으로 진행하자 (메뉴는...가격 이름 카테고리)
-->
<!-- 클릭하면 등록 화면으로 이동 -->
<!-- 편집이아닌경우는 메뉴 화면으로 이동  -->
<template>
  <section class="comp-store-tap c-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho v-model="srchText" />
      <v-btn @click="onToggleEdit" class="edit" :class="{ on: isEdit }">
        <font-awesome-icon :icon="['fas', 'pen']" />
      </v-btn>
    </section>
    <!-- tab.scss 참조 -->
    <section class="tab" :class="{ edit: isEdit }">
      <ul class="ctgs">
        <!-- 카테고리 목록 표시 -->
        <button @click="onClickCategory('all')" :class="{ on: selCtg == 'all' }">
          <span>{{ '전체' }}</span>
        </button>
        <button class="item" v-for="ctg in storeStore.categories" :key="ctg.name" :category="ctg" @click="onClickCategory(ctg)" :class="{ on: selCtg == ctg }">
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
          {{ item['name'] ?? '' }}
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
