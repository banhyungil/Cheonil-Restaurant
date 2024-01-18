import axios from 'axios'

export default function useApi() {
  const api = axios.create()
  return api
}
