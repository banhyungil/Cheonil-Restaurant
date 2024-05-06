import useToast from '@/composable/useToast'
import axios from 'axios'

export default function useApi() {
  const api = axios.create({ baseURL: '/app' })
  const Toast = useToast()

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      debugger
      // whatever you want to do with the error
      Toast.fire({
        title: error,
        timer: 10000,
      })
    }
  )

  return api
}
