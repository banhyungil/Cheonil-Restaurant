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
import useSwal from '@/composable/useSwal'
import { VueDraggableNext } from 'vue-draggable-next'
import useFilterCho from '@/composable/useFilterCho'

const storeStore = useStoreStore()
const settingStore = useSettingStore()
const apiSetting = useApiSetting()
const swal = useSwal()

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
    if (props.focusSrch) nextTick().then(() => compSrch.value.eltInp?.focus())
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

  watch(
    () => settingStore.setting?.config?.storeCtgOrders,
    () => {
      if (settingStore.setting.config?.storeCtgOrders == null) {
        if (settingStore.setting?.config == null) return

        settingStore.setting.config.storeCtgOrders = storeStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))
      } else {
        storeStore.categories = storeStore.order(storeStore.categories)
      }
    },
    { immediate: true, deep: true }
  )
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
    selCtg.value = null
  }
}

useEventListener(document, 'keyup', (e) => {
  if (e.key == 'Escape') {
    if (isEdit.value) {
      isEdit.value = false
    }
  }
})

const isCtgUpdated = ref(false)
watch(isEdit, async () => {
  if (isCtgUpdated.value) {
    const storeCtgOrders = storeStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))

    if (_.isEqual(storeCtgOrders, settingStore.setting.config.storeCtgOrders) == false) {
      if (await swal.fireCustom({ isConfirm: true, title: '', text: '카테고리 순서를 변경하시겠습니까?', icon: 'question' })) {
        settingStore.setting.config.storeCtgOrders = storeCtgOrders
        await apiSetting.update(settingStore.setting)

        swal.fireCustom({ toast: true, title: '', icon: 'success', text: '카테고리 순서가 변경되었습니다' })
      } else {
        storeStore.categories = storeStore.order(storeStore.categories)
      }
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
        <VueDraggableNext v-model="storeStore.categories" @change="() => (isCtgUpdated = true)" :animation="200" :disabled="!isEdit">
          <button
            class="item"
            v-for="ctg in storeStore.categories"
            :key="ctg.name"
            :category="ctg"
            @click="onClickCategory(ctg)"
            :class="{ on: selCtg == ctg }"
          >
            <span>{{ ctg.name ?? '' }}</span>
          </button>
        </VueDraggableNext>
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
