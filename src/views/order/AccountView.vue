<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type OrderList from '@/components/OrderList.vue'

const apiOrder = useApiOrder()
const orders = ref<Order[]>([])
const totalOrderCnt = ref(0)

type SrchFilter = PaymentEntity['payType'] | 'NOT_PAID' | null
const srchFilter = ref<SrchFilter>()
const cSrchOrders = computed(() => {
  switch (srchFilter.value) {
    case 'NOT_PAID':
      return orders.value.filter((od) => od.status == 'COOKED')
    case 'CARD':
    case 'CASH':
      return orders.value.filter((od) => od.status == 'PAID' && od.payments.every((pm) => pm.payType == srchFilter.value))
    default:
      return orders.value
  }
})

// 당일 정산
// 당일 결제 + 당일 미수
// 당일 미수 = 당일 주문 + 미결제
apiOrder.selectListAccount().then((res) => {
  orders.value = res
})

const cOrdersCash = computed(() => orders.value.filter((od) => od.status == 'PAID' && od.payments.every((p) => p.payType == 'CASH')))
const cOrdersCard = computed(() => orders.value.filter((od) => od.status == 'PAID' && od.payments.every((p) => p.payType == 'CARD')))
const cOrdersNotPaid = computed(() => orders.value.filter((od) => od.status == 'COOKED'))
const cTotalAmountNotPaid = computed(() =>
  cOrdersNotPaid.value.reduce((result, od) => {
    result = result + od.amount
    return result
  }, 0)
)
const cTotalAmount = computed(() => {
  return getTotalPayAmount(cOrdersCash.value) + getTotalPayAmount(cOrdersCard.value) + cTotalAmountNotPaid.value
})

function getPayAmount(payments: PaymentEntity[]) {
  return payments.reduce((result, p) => {
    result = result + p.amount
    return result
  }, 0)
}

function getTotalPayAmount(pOrders: Order[]) {
  return pOrders.reduce((result, od) => {
    result = result + getPayAmount(od.payments)
    return result
  }, 0)
}

function onClickPayType(val: SrchFilter) {
  if (srchFilter.value == val) srchFilter.value = null
  else srchFilter.value = val
}
</script>

<template>
  <div class="account-view">
    <section class="summary">
      <h2>당일 정산</h2>
      <div class="row">
        <v-btn :base-color="srchFilter == 'CASH' ? 'success' : ''" @click="onClickPayType('CASH')">현금</v-btn>
        <h3>{{ getTotalPayAmount(cOrdersCash).toLocaleString() }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="srchFilter == 'CARD' ? 'success' : ''" @click="onClickPayType('CARD')">카드</v-btn>
        <h3>{{ getTotalPayAmount(cOrdersCard).toLocaleString() }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="srchFilter == 'NOT_PAID' ? 'success' : ''" @click="onClickPayType('NOT_PAID')">미수</v-btn>
        <h3>{{ cTotalAmountNotPaid.toLocaleString() }}</h3>
      </div>
      <div class="row">
        <h3 style="color: var(--color-point)">총 매출</h3>
        <h3>{{ cTotalAmount.toLocaleString() }}</h3>
      </div>
    </section>
    <section class="c-list">
      <OrderList
        v-model="cSrchOrders"
        :totalItemCnt="totalOrderCnt"
        title="주문내역"
        class="list"
        :active-paging="false"
        :active-summary="true"
        :active-filter="false"
      >
      </OrderList>
    </section>
  </div>
</template>

<style lang="scss">
.account-view {
  display: flex;
  justify-content: center;
  align-items: center;

  .summary {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    width: 200px;
    padding: 10px;

    .row {
      display: flex;
      flex-direction: column;

      button {
        width: 44px;
      }
    }
  }

  .c-list {
    width: 100%;
    height: 90vh;

    // .v-table__wrapper {
    //   height: 70vh;
    // }
  }
}
</style>
