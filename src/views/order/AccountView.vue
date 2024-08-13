<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type OrderList from '@/components/OrderList.vue'
import type { Filter } from '@/components/OrderList.vue'
import { toDate } from 'date-fns'

const apiOrder = useApiOrder()

const orders = ref<Order[]>([])
const cOrdersCash = computed(() => orders.value.filter((od) => od.payments.every((p) => p.payType == 'CASH')))
const cOrdersCard = computed(() => orders.value.filter((od) => od.payments.every((p) => p.payType == 'CARD')))
const cOrdersNotPaid = computed(() => orders.value.filter((od) => od.payments.length == 0))
const cTotalAmountNotPaid = computed(() =>
  cOrdersNotPaid.value.reduce((result, od) => {
    result = result + od.amount
    return result
  }, 0)
)
apiOrder
  .selectList({
    orderAt: {
      gte: toDate(new Date().setHours(0, 0, 0, 0)),
    },
  })
  .then((res) => {
    orders.value = res.orders
  })

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

const filter = ref({} as Filter)
const OrderListComp = ref({} as InstanceType<typeof OrderList>)

onMounted(() => {
  OrderListComp.value.filter.isToday = true
})

function onClickPayType(payType: keyof Filter['payType']) {
  Object.keys(OrderListComp.value.filter.payType).forEach((_key) => {
    const key = _key as keyof Filter['payType']
    if (key == payType) OrderListComp.value.filter.payType[key] = !OrderListComp.value.filter.payType[key]
    else OrderListComp.value.filter.payType[key] = false
  })
}
</script>

<template>
  <div class="account-view">
    <section class="summary">
      <h2>당일 정산</h2>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isCash ? 'success' : ''" @click="onClickPayType('isCash')">현금</v-btn>
        <h3>{{ getTotalAmount(cOrdersCash) }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isCard ? 'success' : ''" @click="onClickPayType('isCard')">카드</v-btn>
        <h3>{{ getTotalAmount(cOrdersCard) }}</h3>
      </div>
      <div class="row">
        <v-btn :base-color="OrderListComp?.filter?.payType?.isNotPaid ? 'success' : ''" @click="onClickPayType('isNotPaid')">미수</v-btn>
        <h3>{{ cTotalAmountNotPaid }}</h3>
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
