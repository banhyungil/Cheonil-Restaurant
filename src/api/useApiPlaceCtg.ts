import useApi from './useApi'

export default function useApiPlaceCtg() {
  const api = useApi()
  const prefix = '/placeCategory'

  const selectList = async () => {
    const res = await api.get(prefix)

    return res.data as PlaceCategoryEntity[]
  }

  const create = async (placeCtg: PlaceCategoryEntity) => {
    const res = await api.post(prefix, placeCtg)

    return res.data as PlaceCategoryEntity
  }

  const update = async (name: string, placeCtg: PlaceCategoryEntity) => {
    const res = await api.put(`${prefix}/${name}`, placeCtg)

    return res.data as PlaceCategoryEntity
  }

  const remove = (name: string) => {
    return api.delete(`${prefix}/${name}`)
  }

  return { selectList, create, update, remove }
}
