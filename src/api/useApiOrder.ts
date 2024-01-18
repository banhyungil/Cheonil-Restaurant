import type { Order } from '@/@types/cheonil'
import useApi from './useApi'

export default function useApiOrder() {
  const api = useApi()
  const prefix = 'order'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as Order[]
  }
  return { select }
}
