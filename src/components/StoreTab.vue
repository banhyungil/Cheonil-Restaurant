<script setup lang="ts">
import type { Store, StoreC, StoreCategoryEntityC } from '@/@types/cheonil'
import TabEditor from './TabEditor.vue'
import { ref, type Ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import type { StoreCategoryEntity } from '@/@types/Database'
import _ from 'lodash'
import useApiStore from '@/api/useApiStore'

const apiStore = useApiStore()
const apiStoreCtg = useApiStoreCtg()

defineEmits<{
  (e: 'select', item: Store): void
}>()

const stores = ref([]) as Ref<Store[]>
const storeCtgs = ref([]) as Ref<StoreCategoryEntity[]>

// 매장 조회
apiStore.select().then((list) => {
  stores.value = list
})

// 매장 카테고리 조회
apiStoreCtg.select().then((list) => {
  storeCtgs.value = list
})

const srchText = ref('')
const search = _.debounce(() => {
  // 초성검색 util 사용
  // srchText.value
}, 50)

function filterItems() {
  // 현재 카테고리에 따라 items를 필터링
  // 현재 입력된 검색어에 따라도...
}

const popupType = ref<'category' | 'store' | null>()

const selCateogry = ref<StoreCategoryEntity | 'all' | null>()
function onSelectCategory(cateogry: StoreCategoryEntity | 'all' | null) {
  // 선택된 카테고리의 아이템을 보여준다.
  selCateogry.value = cateogry
}
</script>

<!-- 
  카테고리 등록은 탭에서 이름만 등록하는 것으로(지금은 다른 속성이 없음..) 
  메뉴 등록만 팝업으로 진행하자 (메뉴는...가격 이름 카테고리)
-->
<template>
  <section class="comp-store-tap">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <input type="text" placeholder="검색" v-model="srchText" @input="search" />
      <!-- <button @click="onEdit">편집</button> -->
    </section>
    <TabEditor
      class="tab"
      :items="stores"
      :categories="storeCtgs"
      @select="(item) => $emit('select', item)"
      @select-category="onSelectCategory"
    >
      <template #item="{ item }">
        <button class="btn-store">
          <span>{{ item.name }}</span>
        </button>
      </template>
    </TabEditor>
    <!-- 팝업 -->
    <!-- validator는 나중에 등록 -->
  </section>
</template>

<style lang="scss" scoped>
.comp-store-tap {
  .top {
  }

  .tab {
    .btn-ctg {
    }
    .btn-store {
    }
  }
}
</style>
