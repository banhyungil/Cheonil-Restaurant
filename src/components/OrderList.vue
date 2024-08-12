<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { VDataTable } from 'vuetify/components'
import _ from 'lodash'
import dayjs from 'dayjs'
import usePagination from '@/composable/usePagination'
import useSwal, { type SweetAlertOptionsCustom } from '@/composable/useSwal'
import useApiPayment from '@/api/useApiPayment'
import { Dropdown } from 'floating-vue'

const Swal = useSwal()
const apiOrder = useApiOrder()
const apiPayment = useApiPayment()

interface Props {
  title: string
  // whereInfo?: WhereInfo<MyOrderEntity>
  exceptKeys?: (keyof MyOrderEntity)[]
  activeDelete?: boolean
  activeCollection?: boolean
}

const props = defineProps<Props>()

const headers = ref([
  { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
  { title: '매장명', key: 'storeNm', align: 'center' },
  { title: '메뉴', key: 'menuNm', align: 'center' },
  { title: '주문시간', key: 'orderAtF', align: 'center' },
  { title: '완료시간', key: 'completeAtF', align: 'center' },
  { title: '결제방식', key: 'payInfo', align: 'center' },
  { title: '결제날짜', key: 'payAtF', align: 'center' },
  { title: '결제금액', key: 'payAmount', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center' },
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

const srch = ref({
  payType: {
    isCash: false,
    isCard: false,
    isNotPaid: false,
  },
  isToday: false,
})

const totalOrderCnt = ref(0)

const { pageNo, pageSize, cOffset, cTotalPage, PAGE_SIZE_LIST } = usePagination(totalOrderCnt)

const isEdit = ref(false)

const cDtOrders = computed(() =>
  orders.value.map((od, idx) => {
    const menuNm = od.orderMenues.map((om) => om.menu.name + om.cnt).join(', ')
    const orderAtF = dayjs(od.orderAt).format('YY.MM.DD HH:MM')

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

    const completeAtF = dayjs(od.completeAt).format('YY.MM.DD HH:MM')
    const payAtF = dayjs(payAt).format('YY.MM.DD HH:MM')
    const payAmount = od.payments.reduce((result, p) => (result = result + p.amount), 0)

    return {
      ...od,
      no: idx + 1,
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
  [pageNo, pageSize, () => srch.value, () => srch.value.isToday],
  () => {
    const statusIn = (srch.value.payType.isNotPaid ? ['COOKED'] : ['COOKED', 'PAID']) as Order['status'][]
    const orderAt = srch.value.isToday ? dayjs(new Date().setHours(0, 0, 0, 0)).toDate() : undefined
    const payTypes = (() => {
      if (srch.value.payType.isCard) return ['CARD']
      else if (srch.value.payType.isCash) return ['CASH']
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
    srch.value.payType.isCash = !srch.value.payType.isCash
    srch.value.payType.isCard = false
    srch.value.payType.isNotPaid = false
  } else if (payType == 'CARD') {
    srch.value.payType.isCash = false
    srch.value.payType.isCard = !srch.value.payType.isCard
    srch.value.payType.isNotPaid = false
  } else {
    srch.value.payType.isCash = false
    srch.value.payType.isCard = false
    srch.value.payType.isNotPaid = !srch.value.payType.isNotPaid
  }
}
</script>

<template>
  <v-data-table class="order-list" :show-select="isEdit && activeCollection" v-model="checkedSeqs" :headers="cHeaders" :items="cDtOrders" item-value="seq">
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <section class="top">
        <Dropdown placement="right">
          <v-btn v-tooltip="'필터'"><font-awesome-icon :icon="['fas', 'filter']" /></v-btn>
          <template #popper>
            <div>
              <div>
                <h3>결제 방식</h3>
                <v-btn :base-color="srch.payType.isNotPaid ? 'success' : ''" @click="filterPayType(null)">미수</v-btn>
                <v-btn :base-color="srch.payType.isCash ? 'success' : ''" @click="filterPayType('CASH')">현금</v-btn>
                <v-btn :base-color="srch.payType.isCard ? 'success' : ''" @click="filterPayType('CARD')">카드</v-btn>
              </div>

              <div>
                <h3>기타</h3>
                <v-btn :base-color="srch.isToday ? 'success' : ''" @click="srch.isToday = !srch.isToday">당일</v-btn>
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
      <div class="c-page" style="display: flex">
        <v-pagination class="page" v-model="pageNo" :length="cTotalPage"></v-pagination>
        <v-select class="select" :items="PAGE_SIZE_LIST" v-model="pageSize" density="comfortable"></v-select>
      </div>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
.order-list {
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

  .c-page {
    display: flex;

    .page {
      width: 100%;
    }
    .select {
      width: 100px;
    }
  }
}
</style>
