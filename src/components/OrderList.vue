<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { VDataTable } from 'vuetify/components'
import _ from 'lodash'
import { addDays, addMonths, format } from 'date-fns'
import usePagination from '@/composable/usePagination'
import useSwal, { type SweetAlertOptionsCustom } from '@/composable/useSwal'
import useApiPayment from '@/api/useApiPayment'
import { Dropdown } from 'floating-vue'
import { getTotalOrderAmount, getTotalPayAmount } from '@/stores/orderStore'
import { today } from '@/utils/CommonUtils'

const Swal = useSwal()
const apiOrder = useApiOrder()
const apiPayment = useApiPayment()

interface Props {
    title: string
    // whereInfo?: WhereInfo<MyOrderEntity>
    exceptKeys?: (keyof MyOrderEntity)[]
    activeDelete?: boolean
    activeCollection?: boolean
    activeSummary?: boolean
    activeFilter?: boolean
    activePaging?: boolean
    /**
     * 페이지 사이즈 목록
     * null = 'All'
     */
    pageSizeList?: (number | null)[]

    /** 전채 항목 갯수 */
    totalItemCnt?: number
}

const props = withDefaults(defineProps<Props>(), {
    activeFilter: true,
    activePaging: true,
    totalItemCnt: 0,
})

defineEmits<{
    (e: 'search'): void
}>()

const orders = defineModel<Order[]>({
    default: [],
})

export interface Filter {
    payType: PaymentEntity['payType'] | 'UNPAID' | null
    storeName: string
    orderAtRange: Date[] | null
    payAtRange: Date[] | null
}
const filter = defineModel<Filter>('filter', {
    default: {
        storeName: '',
        orderAtRange: [addDays(today(), -7), today()],
    },
})

const pageSize = defineModel<number | null>('pageSize', {
    default: null,
})
const cPageList = computed(() => {
    return props.pageSizeList?.map((pgSize) => {
        return {
            key: pgSize,
            title: pgSize == null ? 'All' : pgSize,
        }
    })
})

