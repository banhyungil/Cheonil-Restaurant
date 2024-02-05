import { type StoreCategoryEntityC } from './../@types/cheonil'
import type { StoreCategoryEntity } from '@/@types/Database'
import useApi from './useApi'
import useToast from '@/composable/useToast'

export default function useApiStoreCtg() {
  const api = useApi()
  const Toast = useToast()
  const prefix = '/store-category'

  const select = async () => {
    const res = await api.get(prefix)

    return res.data.list as StoreCategoryEntity[]
  }

  const save = (storeCtg: StoreCategoryEntityC) => {
    return api
      .post(prefix, storeCtg)
      .then(() => {
        Toast.create()
      })
      .catch(() => {
        Toast.fire({ title: '에러', icon: 'error' })
      })
  }
  return { select, save }
}
