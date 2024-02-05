import type { Store, StoreC } from '@/@types/cheonil'
import useApi from './useApi'

export default function useApiStore() {
  const api = useApi()
  const prefix = '/store'

  const select = async () => {
    const res = await api.get(prefix)

    return res.data.list as Store[]
  }

  const save = (store: StoreC) => {
    return api.post(prefix, store)
  }

  return { select, save }
}
