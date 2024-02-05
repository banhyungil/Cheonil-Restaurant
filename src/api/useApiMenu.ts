import type { Menu } from '@/@types/cheonil'
import useApi from './useApi'

export default function useApiMenu() {
  const api = useApi()
  const prefix = '/menu'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as Menu[]
  }

  return { select }
}
