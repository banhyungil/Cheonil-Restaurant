<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type OrderList from '@/components/OrderList.vue'
import { toDate } from 'date-fns'

const apiOrder = useApiOrder()

// 당일 정산
// 당일 결제 + 당일 미수
// 당일 미수 = 당일 주문 + 미결제
const OrderListComp = ref({} as InstanceType<typeof OrderList>)
onMounted(() => {})
const cOrders = computed({
  get() {
    return OrderListComp.value.orders ?? []
  },
  set(val) {
    OrderListComp.value.orders = val
  },
})
const cOrdersCash = computed(() => cOrders.value.filter((od) => od.payments.every((p) => p.payType == 'CASH')))
const cOrdersCard = computed(() => cOrders.value.filter((od) => od.payments.every((p) => p.payType == 'CARD')))
const cOrdersNotPaid = computed(() => cOrders.value.filter((od) => od.payments.length == 0))
const cTotalAmountNotPaid = computed(() =>
  cOrdersNotPaid.value.reduce((result, od) => {
    result = result + od.amount
    return result
  }, 0)
)

function getPayAmount(payments: PaymentEntity[]) {
  return payments.reduce((result, p) => {
    result = result + p.amount
    return result
  }, 0)
}

function getTotalAmount(pOrders: Order[]) {
  return pOrders.reduce((result, od) => {
    result = result + getPayAmount(od.payments)
    return result
  }, 0)
}

function onClickPayType(payType: PaymentEntity['payType'] | null) {
  if (payType == null) cOrders.value.filter((od) => od.status == 'COOKED')
  else cOrders.value = cOrders.value.filter((od) => od.payments.every((pm) => pm.payType == payType))
}
</script>

<template>
  <div class="account-view">
    <section class="summary">
      <h2>당일 정산</h2>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isCash ? 'success' : ''" @click="onClickPayType('CASH')">현금</v-btn>
        <h3>{{ getTotalAmount(cOrdersCash) }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isCard ? 'success' : ''" @click="onClickPayType('CARD')">카드</v-btn>
        <h3>{{ getTotalAmount(cOrdersCard) }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isNotPaid ? 'success' : ''" @click="onClickPayType(null)">미수</v-btn>
        <h3>{{ cTotalAmountNotPaid }}</h3>
      </div>
      <div class="row">
        <h3 style="color: var(--color-point)">합계</h3>
        <h3>{{ getTotalAmount(cOrders) }}</h3>
      </div>
    </section>
    <section class="c-list">
      <OrderList
        ref="OrderListComp"
        v-model:filter="filter"
        title="주문 목록"
        class="list"
        :active-delete="true"
        :active-paging="false"
        :active-summary="true"
        :active-filter="false"
        :is-account="true"
      ></OrderList>
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
