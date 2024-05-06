import type { MenuCategoryEntity } from '@/@types/Database'
import useApi from './useApi'

export default function useApiMenuCtg() {
  const api = useApi()
  const prefix = '/menuCategory'

  const select = async () => {
    const res = await api.get(prefix)

    return res.data.list as MenuCategoryEntity[]
  }

  const create = (menuCtg: MenuCategoryEntity) => {
    return api.post(prefix, menuCtg)
  }

  const update = (name: string, menuCtg: MenuCategoryEntity) => {
    return api.put(`${prefix}/${name}`, menuCtg)
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { select, create, update, remove }
}
