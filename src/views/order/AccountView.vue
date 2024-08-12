<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import dayjs from 'dayjs'

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
      gte: dayjs(new Date().setHours(0, 0, 0, 0)).toDate(),
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
</script>

<template>
  <div class="account-view">
    <h2>당일 정산</h2>
    <h3>현금</h3>
    <span>{{ getTotalAmount(cOrdersCash) }}</span>
    <h3>카드</h3>
    <span>{{ getTotalAmount(cOrdersCard) }}</span>
    <h3>미수</h3>
    <span>{{ cTotalAmountNotPaid }}</span>
  </div>
</template>

<style lang="scss" scoped>
.account-view {
}
</style>
