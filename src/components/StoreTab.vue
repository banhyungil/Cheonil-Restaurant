<script setup lang="ts">
import { computed, ref } from 'vue'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import useApiStore from '@/api/useApiStore'
import { useRouter } from 'vue-router'
import { useStoreStore } from '@/stores/storeStore'
import { getInitials, orderWithList } from '@/utils/CommonUtils'
import BInputCho from './base/BInputCho.vue'
import { useEventListener } from '@vueuse/core'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'
import { VueDraggableNext } from 'vue-draggable-next'

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

    if (settingStore?.setting?.config?.storeCtgOrders == null) {
        settingStore.setting.config.storeCtgOrders = storeStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx }))
    }

    watch(
        () => settingStore.setting?.config?.storeCtgOrders,
        () => {
            if (settingStore.setting?.config == null) return
            else {
                settingStore.orderStoreCtgs(storeStore.categories)
            }
        },
        { immediate: true, deep: true }
    )
})

const isEdit = ref(false)
const cFilteredItems = computed(() => {
    // 카테고리 필터링
    let items = (() => {
        if (selCtg.value == null) {
            return storeStore.items
        } else {
            return storeStore.items?.filter((item) => item.ctgSeq == (selCtg.value as StoreCategoryEntity).seq)
        }
    })() as StoreEntity[]

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

// 즐겨 찾기 등록된 목록 관리
// 즐겨 찾기 등록된 항목 관리해야함.
const favorites = ref<number[]>(settingStore.setting.config.storeOrders?.map((item) => item.seq) ?? [])

const cStoreCtgOrders = computed(() => storeStore.categories.map((ctg, idx) => ({ seq: ctg.seq, order: idx })))

// 매장 카테고리 순서 변경여부
const cIsCtgOrderUpdated = computed(() => _.isEqual(cStoreCtgOrders.value, settingStore.setting.config.storeCtgOrders) == false)
// 매장순서 변경여부
const cIsStoreOrderUpdated = computed(
    () =>
        _.isEqual(
            favorites.value,
            settingStore.setting.config.storeOrders?.map((item) => item.seq)
        ) == false
)
async function onToggleEdit() {
    const setting = settingStore.setting

    if (isEdit.value == true && (cIsCtgOrderUpdated.value || cIsStoreOrderUpdated.value)) {
        // 카테고리 순서 변경
        if (cIsCtgOrderUpdated.value && (await swal.fireCustom({ isConfirm: true, title: '', text: '설정 정보를 저장하시겠습니까?', icon: 'question' }))) {
            setting.config.storeCtgOrders = cStoreCtgOrders.value
            await apiSetting.update(setting)

            swal.fireCustom({ toast: true, messageType: 'save' })
        } else {
            settingStore.orderStoreCtgs(storeStore.categories)
        }

        // 매장 순서 변경
        if (cIsStoreOrderUpdated.value && (await swal.fireCustom({ isConfirm: true, title: '', text: '설정 정보를 저장하시겠습니까?', icon: 'question' }))) {
            setting.config.storeOrders = favorites.value.map((fvt, idx) => ({ seq: fvt, order: idx }))
            await apiSetting.update(setting)

            swal.fireCustom({ toast: true, messageType: 'save' })
        } else {
            favorites.value = settingStore.setting.config.storeOrders?.map((item) => item.seq) ?? []
        }
    }
    // 토글
    isEdit.value = !isEdit.value
}

function onClickFavorite(store: StoreEntity) {
    const idx = favorites.value.findIndex((seq) => seq == store.seq)
    // 있으면 삭제, 없으면 생성
    if (idx >= 0) favorites.value.splice(idx, 1)
    else favorites.value.push(store.seq)
}
</script>

<!-- 클릭하면 등록 화면으로 이동 -->
<!-- 편집이아닌경우는 메뉴 화면으로 이동  -->
<template>
    <section class="comp-store-tap c-tab">
        <section class="top">
            <!-- 초성 검색 구현 -->
            <BInputCho ref="compSrch" v-model="srchText" />
            <v-btn @click="onToggleEdit" class="chi edit" :class="{ on: isEdit }" v-tooltip="'편집'">
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
                <VueDraggableNext v-model="storeStore.categories" :animation="200" :disabled="!isEdit">
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
                <TransitionGroup name="list">
                    <button v-for="item in cFilteredItems" :key="item.seq" @click="onClickItem(item)" class="item">
                        <button @click.stop="onClickFavorite(item)" class="favorite" :disabled="!isEdit">
                            <font-awesome-icon v-if="favorites.includes(item.seq)" :icon="['fas', 'star']" style="color: #ffd43b" />
                            <font-awesome-icon v-else-if="isEdit" :icon="['far', 'star']" />
                        </button>
                        <span>
                            {{ item['name'] ?? '' }}
                        </span>
                    </button>
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
