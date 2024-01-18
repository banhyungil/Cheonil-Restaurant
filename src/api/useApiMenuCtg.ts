import type { MenuCategoryEntity } from '@/@types/Database'
import useApi from './useApi'

export default function useApiMenuCtg() {
  const api = useApi()
  const prefix = 'order'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as MenuCategoryEntity[]
  }
  return { select }
}
