<script setup lang="ts">
import { computed, ref } from 'vue'
import useApiMenu from '@/api/useApiMenu'
import { getInitials, orderWithList } from '@/utils/CommonUtils'
import { useRouter } from 'vue-router'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import _ from 'lodash'
import { VueDraggableNext } from 'vue-draggable-next'
import useSwal from '@/composable/useSwal'

const menuStore = useMenuStore()
const settingStore = useSettingStore()
const apiSetting = useApiSetting()
const swal = useSwal()

type SelMenuCtg = MenuCategoryEntity | null
const selCtg = ref<SelMenuCtg>(null)

const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()
const router = useRouter()

interface Props {
    focusSrch?: boolean
}
const props = defineProps<Props>()
const inpSrch = ref({} as InstanceType<typeof BInputCho>)

watch(
    () => props.focusSrch,
    () => {
        if (props.focusSrch) nextTick().then(() => inpSrch.value.eltInp?.focus())
    }
)

const srchText = defineModel('srchText', {
    default: '',
})

const emit = defineEmits<{
    (e: 'selectItem', item: MenuEntity): void
}>()

// 메뉴 조회
apiMenu.selectList().then((list) => {
    menuStore.items = _.orderBy(list, ['name'])
})

// 메뉴 카테고리 조회
apiMenuCtg.selectList().then((list) => {
    menuStore.categories = list

    settingStore.orderMenuCtgs(menuStore.categories)
})

watch(
    () => settingStore.setting.config?.menuCtgOrders,
    () => {
        settingStore.orderMenuCtgs(menuStore.categories)
    },
    { deep: true }
)

const isEdit = ref(false)

// 즐겨 찾기 등록된 목록 관리
// 즐겨 찾기 등록된 항목 관리해야함.
const favorites = ref<number[]>(settingStore.setting.config.menuOrders?.map((item) => item.seq) ?? [])

const cMenuCtgOrders = computed(() => menuStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx })))

// 매장 카테고리 순서 변경여부
const cIsCtgOrderUpdated = computed(() => _.isEqual(cMenuCtgOrders.value, settingStore.setting.config.menuCtgOrders) == false)
// 매장순서 변경여부
const cIsMenuOrderUpdated = computed(
    () =>
        _.isEqual(
            favorites.value,
            settingStore.setting.config.menuOrders?.map((item) => item.seq)
        ) == false
)
async function onToggleEdit() {
    const setting = settingStore.setting

    if (isEdit.value == true && (cIsCtgOrderUpdated.value || cIsMenuOrderUpdated.value)) {
        // 카테고리 순서 변경
        if (cIsCtgOrderUpdated.value && (await swal.fireCustom({ isConfirm: true, title: '', text: '설정 정보를 저장하시겠습니까?', icon: 'question' }))) {
            setting.config.menuCtgOrders = cMenuCtgOrders.value
            await apiSetting.update(setting)

            swal.fireCustom({ toast: true, messageType: 'save' })
        } else {
            settingStore.orderStoreCtgs(menuStore.categories)
        }

        // 매장 순서 변경
        if (cIsMenuOrderUpdated.value && (await swal.fireCustom({ isConfirm: true, title: '', text: '설정 정보를 저장하시겠습니까?', icon: 'question' }))) {
            setting.config.menuOrders = favorites.value.map((fvt, idx) => ({ seq: fvt, order: idx }))
            await apiSetting.update(setting)

            swal.fireCustom({ toast: true, messageType: 'save' })
        } else {
            favorites.value = settingStore.setting.config.menuOrders?.map((item) => item.seq) ?? []
        }
    }

    isEdit.value = !isEdit.value
}

const cFilteredItems = computed(() => {
    // 카테고리 필터링
    let items = (() => {
        if (selCtg.value == null) {
            return menuStore.items
        } else {
            return menuStore.items?.filter((item) => item.ctgSeq == (selCtg.value as MenuCategoryEntity).seq)
        }
    })() as MenuEntity[]

    items = orderWithList(
        favorites.value.map((seq) => {
            return { seq }
        }),
        _.orderBy(items, 'name'),
        'seq'
    )

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
        nextTick().then(() => inpSrch.value.eltInp?.focus())
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

function onClickFavorite(store: StoreEntity) {
    const idx = favorites.value.findIndex((seq) => seq == store.seq)
    // 있으면 삭제, 없으면 생성
    if (idx >= 0) favorites.value.splice(idx, 1)
    else favorites.value.push(store.seq)
}
defineExpose({ selCtg })
</script>

<template>
    <section class="comp-menu-tab c-tab">
        <section class="top">
            <!-- 초성 검색 구현 -->
            <BInputCho ref="inpSrch" v-model="srchText" />
            <div>
                <v-btn @click="onToggleEdit" class="chi edit" :class="{ on: isEdit }" v-tooltip="'편집'">
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
                <VueDraggableNext v-model="menuStore.categories" @change="() => (isCtgUpdated = true)" :animation="500" :disabled="!isEdit">
                    <button
                        class="item"
                        v-for="ctg in menuStore.categories"
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
                <TransitionGroup name="list">
                    <div v-for="item in cFilteredItems" :key="item.seq" @click="onClickItem(item)" class="item">
                        <button @click.stop="onClickFavorite(item)" class="favorite" :disabled="!isEdit">
                            <font-awesome-icon v-if="favorites.includes(item.seq)" :icon="['fas', 'star']" style="color: #ffd43b" />
                            <font-awesome-icon v-else-if="isEdit" :icon="['far', 'star']" />
                        </button>
                        <span>
                            {{ item['name'] ?? '' }}
                        </span>
                    </div>
                </TransitionGroup>

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
