import useSwal from '@/composable/useSwal'
import axios from 'axios'

export const Op: OpTypesCustom = {
  eq: 'eq',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte',
}
export default function useApi() {
  const api = axios.create({ baseURL: '/app' })
  const Swal = useSwal()

  api.interceptors.response.use(
    (response) => {
      if (response.data == '') response.data = null
      return response
    },
    (error) => {
      // whatever you want to do with the error
      Swal.fireCustom({
        toast: true,
        icon: 'error',
        title: error,
        timer: 10000,
      })
    }
  )

  return api
}
