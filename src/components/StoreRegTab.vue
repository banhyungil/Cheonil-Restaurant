<script setup lang="ts">
import type { Store, StoreC, StoreCategoryEntityC } from '@/@types/cheonil'
import TabEditor from './TabEditor.vue'
import { ref, type Ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import type { StoreCategoryEntity } from '@/@types/Database'
import _ from 'lodash'
import useApiStore from '@/api/useApiStore'
import RegStorePop from './pop/RegStorePop.vue'
import RegStoreCtgPop from './pop/RegStoreCtgPop.vue'

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

const popupType = ref<'category' | 'store' | null>()
function onAddCategory() {
  console.log('onAddCategory')
  popupType.value = 'category'
}

function onAddStore() {
  console.log('onAddStore')
  popupType.value = 'store'
}

const selCateogry = ref<StoreCategoryEntity | 'all' | null>()
function onSelectCategory(cateogry: StoreCategoryEntity | 'all' | null) {
  // 선택된 카테고리의 아이템을 보여준다.
  selCateogry.value = cateogry
}

async function onSaveStore(store: StoreC) {
  // validate 나중에 추가
  await apiStore.save(store)
  popupType.value = null
  stores.value = await apiStore.select()
}
</script>

<!-- 
  카테고리 등록은 탭에서 이름만 등록하는 것으로(지금은 다른 속성이 없음..) 
  메뉴 등록만 팝업으로 진행하자 (메뉴는...가격 이름 카테고리)
-->
<template>
  <section class="comp-store-tap">
    <TabEditor
      class="tab"
      :items="stores"
      :categories="storeCtgs"
      @select="(item) => $emit('select', item)"
      @select-category="onSelectCategory"
      @add-category="onAddCategory"
      @add-item="onAddStore"
      :is-edit="true"
    >
      <template #item="{ item }">
        <button class="btn-store">
          <span>{{ item.name }}</span>
        </button>
      </template>
    </TabEditor>
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
