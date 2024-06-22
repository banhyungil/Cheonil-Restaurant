import useApi from './useApi'

export default function useApiStore() {
  const api = useApi()
  const prefix = '/store'

  const select = async () => {
    const res = await api.get(prefix)

    return res.data.list as StoreEntity[]
    // return [
    //   { name: '1', name: '중앙1', categoryName: '중앙' },
    //   { name: '2', name: '중앙2', categoryName: '중앙' },
    //   { name: '3', name: '중앙3', categoryName: '중앙' },
    //   { name: '4', name: '중앙4', categoryName: '중앙' },
    //   { name: '5', name: '농협1', categoryName: '농협' },
    //   { name: '6', name: '농협2', categoryName: '농협' },
    //   { name: '7', name: '농협3', categoryName: '농협' },
    //   { name: '8', name: '농협4', categoryName: '농협' },
    // ] as StoreEntity[]
  }

  const create = (store: StoreEntity) => {
    return api.post(prefix, store)
  }

  const update = (name: string, store: StoreEntity) => {
    return api.put(`${prefix}/${store.name}`, store)
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { select, create, update, remove }
}
