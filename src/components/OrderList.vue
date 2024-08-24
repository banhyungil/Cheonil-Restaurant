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

// orders
// pageSize
// pageSizeList
// totalCnt

// 컴포넌트 디자인만 모듈화하는거면...
// 위에만 하면 페이징은 해결. pagedisable은 totalCnt값여부에따라?...

const props = withDefaults(defineProps<Props>(), {
  activeFilter: true,
  activePaging: true,
  totalItemCnt: 0,
})

const orders = defineModel<Order[]>({
  default: [],
})

export interface Filter {
  payType: {
    isCash: boolean
    isCard: boolean
    isNotPaid: boolean
  }
  isTodayOrder: boolean
  isTodayPay: boolean
}
const filter = defineModel<Filter>('filter', {
  default: {
    payType: {
      isCash: false,
      isCard: false,
      isNotPaid: false,
    },
    isTodayOrder: false,
    isTodayPay: false,
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

    const cookedAtF = od.cookedAt ? format(od.cookedAt, 'yy.MM.dd hh:mm aa') : null
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
      cookedAtF,
      actions: od.seq,
      payAmount: payAmount.toLocaleString(),
    }
  })
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
    if (od == null || od.status == 'PAID') return

    return collect(od, type, false)
  })
  await Promise.all(prms)

  Swal.fireCustom({ toast: true, messageType: 'save' })
  checkedSeqs.value.splice(0)
}

const CANCEL_MESSAGE_OPTION = { toast: true, title: '', text: '수금이 취소되었습니다.' }
async function cancelCollection(order: Order, seqs: number[], showMessage = true) {
  await apiPayment.remove(seqs)
  order.payments.splice(0)

  order.status = 'COOKED'
  await apiOrder.update(order)

  if (showMessage) Swal.fireCustom(CANCEL_MESSAGE_OPTION)
}

async function cancelCollectionGroup() {
  if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove', title: '수금을 취소하시겠습니까?' })) == false) return

  const prms = checkedSeqs.value.map((orderSeq) => {
    const od = orders.value.find((od) => od.seq == orderSeq)
    if (od == null || od.status == 'COOKED') return

    return cancelCollection(
      od,
      od.payments.map((p) => p.seq),
      false
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

const router = useRouter()
function onUpdate(seq: number) {
  router.push(`/order/${seq}`)
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

defineExpose({ filter, orders })

const srchText = ref('')
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
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <section class="top">
        <div style="display: flex">
          <!-- <BInputCho v-model="srchText" /> -->
          <Dropdown placement="right">
            <v-btn v-if="activeFilter" v-tooltip="'필터'"><font-awesome-icon :icon="['fas', 'filter']" /></v-btn>
            <template #popper>
              <div class="popper tw-flex tw-flex-col tw-gap-2 pa-3">
                <div>
                  <h3 class="tw-mb-2">결제 방식</h3>
                  <v-btn :base-color="filter.payType.isNotPaid ? 'success' : ''" @click="filterPayType(null)">미수</v-btn>
                  <v-btn :base-color="filter.payType.isCash ? 'success' : ''" @click="filterPayType('CASH')">현금</v-btn>
                  <v-btn :base-color="filter.payType.isCard ? 'success' : ''" @click="filterPayType('CARD')">카드</v-btn>
                </div>

                <div>
                  <h3 class="tw-mb-2">기타</h3>
                  <v-btn :base-color="filter.isTodayOrder ? 'success' : ''" @click="filter.isTodayOrder = !filter.isTodayOrder">당일주문</v-btn>
                  <v-btn :base-color="filter.isTodayPay ? 'success' : ''" @click="filter.isTodayPay = !filter.isTodayPay">당일결제</v-btn>
                </div>
              </div>
            </template>
          </Dropdown>
        </div>

        <div>
          <template v-if="isEdit && activeCollection">
            <v-btn @click="collectGroup('CASH')" base-color="primary" :disabled="!cCollectAble">현금</v-btn>
            <v-btn @click="collectGroup('CARD')" base-color="primary" :disabled="!cCollectAble">카드</v-btn>
            <v-btn @click="cancelCollectionGroup" base-color="warning" :disabled="!cCancelAble">수금취소</v-btn>
          </template>
          <!-- 삭제 또는 수금때만 보인다 -->
          <v-btn v-if="activeDelete || activeCollection" @click="() => (isEdit = !isEdit)" class="toggle" :class="{ on: isEdit }" v-tooltip="'편집'">
            <font-awesome-icon :icon="['fas', 'pen']" />
          </v-btn>
        </div>
      </section>
    </template>
    <template #item.actions="{ value }">
      <div style="display: flex; justify-content: center; gap: 10px">
        <button @click="onRemove(value)" style="color: var(--color-d)" v-tooltip="'삭제'">
          <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
        <button @click="onUpdate(value)" style="color: var(--color-u)" v-tooltip="'수정'">
          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
        </button>
      </div>
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
      <hr v-if="activeSummary && activePaging" style="margin: 6px 0" />
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
  overflow: hidden;
  .v-table__wrapper {
    height: calc(100vh - 160px - 60px);
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
    position: relative;
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
