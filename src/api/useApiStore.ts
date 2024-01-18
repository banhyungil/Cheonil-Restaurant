import type { Store } from '@/@types/cheonil'
import useApi from './useApi'

export default function useApiStore() {
  const api = useApi()
  const prefix = 'store'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as Store[]
  }
  return { select }
}
