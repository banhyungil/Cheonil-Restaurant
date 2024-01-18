import type { StoreCategoryEntity } from '@/@types/Database'
import useApi from './useApi'

export default function useApiStoreCtg() {
  const api = useApi()
  const prefix = 'order'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as StoreCategoryEntity[]
  }
  return { select }
}
