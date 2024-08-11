import useApi from './useApi'

export default function useApiMenu() {
  const api = useApi()
  const prefix = '/menu'

  const selectList = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data as MenuEntity[]
    // return [
    //   { ctgNm: '찌개', seq: '1', name: '김치찌개', price: 8000 },
    //   { ctgNm: '찌개', seq: '2', name: '된장찌개', price: 8000 },
    //   { ctgNm: '기본', seq: '3', name: '정식', price: 8000 },
    //   { ctgNm: '기본', seq: '4', name: '제육볶음', price: 8000 },
    //   { ctgNm: '기본', seq: '5', name: '떡만두국', price: 8000 },
    //   { ctgNm: '기본', seq: '6', name: '돈가스', price: 8000 },
    //   { ctgNm: '기본', seq: '7', name: '치즈돈가스', nameAbv: '치돈', price: 8000 },
    //   { ctgNm: '기본', seq: '8', name: '고구마치즈돈가스', nameAbv: '고치돈', price: 8000 },
    // ] as MenuEntity[]
  }

  const create = async (menu: MenuEntityCreation) => {
    const res = await api.post(prefix, menu)
    return res.data as MenuEntity
  }

  const update = async (menu: MenuEntity) => {
    const res = await api.patch(`${prefix}/${menu.seq}`, menu)
    return res.data as MenuEntity
  }

  const remove = (seq: number) => {
    return api.delete(`${prefix}/${seq}`)
  }

  return { selectList, create, update, remove }
}
