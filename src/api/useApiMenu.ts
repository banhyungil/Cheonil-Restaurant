import useApi from './useApi'
import type { MenuEntity } from '@/@types/Database'

export default function useApiMenu() {
  const api = useApi()
  const prefix = '/menu'

  const select = async () => {
    const res = await api.get(prefix, {
      data: '',
    })

    return res.data.list as MenuEntity[]
    // return [
    //   { categoryName: '찌개', id: '1', name: '김치찌개', price: 8000 },
    //   { categoryName: '찌개', id: '2', name: '된장찌개', price: 8000 },
    //   { categoryName: '기본', id: '3', name: '정식', price: 8000 },
    //   { categoryName: '기본', id: '4', name: '제육볶음', price: 8000 },
    //   { categoryName: '기본', id: '5', name: '떡만두국', price: 8000 },
    //   { categoryName: '기본', id: '6', name: '돈가스', price: 8000 },
    //   { categoryName: '기본', id: '7', name: '치즈돈가스', nameAbv: '치돈', price: 8000 },
    //   { categoryName: '기본', id: '8', name: '고구마치즈돈가스', nameAbv: '고치돈', price: 8000 },
    // ] as MenuEntity[]
  }

  const create = (menu: MenuEntity) => {
    return api.post(prefix, menu)
  }

  const update = (id: string, menu: MenuEntity) => {
    return api.put(`${prefix}/${menu.id}`, menu)
  }

  const remove = (id: string) => {
    return api.delete(`${prefix}/${id}`)
  }

  return { select, create, update, remove }
}
