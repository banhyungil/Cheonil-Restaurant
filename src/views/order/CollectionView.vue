<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { Filter } from '@/components/OrderList.vue'
import usePagination, { PAGE_SIZE_LIST } from '@/composable/usePagination'
import { today } from '@/utils/CommonUtils'
import { addDays } from 'date-fns'

const apiOrder = useApiOrder()
const orders = ref<Order[]>([])
const totalOrderCnt = ref(0)
const pageSize = ref<number | null>(PAGE_SIZE_LIST[0])

const filter = ref({
  orderAtRange: [today(), today()],
} as Filter)

const { pageNo, cOffset } = usePagination(totalOrderCnt, pageSize)

watch(
  [pageNo, pageSize, () => filter.value],
  async () => {
    const statusIn = (filter.value.payType == 'UNPAID' ? ['COOKED'] : ['COOKED', 'PAID']) as Order['status'][]
    const { orderAtRange, payAtRange } = filter.value
    const payTypes = (() => {
      if (filter.value.payType == 'CARD' || filter.value.payType == 'CASH') return [filter.value.payType]
      else return null
    })() as PaymentEntity['payType'][] | undefined

    const res = await apiOrder.selectList({
      whereOptions: {
        status: { in: statusIn },
        orderAt: { gte: orderAtRange[0], lte: orderAtRange[1] },
        payAt: payAtRange ? { gte: payAtRange[0], lte: payAtRange[1] } : undefined,
        payType: payTypes ? { in: payTypes } : undefined,
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
    class="collection-list-view"
    :active-collection="true"
    :active-summary="true"
  >
  </OrderList>
</template>

<style lang="scss">
.collection-list-view {
  overflow: hidden;
}
</style>
