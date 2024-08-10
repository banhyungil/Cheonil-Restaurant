import useApi from './useApi'

export default function useApiStoreCtg() {
  const api = useApi()
  const prefix = '/storeCategory'

  const selectList = async () => {
    const res = await api.get(prefix)

    return res.data as StoreCategoryEntity[]
  }

  const create = async (storeCtg: StoreCategoryEntity) => {
    const res = await api.post(prefix, storeCtg)

    return res.data as StoreCategoryEntity
  }

  const update = async (name: string, storeCtg: StoreCategoryEntity) => {
    const res = await api.put(`${prefix}/${name}`, storeCtg)

    return res.data as StoreCategoryEntity
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { selectList, create, update, remove }
}