const headers = ref([
    { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
    { title: '매장명', key: 'storeNm', align: 'center' },
    { title: '메뉴', key: 'menuNm', align: 'center' },
    { title: '주문금액', key: 'amount', align: 'center' },
    { title: '주문시간', key: 'orderAtF', align: 'center' },
    { title: '완료시간', key: 'cookedAtF', align: 'center' },
    { title: '결제방식', key: 'payInfo', align: 'center' },
    { title: '결제날짜', key: 'payAtF', align: 'center' },
    { title: '결제금액', key: 'payAmount', align: 'center' },
    { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>

const cHeaders = computed(() => {
    if (props.activeDelete && isEdit.value) return headers.value
    else return headers.value.filter((h) => h.key != 'actions')
})

const cOrderDict = computed(() => _.keyBy(orders.value, 'seq'))

const checkedSeqs = ref<Order['seq'][]>([])
const cCancelAble = computed(() => checkedSeqs.value.some((seq) => cOrderDict.value[seq].payments.length > 0))
const cCollectAble = computed(() => checkedSeqs.value.some((seq) => cOrderDict.value[seq].payments.length == 0))

const cTotalOrderCnt = computed(() => props.totalItemCnt ?? 0)
const { pageNo, cOffset, cTotalPage } = usePagination(cTotalOrderCnt, pageSize)
watch(pageNo, () => {
    window.scrollTo(0, 0)
})

const isEdit = ref(false)

const cDtOrders = computed(() =>
    orders.value.map((od, idx) => {
        const menuNm = od.orderMenues.map((om) => om.menu.name + om.cnt).join(', ')
        const orderAtF = od.orderAt ? format(od.orderAt, 'yy.MM.dd hh:mm aa') : null

        const payAt = _.last(od.payments)?.payAt
        const [payType, payTypeLabel] = (() => {
            if (od.payments.length == 0) return ['UNPAID', '미수']

            const payTypes = _.uniq(od.payments.map((p) => p.payType))
            if (payTypes.length > 1) return ['UNION', '복합']
            else if (payTypes[0] == 'CASH') return [payTypes[0], '현금']
            else return [payTypes[0], '카드']
        })()

        const payInfo = {
            order: od,
            type: payType,
            typeLabel: payTypeLabel,
            seqs: od.payments.map((p) => p.seq),
        }

        const cookedAtF = od.cookedAt ? format(od.cookedAt, 'yy.MM.dd hh:mm aa') : null
        const payAtF = payAt ? format(payAt, 'yy.MM.dd hh:mm aa') : null
        const payAmount = od.payments.reduce((result, p) => (result = result + p.amount), 0)

        return {
            ...od,
            no: cOffset.value + idx + 1,
            storeNm: od.store.name,
            menuNm,
            amount: od.amount.toLocaleString(),
            orderAtF,
            payInfo,
            payAtF,
            cookedAtF,
            actions: od,
            payAmount: payAmount.toLocaleString(),
        }
    })
)

const COLLECT_MESSAGE_OPTION = { toast: true, messageType: 'save' } as SweetAlertOptionsCustom
function createPayment(order: Order, type: PaymentEntity['payType']) {
    const amount = type == 'CASH' ? order.amount : order.amount + Math.ceil(order.amount / 10)
    return {
        orderSeq: order.seq,
        amount,
        payAt: new Date(),
        payType: type,
    } as PaymentEntityCreation
}
async function collect(order: Order, type: PaymentEntity['payType'], showMessage = true) {
    const payment = createPayment(order, type)

    const { payments: nPayments, order: uOrder } = await apiOrder.collect(order.seq, [payment])

    order.payments.push(...nPayments)
    Object.assign(order, uOrder)

    if (showMessage) Swal.fireCustom(COLLECT_MESSAGE_OPTION)
}

async function collectList(type: PaymentEntity['payType']) {
    if ((await Swal.fireCustom({ isConfirm: true, messageType: 'save' })) == false) return

    const reqBody = orders.value
        .filter((od) => checkedSeqs.value.includes(od.seq) && od.status != 'PAID')
        .map((order) => ({ seq: order.seq, payments: [createPayment(order, type)] }))
    const results = await apiOrder.collectList(reqBody)
    results.forEach((item) => {
        const target = orders.value.find((od) => od.seq == item.order.seq)

        if (target) {
            Object.assign(target, item.order)
            target.payments = item.payments
        }
    })

    Swal.fireCustom({ toast: true, messageType: 'save' })
    checkedSeqs.value.splice(0)
}

const CANCEL_MESSAGE_OPTION = { toast: true, title: '', text: '수금이 취소되었습니다.' }
async function cancelCollection(order: Order, showMessage = true) {
    const { order: uOrder } = await apiOrder.cancelCollect(order.seq)
    order.payments.splice(0)

    Object.assign(order, uOrder)
    if (showMessage) Swal.fireCustom(CANCEL_MESSAGE_OPTION)
}

async function cancelCollectionList() {
    if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove', title: '수금을 취소하시겠습니까?' })) == false) return

    const seqs = orders.value.filter((od) => checkedSeqs.value.includes(od.seq) && od.status == 'PAID').map((od) => od.seq)
    const result = await apiOrder.cancelCollectList(seqs)
    result.forEach((item) => {
        const target = orders.value.find((od) => od.seq == item.order.seq)

        if (target) {
            Object.assign(target, item.order)
            target.payments.splice(0)
        }
    })

    Swal.fireCustom(CANCEL_MESSAGE_OPTION)
    checkedSeqs.value.splice(0)
}

async function onRemove(seq: number) {
    if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) == false) return

    await apiOrder.remove(seq)
    _.remove(orders.value, (od) => od.seq == seq)

    Swal.fireCustom({ toast: true, messageType: 'remove' })
}

const router = useRouter()
function onUpdate(seq: number) {
    router.push(`/order/${seq}`)
}

defineExpose({ filter, orders })

const PAY_TYPES = [
    {
        label: '선택',
        val: null,
    },
    {
        label: '현금',
        val: 'CASH',
    },
    {
        label: '카드',
        val: 'CARD',
    },
    {
        label: '미수',
        val: 'UNPAID',
    },
]
const payTypes = ref(PAY_TYPES)

const toggleOrderAt = ref(true)
const orderAtRange = ref<Date[]>(filter.value.orderAtRange ?? [])

watch(
    [orderAtRange, toggleOrderAt],
    () => {
        if (toggleOrderAt.value) filter.value.orderAtRange = orderAtRange.value
        else filter.value.orderAtRange = null
    },
    { deep: true }
)

const togglePayAt = ref(false)
const payAtRange = ref<Date[]>(filter.value.orderAtRange ?? [])
watch(
    () => filter.value.orderAtRange,
    () => {
        if (togglePayAt.value == false && toggleOrderAt.value && orderAtRange.value.length > 0) {
            // 결제일자는 주문일자보다 항상 크다.
            const [orderAtMin, orderAtMax] = orderAtRange.value
            const [payAtMin, _] = payAtRange.value

            // 결제일자가 주문일자 범위를 벗어나면 의미가 없음.
            if (orderAtMax && orderAtMax <= payAtMin) payAtRange.value[0] = orderAtMax
            else if (orderAtMin > payAtMin) payAtRange.value[0] = orderAtMin

            // 이전 날짜가 더 크다면 하루 더해준다.
            if (payAtRange.value[0] >= payAtRange.value[1]) payAtRange.value[1] = payAtRange.value[0]
        }
    },
    { deep: true }
)
watch(
    [payAtRange, togglePayAt],
    () => {
        if (togglePayAt.value) filter.value.payAtRange = payAtRange.value
        else filter.value.payAtRange = null

        if (togglePayAt.value) {
            payTypes.value = PAY_TYPES.filter((pt) => pt.val != 'UNPAID')

            // 미수 선택 되어있다면 해제
            if (filter.value.payType == 'UNPAID') filter.value.payType = null
        } else {
            payTypes.value = PAY_TYPES
        }
    },
    { deep: true }
)

function onClickToday(type: 'ORDER' | 'PAY') {
    const range = [today(), today()]

    if (type == 'ORDER') orderAtRange.value = range
    else if (type == 'PAY') payAtRange.value = range
}

function onAddDay(type: 'ORDER' | 'PAY', add: number) {
    if (type == 'ORDER') orderAtRange.value = orderAtRange.value.map((day) => addDays(day, add))
    else if (type == 'PAY') payAtRange.value = payAtRange.value.map((day) => addDays(day, add))
}

function onClickThisMonth(type: 'ORDER' | 'PAY') {
    const range = (() => {
        const st = today()
        st.setDate(1)
        const end = addMonths(today(), 1)
        end.setDate(1)
        return [st, addDays(end, -1)]
    })()

    if (type == 'ORDER') orderAtRange.value = range
    else if (type == 'PAY') payAtRange.value = range
}

const isLoading = ref(false)
</script>

<template>
    <!--
    disable paging: items-per-page="0"
    -->
    <v-data-table
        class="order-list"
        :show-select="isEdit && activeCollection"
        v-model="checkedSeqs"
        :headers="cHeaders"
        :items="cDtOrders"
        item-value="seq"
        :items-per-page="0"
        :hide-default-footer="true"
    >
        <template #top>
            <slot
                name="top"
                :orderAmount="getTotalOrderAmount(orders)"
                :payAmount="getTotalPayAmount(orders)"
                :cashAmount="getTotalPayAmount(orders.filter((od) => od.payments.every((pm) => pm.payType == 'CASH')))"
                :cardAmount="getTotalPayAmount(orders.filter((od) => od.payments.every((pm) => pm.payType == 'CARD')))"
            >
                <section class="tw-flex tw-flex-col tw-gap-3 tw-border-b tw-px-4 tw-pb-2">
                    <section class="tw-flex tw-gap-4">
                        <div class="form-item">
                            <v-switch label="주문일" v-model="toggleOrderAt" color="var(--color-point)"></v-switch>
                            <VueDatePicker
                                v-model="orderAtRange"
                                :disabled="!toggleOrderAt"
                                range
                                :format="'yy.MM.dd'"
                                text-input
                                teleport
                                :max-date="today()"
                                :enable-time-picker="false"
                                auto-apply
                                locale="ko-KR"
                            >
                                <template #action-extra>
                                    <div class="justify-center tw-flex tw-gap-1">
                                        <button class="chi primary tw-w-8" @click="onAddDay('ORDER', -1)">
                                            <font-awesome-icon :icon="['fas', 'minus']" />
                                        </button>
                                        <button class="chi primary" @click="onClickToday('ORDER')">당일</button>
                                        <button class="chi primary" @click="onClickThisMonth('ORDER')">당월</button>
                                        <button class="chi primary tw-w-8" @click="onAddDay('ORDER', 1)" :disabled="orderAtRange[1] >= today()">
                                            <font-awesome-icon :icon="['fas', 'plus']" />
                                        </button>
                                    </div>
                                </template>
                            </VueDatePicker>
                        </div>
                        <div class="form-item">
                            <v-switch label="결제일" v-model="togglePayAt" color="var(--color-point)"></v-switch>
                            <VueDatePicker
                                v-model="payAtRange"
                                :disabled="!togglePayAt"
                                range
                                :format="'yy.MM.dd'"
                                text-input
                                :min-date="toggleOrderAt ? orderAtRange[0] : undefined"
                                :max-date="today()"
                                teleport
                                :enable-time-picker="false"
                                auto-apply
                                locale="ko-KR"
                            >
                                <template #action-extra>
                                    <div class="justify-center tw-flex tw-gap-1">
                                        <button class="chi primary tw-w-8" @click="onAddDay('PAY', -1)"><font-awesome-icon :icon="['fas', 'minus']" /></button>
                                        <button class="chi primary" @click="onClickToday('PAY')">당일</button>
                                        <button class="chi primary" @click="onClickThisMonth('PAY')">당월</button>
                                        <button class="chi primary tw-w-8" @click="onAddDay('PAY', 1)"><font-awesome-icon :icon="['fas', 'plus']" /></button>
                                    </div>
                                </template>
                            </VueDatePicker>
                        </div>
                    </section>
                    <section class="tw-flex tw-justify-between tw-gap-4">
                        <div class="tw-flex tw-gap-3">
                            <div class="form-item">
                                <label>결제방식</label>
                                <v-select class="height-40" v-model="filter.payType" :items="payTypes" item-title="label" item-value="val"></v-select>
                            </div>
                            <div class="form-item">
                                <label>매장명</label>
                                <BInputCho v-model="filter.storeName" />
                                <v-btn @click="() => $emit('search')" style="min-width: 0" color="primary">
                                    <span class="tw-mr-2">검색</span>
                                    <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                                </v-btn>
                            </div>
                        </div>

                        <div class="tw-flex tw-justify-center tw-gap-2">
                            <template v-if="isEdit && activeCollection">
                                <v-btn @click="collectList('CASH')" base-color="success" :disabled="!cCollectAble">현금</v-btn>
                                <v-btn @click="collectList('CARD')" base-color="primary" :disabled="!cCollectAble">카드</v-btn>
                                <v-btn @click="cancelCollectionList" base-color="warning" :disabled="!cCancelAble" style="transform: translateY(-1px)"
                                    >수금취소</v-btn
                                >
                            </template>
                            <!-- 삭제 또는 수금때만 보인다 -->
                            <v-btn
                                v-if="activeDelete || activeCollection"
                                @click="() => (isEdit = !isEdit)"
                                class="toggle"
                                :class="{ on: isEdit }"
                                v-tooltip="'편집'"
                            >
                                <font-awesome-icon :icon="['fas', 'pen']" />
                            </v-btn>
                        </div>
                    </section>
                </section>
                <section v-if="activeSummary" class="c-summary">
                    <div class="grp tw-flex tw-gap-3">
                        <h3 class="title">주문 금액: {{ getTotalOrderAmount(orders).toLocaleString() }}</h3>
                        <div class="tw-flex tw-flex-col tw-gap-2">
                            <h3 class="title">결제 금액: {{ getTotalPayAmount(orders).toLocaleString() }}</h3>
                            <div class="ml-4 tw-flex tw-gap-2 tw-text-black">
                                -
                                <h3>현금: {{ getTotalPayAmount(orders.filter((od) => od.payments.every((pm) => pm.payType == 'CASH'))).toLocaleString() }}</h3>
                                <h3>카드: {{ getTotalPayAmount(orders.filter((od) => od.payments.every((pm) => pm.payType == 'CARD'))).toLocaleString() }}</h3>
                            </div>
                        </div>
                    </div>
                </section>
            </slot>
        </template>
        <template #item.actions="{ value }">
            <div style="display: flex; justify-content: center; gap: 10px">
                <button @click="onRemove(value.seq)" style="color: var(--color-danger)" v-tooltip="'삭제'">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
                <button
                    @click="onUpdate(value.seq)"
                    :disabled="value.payments.length > 0"
                    class="update"
                    v-tooltip="value.payments.length > 0 ? '결제된 항목은 수정할 수 없습니다' : '수정'"
                >
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
            </div>
        </template>
        <template #item.payInfo="{ value }">
            <div class="pay-info">
                <span class="type" :class="[value.type.toLocaleLowerCase()]">{{ value.typeLabel }}</span>
                <div v-show="isEdit == false && activeCollection" class="c-btn">
                    <template v-if="value.seqs.length == 0">
                        <v-btn baseColor="primary" text="현금" @click="collect(value.order, 'CASH')" color="success"></v-btn>
                        <v-btn baseColor="primary" @click="collect(value.order, 'CARD')" color="primary">카드</v-btn>
                    </template>
                    <v-btn v-else @click="cancelCollection(value.order, value.seqs)" base-color="warning">수금 취소</v-btn>
                </div>
            </div>
        </template>
        <template #bottom>
            <div v-if="activePaging" class="c-page">
                <v-pagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></v-pagination>
                <div class="right">
                    <h3 style="width: max-content">총: {{ cTotalOrderCnt }} 건</h3>
                    <v-select class="select" :items="cPageList" v-model="pageSize" item-value="key" item-title="title" density="comfortable"></v-select>
                </div>
            </div>
        </template>
    </v-data-table>
</template>

<style lang="scss">
.order-list {
    .v-table__wrapper {
        margin: 8px 0;

        button {
            &.update {
                color: var(--color-success);
            }

            &:disabled {
                color: grey;
                &:hover {
                    opacity: 1;
                }
            }
        }
    }

    .pay-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .type {
            font-weight: bold;

            &.unpaid {
                color: var(--color-danger);
            }
            &.cash {
                color: var(--color-success);
            }
            &.card {
                color: var(--color-point);
            }
        }

        .c-btn {
            display: flex;
            justify-content: center;
            gap: 4px;
            padding: 6px 0;

            button {
                min-width: 0;
                width: fit-content;
                height: 30px;
            }
        }
    }

    .c-summary {
        display: flex;
        flex-direction: column;
        align-items: end;
        color: var(--color-success);
        font-weight: bold;

        .grp {
            padding: 10px;

            .title {
                @apply tw-text-lg;
            }
        }
    }

    .c-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 50px;

        .page {
            width: 100%;
        }

        .right {
            position: absolute;
            right: 0px;
            display: flex;
            justify-content: center;
            align-items: center;
            column-gap: 10px;
            width: 230px;

            & > * {
                display: flex;
                align-items: center;
            }
        }
        .select {
            display: flex;
            align-items: center;
            width: max-content;
        }
    }
}
</style>
