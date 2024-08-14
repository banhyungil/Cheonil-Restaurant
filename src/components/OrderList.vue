<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { VDataTable } from 'vuetify/components'
import _ from 'lodash'
import { format } from 'date-fns'
import usePagination from '@/composable/usePagination'
import useSwal, { type SweetAlertOptionsCustom } from '@/composable/useSwal'
import useApiPayment from '@/api/useApiPayment'
import { Dropdown } from 'floating-vue'
import { getTotalOrderAmount, getTotalPayAmount } from '@/stores/orderStore'
import { toDate } from 'date-fns'

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
}

const props = withDefaults(defineProps<Props>(), {
  activeFilter: true,
})

const headers = ref([
  { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
  { title: '매장명', key: 'storeNm', align: 'center' },
  { title: '메뉴', key: 'menuNm', align: 'center' },
  { title: '주문시간', key: 'orderAtF', align: 'center' },
  { title: '완료시간', key: 'completeAtF', align: 'center' },
  { title: '결제방식', key: 'payInfo', align: 'center' },
  { title: '결제날짜', key: 'payAtF', align: 'center' },
  { title: '결제금액', key: 'payAmount', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>

const cHeaders = computed(() => {
  if (props.activeDelete && isEdit.value) return headers.value
  else return headers.value.filter((h) => h.key != 'actions')
})

const orders = ref<Order[]>([])
const cOrderDict = computed(() => _.keyBy(orders.value, 'seq'))

const checkedSeqs = ref<Order['seq'][]>([])
const cCancelAble = computed(() => checkedSeqs.value.some((seq) => cOrderDict.value[seq].payments.length > 0))
const cCollectAble = computed(() => checkedSeqs.value.some((seq) => cOrderDict.value[seq].payments.length == 0))

export interface Filter {
  payType: {
    isCash: boolean
    isCard: boolean
    isNotPaid: boolean
  }
  isTodayOrder: boolean
  isTodayPay: boolean
}

const filter = ref<Filter>({
  payType: {
    isCash: false,
    isCard: false,
    isNotPaid: false,
  },
  isTodayOrder: false,
  isTodayPay: false,
})

const totalOrderCnt = ref(0)

const { pageNo, pageSize, cOffset, cTotalPage, PAGE_SIZE_LIST } = usePagination(totalOrderCnt)

const isEdit = ref(false)

const cDtOrders = computed(() =>
  orders.value.map((od, idx) => {
    const menuNm = od.orderMenues.map((om) => om.menu.name + om.cnt).join(', ')
    const orderAtF = od.orderAt ? format(od.orderAt, 'yy.MM.dd hh:mm aa') : null

    const payAt = _.last(od.payments)?.payAt
    const payType = (() => {
      if (od.payments.length == 0) return '미수'

      const payTypes = _.uniq(od.payments.map((p) => p.payType))
      if (payTypes.length > 1) return '복합'
      else if (payTypes[0] == 'CASH') return '현금'
      else return '카드'
    })()
    const payInfo = {
      order: od,
      type: payType,
      seqs: od.payments.map((p) => p.seq),
    }

    const completeAtF = od.completeAt ? format(od.completeAt, 'yy.MM.dd hh:mm aa') : null
    const payAtF = payAt ? format(payAt, 'yy.MM.dd hh:mm aa') : null
    const payAmount = od.payments.reduce((result, p) => (result = result + p.amount), 0)

    return {
      ...od,
      no: cOffset.value + idx + 1,
      storeNm: od.store.name,
      menuNm,
      orderAtF,
      payInfo,
      payAtF,
      completeAtF,
      actions: od.seq,
      payAmount: payAmount.toLocaleString(),
    }
  })
)

watch(
  [pageNo, pageSize, () => filter.value, () => filter.value.isTodayOrder],
  () => {
    const statusIn = (filter.value.payType.isNotPaid ? ['COOKED'] : ['COOKED', 'PAID']) as Order['status'][]
    const orderAt = filter.value.isTodayOrder ? toDate(new Date().setHours(0, 0, 0, 0)) : undefined
    const payTypes = (() => {
      if (filter.value.payType.isCard) return ['CARD']
      else if (filter.value.payType.isCash) return ['CASH']
      else return null
    })() as PaymentEntity['payType'][] | undefined

    apiOrder
      .selectList({
        status: { in: statusIn },
        orderAt: { gte: orderAt },
        limit: pageSize.value,
        offset: cOffset.value,
        payTypes,
      })
      .then((res) => {
        orders.value = res.orders
        totalOrderCnt.value = res.totalCnt
      })
  },
  { immediate: true, deep: true }
)

const COLLECT_MESSAGE_OPTION = { toast: true, messageType: 'save' } as SweetAlertOptionsCustom
async function collect(order: Order, type: PaymentEntity['payType'], showMessage = true) {
  const amount = type == 'CASH' ? order.amount : order.amount + Math.ceil(order.amount / 10)
  const payment = {
    orderSeq: order.seq,
    amount,
    payAt: new Date(),
    payType: type,
  } as PaymentEntityCreation

  const nPayment = await apiPayment.create(payment)

  order.payments.push(nPayment)
  order.status = 'PAID'
  await apiOrder.update(order)

  if (showMessage) Swal.fireCustom(COLLECT_MESSAGE_OPTION)
}

async function collectGroup(type: PaymentEntity['payType']) {
  if ((await Swal.fireCustom({ isConfirm: true, messageType: 'save' })) == false) return

  const prms = checkedSeqs.value.map((orderSeq) => {
    const od = orders.value.find((od) => od.seq == orderSeq)
    if (od == null) return

    return collect(od, type, false)
  })
  await Promise.all(prms)

  Swal.fireCustom({ toast: true, messageType: 'save' })
  checkedSeqs.value.splice(0)
}

const CANCEL_MESSAGE_OPTION = { toast: true, title: '', text: '수금이 취소되었습니다.' }
async function cancelCollection(order: Order, seqs: number[]) {
  await apiPayment.remove(seqs)
  order.payments.splice(0)

  order.status = 'COOKED'
  await apiOrder.update(order)

  Swal.fireCustom(CANCEL_MESSAGE_OPTION)
}

async function cancelCollectionGroup() {
  if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove', title: '수금을 취소하시겠습니까?' })) == false) return

  const prms = checkedSeqs.value.map((orderSeq) => {
    const od = orders.value.find((od) => od.seq == orderSeq)
    if (od == null) return

    return cancelCollection(
      od,
      od.payments.map((p) => p.seq)
    )
  })

  await Promise.all(prms)
  Swal.fireCustom(CANCEL_MESSAGE_OPTION)
  checkedSeqs.value.splice(0)
}

async function onRemove(seq: number) {
  if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) == false) return

  await apiOrder.remove(seq)
  _.remove(orders.value, (od) => od.seq == seq)

  Swal.fireCustom({ toast: true, messageType: 'remove' })
}

function filterPayType(payType: PaymentEntity['payType'] | null) {
  if (payType == 'CASH') {
    filter.value.payType.isCash = !filter.value.payType.isCash
    filter.value.payType.isCard = false
    filter.value.payType.isNotPaid = false
  } else if (payType == 'CARD') {
    filter.value.payType.isCash = false
    filter.value.payType.isCard = !filter.value.payType.isCard
    filter.value.payType.isNotPaid = false
  } else {
    filter.value.payType.isCash = false
    filter.value.payType.isCard = false
    filter.value.payType.isNotPaid = !filter.value.payType.isNotPaid
  }
}

defineExpose({ filter })
</script>

<template>
  <v-data-table
    class="order-list"
    :show-select="isEdit && activeCollection"
    v-model="checkedSeqs"
    :headers="cHeaders"
    :items="cDtOrders"
    item-value="seq"
    :items-per-page="pageSize"
  >
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <section class="top">
        <Dropdown placement="right">
          <v-btn v-if="activeFilter" v-tooltip="'필터'"><font-awesome-icon :icon="['fas', 'filter']" /></v-btn>
          <template #popper>
            <div>
              <div>
                <h3>결제 방식</h3>
                <v-btn :base-color="filter.payType.isNotPaid ? 'success' : ''" @click="filterPayType(null)">미수</v-btn>
                <v-btn :base-color="filter.payType.isCash ? 'success' : ''" @click="filterPayType('CASH')">현금</v-btn>
                <v-btn :base-color="filter.payType.isCard ? 'success' : ''" @click="filterPayType('CARD')">카드</v-btn>
              </div>

              <div>
                <h3>기타</h3>
                <v-btn :base-color="filter.isTodayOrder ? 'success' : ''" @click="filter.isTodayOrder = !filter.isTodayOrder">당일주문</v-btn>
                <v-btn :base-color="filter.isTodayPay ? 'success' : ''" @click="filter.isTodayPay = !filter.isTodayPay">당일결제</v-btn>
              </div>
            </div>
          </template>
        </Dropdown>

        <template v-if="isEdit && activeCollection">
          <v-btn @click="collectGroup('CASH')" base-color="primary" :disabled="!cCollectAble">현금</v-btn>
          <v-btn @click="collectGroup('CARD')" base-color="primary" :disabled="!cCollectAble">카드</v-btn>
          <v-btn @click="cancelCollectionGroup" base-color="warning" :disabled="!cCancelAble">수금취소</v-btn>
        </template>
        <v-btn @click="() => (isEdit = !isEdit)" class="toggle" :class="{ on: isEdit }" v-tooltip="'편집'">
          <font-awesome-icon :icon="['fas', 'pen']" />
        </v-btn>
      </section>
    </template>
    <template #item.actions="{ value }">
      <button @click="onRemove(value)" style="color: var(--color-d)" v-tooltip="'삭제'">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </button>
    </template>
    <template #item.payInfo="{ value }">
      <div class="pay-info">
        <span class="type" :class="{ collected: value.order.payments.length > 0 }">{{ value.type }}</span>
        <div v-show="isEdit == false && activeCollection" class="c-btn">
          <template v-if="value.seqs.length == 0">
            <v-btn baseColor="primary" text="현금" @click="collect(value.order, 'CASH')" style="color: #fff"></v-btn>
            <v-btn baseColor="primary" @click="collect(value.order, 'CARD')" style="color: #fff">카드</v-btn>
          </template>
          <v-btn v-else @click="cancelCollection(value.order, value.seqs)" base-color="warning">수금 취소</v-btn>
        </div>
      </div>
    </template>
    <template #bottom>
      <section v-if="activeSummary" class="c-summary">
        <div class="grp">
          <h3>주문 금액: {{ getTotalOrderAmount(orders).toLocaleString() }}</h3>
          <h3>결제 금액: {{ getTotalPayAmount(orders).toLocaleString() }}</h3>
        </div>
      </section>
      <hr v-if="activeSummary" style="margin: 6px 0" />
      <div class="c-page" style="display: flex; align-items: center">
        <v-pagination class="page" v-model="pageNo" :length="cTotalPage"></v-pagination>
        <div class="right">
          <h3 style="width: max-content">총: {{ totalOrderCnt }} 건</h3>
          <v-select class="select" :items="PAGE_SIZE_LIST" v-model="pageSize" density="comfortable"></v-select>
        </div>
      </div>
    </template>
  </v-data-table>
</template>

<style lang="scss">
.order-list {
  overflow: hidden;
  .v-table__wrapper {
    height: 75vh;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 0;
    }
    margin: 8px 0;
  }
  section.top {
    display: flex;
    justify-content: space-between;
    gap: 4px;
  }

  .pay-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .type {
      font-weight: bold;
      color: var(--color-d);

      &.collected {
        color: var(--color-u);
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

    .grp {
      padding: 10px;

      h3 {
        color: var(--color-u);
      }
    }
  }

  .c-page {
    display: flex;
    justify-content: center;
    align-items: center;

    .page {
      width: 100%;
    }

    .right {
      display: flex;
      justify-content: cetner;
      align-items: center;
      column-gap: 10px;
      width: 240px;

      & > * {
        display: flex;
        align-items: center;
      }
    }
    .select {
      display: flex;
      align-items: center;
    }
  }
}
</style>
