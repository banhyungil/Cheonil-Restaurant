import useApi from './useApi'

export default function useApiPlaceCtg() {
  const api = useApi()
  const prefix = '/placeCategory'

  const selectList = async () => {
    const res = await api.get(prefix)

    return res.data.list as PlaceCategoryEntity[]
  }

  const create = (placeCtg: PlaceCategoryEntity) => {
    return api.post(prefix, placeCtg)
  }

  const update = (name: string, placeCtg: PlaceCategoryEntity) => {
    return api.put(`${prefix}/${name}`, placeCtg)
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { selectList, create, update, remove }
}
