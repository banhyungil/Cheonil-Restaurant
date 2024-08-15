import useApiOrder from '@/api/useApiOrder'
import type { Filter } from '@/components/OrderList.vue'
import { today } from '@/utils/CommonUtils'
import type { Ref } from 'vue'

interface Options {
  pageNo: Ref<number>
  pageSize: Ref<number | null>
  filter: Ref<Filter>
  offset: Ref<number>
}
export default function useOrderList(options: Options) {
  const apiOrder = useApiOrder()
  const { pageNo, pageSize, filter, offset } = options
  const orders = ref<Order[]>([])
  const totalOrderCnt = ref<number>()

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
        offset: offset.value,
      })
      orders.value = res.orders
      totalOrderCnt.value = res.totalCnt
    },
    { immediate: true, deep: true }
  )

  return { orders, totalOrderCnt }
}
