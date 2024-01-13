<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, watch } from 'vue'

// generic 타입 K extends keyof T 가 정상 작동하지 않음... 그래서 string으로 대체
// assertion
// * item관련 key 값이 있는지 items 가 변경될 때 마다 체크해줘야함
interface Props {
  categories: string[]
  items: T[]
  itemKey?: string
  ctgKey?: string
  /** override: 카테고리 선택시 실행 콜백 */
  onSelectCtg?: (ctg: string) => T[]
  srchKeys: string[]
  /** override: 검색시 실행 콜백 */
  onSearch?: (srchText: string) => T[]
}
const props = withDefaults(defineProps<Props>(), {
  itemKey: 'id',
  ctgKey: 'category',
})

watch(
  () => props.items.length,
  () => {
    // key값이 item에 있는지 검사
    const keys = [props.itemKey, props.ctgKey]
    if (props.items.every((item) => keys.every((key) => key in item)) == false) {
      throw new Error('Check the keys of Props!')
    }
  }
)

// default key가 없는 경우는 종료해줘야함

defineEmits<{
  (e: 'select', item: T): void
  (e: 'search', items: T[], srchText: string): void
  (e: 'update:ftItems', ftItems: T[]): void
}>()
// 편집 클릭시 카테고리, 아이템 목록 마지막 단에 + 버튼 나오게
// context 메뉴표시.. ctx 메뉴는 slot으로 설정가능하게
const isEdit = ref(false)
function onEdit() {
  isEdit.value = true
}

const srchText = ref('')
function search() {
  if (props.onSearch) {
    props.onSearch(srchText.value)
    return
  }
}
const selCtg = ref('')
function selectCtg(category: string) {
  selCtg.value = category
  if (props.onSelectCtg) {
    props.onSelectCtg(category)
    return
  }
}
defineExpose({ search, selectCtg })
</script>

<template>
  <div class="s">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <input type="text" placeholder="검색" v-model="srchText" @input="search" />
      <button @click="onEdit">편집</button>
    </section>
    <ul class="ctgs">
      <!-- v-for 카테고리 표시 -->
      <slot name="item" v-for="ctg in categories" :key="ctg" :category="ctg">
        <button class="item" @click="selectCtg(ctg)">{{ ctg }}</button>
      </slot>
      <button v-if="isEdit"></button>
    </ul>
    <section class="grid">
      <!-- 메뉴 목록 표시 -->
      <slot name="item" v-for="item in items" :key="item[itemKey]" :item="item">
        <div class="item"></div>
      </slot>
    </section>
    <!-- left, top 지정 -->
    <div class="ctx-menu" :style="{ left: '0', top: '0' }">
      <slot name="ctxMenu"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.warapper {
  .top {
  }
  .ctgs {
    .item {
    }
  }
  .grid {
    .item {
    }
  }
}
</style>
