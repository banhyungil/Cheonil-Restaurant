<script setup lang="ts">
import { computed, ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import useApiStore from '@/api/useApiStore'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/storeStore'
import { getInitials } from '@/utils/CommonUtils'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import _ from 'lodash'

const storeStore = useStoreStore()

type SelStoreCtg = StoreCategoryEntity | null
const selCtg = ref<SelStoreCtg>(null)

const apiStore = useApiStore()
const apiStoreCtg = useApiStoreCtg()
const router = useRouter()

const compSrch = ref({} as InstanceType<typeof BInputCho>)
interface Props {
  focusSrch?: boolean
}
const props = defineProps<Props>()

watch(
  () => props.focusSrch,
  () => {
    console.log('watch props.focusSrch', props.focusSrch)
    if (props.focusSrch) nextTick().then(() => compSrch.value.$el.focus())
  }
)
const srchText = defineModel('srchText', {
  default: '',
})

const emit = defineEmits<{
  (e: 'selectItem', item: StoreEntity): void
}>()

// 매장 조회
apiStore.selectList().then((list) => {
  storeStore.items = _.orderBy(list, ['name'])
})

// 매장 카테고리 조회
apiStoreCtg.selectList().then((list) => {
  storeStore.categories = list
})

const isEdit = ref(false)
function onToggleEdit() {
  isEdit.value = !isEdit.value
}
const cFilteredItems = computed(() => {
  // 카테고리 필터링
  const items = (() => {
    if (selCtg.value == null) {
      return storeStore.items
    } else {
      return storeStore.items?.filter((item) => item.ctgSeq == (selCtg.value as StoreCategoryEntity).seq)
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

function onClickCategory(ctg: SelStoreCtg) {
  selCtg.value = ctg

  if (isEdit.value && ctg && typeof ctg == 'object') {
    selCtg.value = null
    router.push({ path: `/storeCtgEdit/${ctg.seq}` })
  }
}

function onAddCategory() {
  router.push('/storeCtgEdit')
}

function isCtg(selCtg: SelStoreCtg): selCtg is StoreCategoryEntity {
  return selCtg != null && selCtg.seq != null
}
function onAddItem() {
  if (isCtg(selCtg.value)) router.push({ path: `/storeEdit`, query: { ctgSeq: selCtg.value.seq } })
  else router.push(`/storeEdit`)
}

function onClickItem(item: StoreEntity) {
  if (isEdit.value) {
    router.push({ path: `/storeEdit/${item.seq}` })
  } else {
    emit('selectItem', item)
    srchText.value = ''
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

<!-- 클릭하면 등록 화면으로 이동 -->
<!-- 편집이아닌경우는 메뉴 화면으로 이동  -->
<template>
  <section class="comp-store-tap c-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho ref="compSrch" v-model="srchText" />
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
