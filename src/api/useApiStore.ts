import useApi from './useApi'

export default function useApiStore() {
  const api = useApi()
  const prefix = '/store'

  const selectList = async () => {
    const res = await api.get(prefix)

    return res.data.list as StoreEntity[]
    // return [
    //   { name: '1', name: '중앙1', ctgNm: '중앙' },
    //   { name: '2', name: '중앙2', ctgNm: '중앙' },
    //   { name: '3', name: '중앙3', ctgNm: '중앙' },
    //   { name: '4', name: '중앙4', ctgNm: '중앙' },
    //   { name: '5', name: '농협1', ctgNm: '농협' },
    //   { name: '6', name: '농협2', ctgNm: '농협' },
    //   { name: '7', name: '농협3', ctgNm: '농협' },
    //   { name: '8', name: '농협4', ctgNm: '농협' },
    // ] as StoreEntity[]
  }

  const create = (store: StoreEntity) => {
    return api.post(prefix, store)
  }

  const update = (store: StoreEntity) => {
    return api.put(`${prefix}/${store.seq}`, store)
  }

  const remove = (seq: number) => {
    return api.delete(`${prefix}/${seq}`)
  }

  return { selectList, create, update, remove }
}
