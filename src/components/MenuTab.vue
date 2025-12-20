<script setup lang="ts">
import { computed, ref } from 'vue'
import useApiMenu from '@/api/useApiMenu'
import { getInitials, orderWithList } from '@/utils/common'
import { useRouter } from 'vue-router'
import BInputCho from '../base-components/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import _ from 'lodash'
import { VueDraggableNext } from 'vue-draggable-next'
import useSwal from '@/composables/useSwal'

//ANCHOR - Props
interface Props {
    focusSrch?: boolean
}
const props = defineProps<Props>()

//ANCHOR - Emits
const emit = defineEmits<{
    (e: 'selectItem', item: MenuEntity): void
}>()

//ANCHOR - Hooks
onBeforeMount(async () => {
    // 메뉴 조회
    const menuList = await apiMenu.selectList()
    menuStore.items = orderWithList(menuOrders.value, _.orderBy(menuList, ['name']), 'seq')
    // 메뉴 순서 정보 초기화
    menuList.forEach((item) => {
        if (!dMenuOrder.value[item.seq]) dMenuOrder.value[item.seq] = { seq: item.seq, order: 0, isFavorite: false }
    })

    // 메뉴 카테고리 조회
    const ctgList = await apiMenuCtg.selectList()
    menuStore.categories = ctgList

    settingStore.orderMenuCtgs(menuStore.categories)
    Dirty.commit()
})

//ANCHOR - Stores, Composables
const menuStore = useMenuStore()
const settingStore = useSettingStore()
const apiSetting = useApiSetting()
const swal = useSwal()

type SelMenuCtg = MenuCategoryEntity | null
const selCtg = ref<SelMenuCtg>(null)

const apiMenu = useApiMenu()
const apiMenuCtg = useApiMenuCtg()
const router = useRouter()

//ANCHOR - Start
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

const isEdit = ref(false)

// 메뉴 순서 정보
const menuOrders = computed({
    get() {
        return settingStore.setting.config?.menuOrders ?? []
    },
    set(value) {
        settingStore.setting.config.menuOrders = value
    },
})
const dMenuOrder = ref(_.keyBy(menuOrders.value, 'seq'))
// 변경상태 확인
const Dirty = useDirty([toRef(menuStore, 'items'), toRef(menuStore, 'categories')])

async function onToggleEdit() {
    const setting = settingStore.setting

    if (isEdit.value && Dirty.cIsDirty.value) {
        if ((await swal.confirm({ title: '', text: '변경 사항을 저장하시겠습니까?', icon: 'question' })) == false) {
            // 변경사항 되돌리기
            Dirty.revert()
        } else {
            // 매장 순서 변경
            menuOrders.value = menuStore.items.map((item, idx) => ({ seq: item.seq, order: idx, isFavorite: dMenuOrder.value[item.seq]?.isFavorite ?? false }))
            // 매장 카테고리 변경
            setting.config.menuCtgOrders = menuStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))

            await apiSetting.update(setting)
            swal.fireCustom({ toast: true, messageType: 'save' })

            settingStore.orderMenuCtgs(menuStore.categories)

            Dirty.commit()
        }
    }

    isEdit.value = !isEdit.value
}

const cFilteredItems = computed(() => {
    if (isEdit.value) return menuStore.items
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
            onToggleEdit()
        }
    }
})

const isCtgUpdated = ref(false)

function onClickFavorite(menu: MenuEntity) {
    if (dMenuOrder.value[menu.seq]) dMenuOrder.value[menu.seq].isFavorite = !dMenuOrder.value[menu.seq].isFavorite
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
                <!-- see: https://www.npmjs.com/package/vue-dAdminLayoutraggable-next?activeTab=readme#with-transition-group -->
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
            <section class="overflow-y-auto">
                <TransitionGroup name="list">
                    <VueDraggableNext class="grid" v-model="menuStore.items" @change="() => (isCtgUpdated = true)" :animation="500" :disabled="!isEdit">
                        <button v-for="item in cFilteredItems" :key="item.seq" @click="onClickItem(item)" class="item">
                            <button @click.stop="onClickFavorite(item)" class="favorite" :disabled="!isEdit">
                                <font-awesome-icon v-if="dMenuOrder[item.seq].isFavorite" :icon="['fas', 'star']" style="color: #ffd43b" />
                                <font-awesome-icon v-else-if="isEdit" :icon="['far', 'star']" />
                            </button>
                            <span>
                                {{ item['name'] ?? '' }}
                            </span>
                        </button>
                        <Transition name="slide">
                            <button v-show="isEdit" class="item add" @click="onAddItem">
                                <font-awesome-icon :icon="['fas', 'plus']" />
                            </button>
                        </Transition>
                    </VueDraggableNext>
                </TransitionGroup>
            </section>
        </section>
    </section>
</template>

<style lang="scss"></style>
