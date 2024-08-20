import { useWebSocket as _useWebSocket } from '@vueuse/core'

interface Sync {
  baseUrl: string
  url: string
  body: any
}
const { data } = _useWebSocket(`ws://localhost:${import.meta.env.VITE_WS_PORT}`)
export default function useWebSocket() {
  const callbackDict = ref<CallbackDict>({})

  /* eslint-disable no-unused-vars */
  function listen(url: ApiMenu.URL, method: 'POST', callback: (resBody: ApiMenu.Post['resBody']) => void): void
  function listen(url: string, method: Method, callback: Function) {
    // callbackDict[url][method].push(callback)
  }
  /* eslint-enable no-unused-vars */

  watch(data, () => {})

  return { listen }
}

interface CallbackDict {
  [url: string]: {
    POST: Function[]
    PATCH: Function[]
    DELETE: Function[]
  }
}

type Method = 'POST' | 'PATCH' | 'DELETE'

export namespace ApiMenu {
  export type URL = '/menu'
  export interface Post {
    reqBody: MenuEntityCreation
    resBody: MenuEntity
  }
  export interface Patch {
    reqBody: MenuEntityCreation
    resBody: MenuEntity
  }
  export interface Delete {
    reqBody: MenuEntity
    resBody: MenuEntity
  }

  type Seq = number
  export interface Delete {
    Url: `${URL}/${Seq}`
  }
}

export namespace ApiMenuCtg {
  export type URL = '/menu'
  export interface Post {
    reqBody: MenuEntityCreation
    resBody: MenuEntity
  }
}
