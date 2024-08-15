<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { Filter } from '@/components/OrderList.vue'
import usePagination, { PAGE_SIZE_LIST } from '@/composable/usePagination'
import { today } from '@/utils/CommonUtils'

const apiOrder = useApiOrder()
const orders = ref<Order[]>([])
const totalOrderCnt = ref(0)
const pageSize = ref<number | null>(PAGE_SIZE_LIST[0])

const filter = ref<Filter>({
  payType: {
    isCash: false,
    isCard: false,
    isNotPaid: false,
  },
  isTodayOrder: false,
  isTodayPay: false,
})

const { pageNo, cOffset } = usePagination(totalOrderCnt, pageSize)

watch(
  [pageNo, pageSize, () => filter.value],
  async () => {
    const statusIn = (filter.value.payType.isNotPaid ? ['COOKED'] : ['COOKED', 'PAID']) as Order['status'][]
    const orderAt = filter.value.isTodayOrder ? today() : undefined
    const payAt = filter.value.isTodayPay ? today() : undefined
    const payTypes = (() => {
      if (filter.value.payType.isCard) return ['CARD']
      else if (filter.value.payType.isCash) return ['CASH']
      else return null
    })() as PaymentEntity['payType'][] | undefined

    const res = await apiOrder.selectList({
      whereOptions: {
        status: { in: statusIn },
        orderAt: { gte: orderAt },
        payAt: { gte: payAt },
        payTypes: payTypes ? { in: payTypes } : undefined,
      },
      limit: pageSize.value ?? undefined,
      offset: cOffset.value,
    })
    orders.value = res.orders
    totalOrderCnt.value = res.totalCnt
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <OrderList
    v-model="orders"
    v-model:filter="filter"
    v-model:pageSize="pageSize"
    :pageSizeList="PAGE_SIZE_LIST"
    :totalItemCnt="totalOrderCnt"
    title="주문내역"
    class="order-list-view"
    :active-collection="true"
    :active-summary="true"
  >
  </OrderList>
</template>

<style lang="scss" scoped></style>
