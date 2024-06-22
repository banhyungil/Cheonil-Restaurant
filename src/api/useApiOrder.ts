import useApi, { Op } from './useApi'
import qs from 'qs'

export type OrderResult = OrderEntity & {
  store: StoreEntity
  orderMenues: (OrderMenuEntity & { menu: MenuEntity })[]
}

export default function useApiOrder() {
  const api = useApi()
  const prefix = '/order'

  const selectList = async (whereInfo?: WhereInfo<OrderEntity>) => {
    const queryStr = qs.stringify(whereInfo)
    const res = await api.get(`${prefix}?${queryStr}`)

    return res.data.list.map((od: any) => {
      return { ...od, orderTime: new Date(od.orderTime) }
    }) as OrderResult[]
  }

  const select = async (seq: string) => {
    const res = await api.get(`${prefix}/${seq}`)

    return res.data as OrderResult
  }

  const create = async (
    order: PartialK<OrderEntity, 'seq'>,
    orderMenues: PartialK<OrderMenuEntity, 'orderSeq'>[]
  ) => {
    return api.post(prefix, {
      order,
      orderMenues,
    })
  }

  const update = async (order: OrderEntity, orderMenues: OrderMenuEntity[] = []) => {
    return api.patch(`${prefix}/${order.seq!}`, {
      order,
      orderMenues,
    })
  }

  const remove = async (orderId: number) => {
    return api.delete(`${prefix}/${orderId}`)
  }

  return { selectList, select, create, update, remove }
}
