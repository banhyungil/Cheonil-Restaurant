<script setup lang="ts" generic="C extends object, T extends object">
import { computed, ref } from 'vue'
import useApiMenu from '@/api/useApiMenu'
import { getInitials } from '@/utils/CommonUtils'
import { useRouter } from 'vue-router'
import BInputCho from './BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import _ from 'lodash'
import { VueDraggableNext } from 'vue-draggable-next'
import useSwal from '@/composable/useSwal'
import useFilterCho from '@/composable/useFilterCho'

// props
// ctgs, ctgKey, items, itemKey
// emit
// toggleEdit, clickCtg, addCtg, clickItem, addItem, changeOrder
// v-model
// srchText, isEdit, selCtg (dummy)
// expose
// inpSrch (포커스 용도)
interface Props {
  ctgs: C[]
  ctgKey: keyof C
  items: T[]
  itemKey: keyof T
}
const props = defineProps<Props>()

defineEmits<{
  (e: 'toggleEdit', value: boolean): void
  (e: 'clickCtg', ctg: C): void
  (e: 'addCtg', ctg: C): void
  (e: 'clickItem', item: T): void
  (e: 'addItem', item: T): void
  (e: 'changeCtgOrder', ctgs: C[]): void
}>()

const menuStore = useMenuStore()
const settingStore = useSettingStore()
const apiSetting = useApiSetting()
const swal = useSwal()

type SelMenuCtg = MenuCategoryEntity | null
const selCtg = ref<SelMenuCtg>(null)

const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()
const router = useRouter()

const inpSrch = ref({} as InstanceType<typeof BInputCho>)

watch(
  () => props.focusSrch,
  () => {
    if (props.focusSrch) nextTick().then(() => inpSrch.value.$el.focus())
  }
)

const srchText = defineModel('srchText', {
  default: '',
})

// 메뉴 조회
apiMenu.selectList().then((list) => {
  menuStore.items = _.orderBy(list, ['name'])

  // temp 메뉴 즐겨찾기 나올때 까지는 정식 먼저 나오도록
  const tgtMenuIdx = menuStore.items.findIndex((menu) => menu.name == '정식')
  if (tgtMenuIdx >= 0) {
    const tgtMenu = menuStore.items.splice(tgtMenuIdx, 1)[0]
    menuStore.items.splice(0, 0, tgtMenu)
  }
})

// 메뉴 카테고리 조회
apiMenuCtg.selectList().then((list) => {
  menuStore.categories = list
})

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
    nextTick().then(() => inpSrch.value.$el.focus())
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

const isCtgUpdated = ref(false)
watch(isEdit, async () => {
  if (isCtgUpdated.value) {
    const ctgOrders = menuStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))

    if (_.isEqual(ctgOrders, settingStore.setting.config.ctgOrders) == false) {
      settingStore.setting.config.ctgOrders = ctgOrders
      await apiSetting.update(settingStore.setting)

      swal.fireCustom({ toast: true, title: '', icon: 'success', text: '카테고리 순서가 변경되었습니다' })
    }
  }
})
</script>

<template>
  <section class="comp-menu-tab c-tab">
    <section class="top">
      <!-- 초성 검색 구현 -->
      <BInputCho ref="inpSrch" v-model="srchText" />
      <div>
        <v-btn @click="onToggleEdit" class="edit" :class="{ on: isEdit }" v-tooltip="'편집'">
          <font-awesome-icon :icon="['fas', 'pen']" />
        </v-btn>
      </div>
    </section>
    <!-- tab.scss 참조 -->
    <section class="tab" :class="{ edit: isEdit }">
      <ul class="ctgs">
        <!-- 카테고리 목록 표시 -->
        <button @click="onClickCategory(null)" :class="{ on: selCtg == null }">
          <span>{{ '전체' }}</span>
        </button>
        <!-- see: https://www.npmjs.com/package/vue-draggable-next?activeTab=readme#with-transition-group -->
        <VueDraggableNext v-model="menuStore.categories" @change="() => (isCtgUpdated = true)" :animation="600" :disabled="!isEdit">
          <button v-for="ctg in menuStore.categories" :key="ctg.name" :category="ctg" @click="onClickCategory(ctg)" :class="{ on: selCtg == ctg }">
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
          <slot name="item" v-bind="item">
            {{ item }}
          </slot>
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
