import useApi from './useApi'
import qs from 'qs'

type OrderCURes = Omit<Order, 'payments' | 'store'>

export default function useApiOrder() {
  const api = useApi()
  const prefix = '/order'

  async function selectList(whereInfo: WhereInfo<MyOrderEntity>): Promise<{ orders: Order[]; totalCnt: number }>
  async function selectList(): Promise<Order[]>
  async function selectList(whereInfo?: WhereInfo<MyOrderEntity>) {
    const queryStr = qs.stringify(whereInfo)
    const resData = (await api.get(`${prefix}?${queryStr}`)).data as { orders: Order[]; totalCnt: number }

    return whereInfo ? resData : resData.orders
  }

  const select = async (seq: string) => {
    const res = await api.get(`${prefix}/${seq}`)

    return res.data as Order
  }

  const create = async (order: MyOrderEntityCreation, orderMenues: OrderMenuEntityCreation[]) => {
    const res = await api.post(prefix, {
      order,
      orderMenues,
    })
    return res.data as OrderCURes
  }

  const update = async (order: MyOrderEntity, orderMenues: OrderMenuEntityCreation[] = []) => {
    const res = await api.patch(`${prefix}/${order.seq!}`, {
      order,
      orderMenues,
    })
    return res.data as OrderCURes
  }

  const remove = async (seq: number) => {
    return api.delete(`${prefix}/${seq}`)
  }

  return { selectList, select, create, update, remove }
}
