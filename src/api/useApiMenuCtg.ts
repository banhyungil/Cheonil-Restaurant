import useApi from './useApi'

export default function useApiMenuCtg() {
  const api = useApi()
  const prefix = '/menuCategory'

  const selectList = async () => {
    const res = await api.get(prefix)

    return res.data as MenuCategoryEntity[]
  }

  const create = async (menuCtg: MenuCategoryEntity) => {
    const res = await api.post(prefix, menuCtg)
    return res.data as MenuCategoryEntity
  }

  const update = async (name: string, menuCtg: MenuCategoryEntity) => {
    const res = await api.put(`${prefix}/${name}`, menuCtg)
    return res.data as MenuCategoryEntity
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { selectList, create, update, remove }
}
