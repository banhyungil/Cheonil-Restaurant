import useApi from './useApi'

export default function useApiStoreCtg() {
  const api = useApi()
  const prefix = '/storeCategory'

  const select = async () => {
    const res = await api.get(prefix)

    return res.data.list as StoreCategoryEntity[]
  }

  const create = (storeCtg: StoreCategoryEntity) => {
    return api.post(prefix, storeCtg)
  }

  const update = (name: string, storeCtg: StoreCategoryEntity) => {
    return api.put(`${prefix}/${name}`, storeCtg)
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { select, create, update, remove }
}
