import { useWebSocket as _useWebSocket } from '@vueuse/core'

interface Sync {
  url: URLs
  baseUrl: string
  method: Methods
  resBody: any
  routeParams: any
}
const { data } = _useWebSocket(`ws://localhost:${import.meta.env.VITE_WS_PORT}`)
export default function useWebSocket() {
  const callbackDict = ref({} as CallbackDict)

  /* eslint-disable no-unused-vars */
  function listen(url: ApiMenu.URL, method: 'POST', callback: (resBody: ApiMenu.Post['resBody']) => void): void
  function listen(url: ApiMenu.URLSeq, method: 'PATCH', callback: (resBody: ApiMenu.Post['resBody']) => void): void
  function listen(url: ApiMenu.URLSeq, method: 'DELETE', callback: () => void): void
  function listen(url: ApiMenuCtg.URL, method: 'POST', callback: (resBody: ApiMenuCtg.Post['resBody']) => void): void
  function listen(url: ApiMenuCtg.URLSeq, method: 'PATCH', callback: (resBody: ApiMenuCtg.Post['resBody']) => void): void
  function listen(url: ApiMenuCtg.URLSeq, method: 'DELETE', callback: () => void): void
  function listen(url: URLs, method: Methods, callback: Function) {
    callbackDict.value[url][method].push(callback)
  }
  /* eslint-enable no-unused-vars */

  function isSync(data: any): data is Sync {
    const baseUrls = ['/menu', '/menuCategory', '/store', '/storeCategory', '/placeCategory', '/order', '/payment']
    return (
      typeof data == 'object' &&
      'url' in data &&
      'baseUrl' in data &&
      baseUrls.includes(data.baseUrl) &&
      'method' in data &&
      'resBody' in data &&
      'routeParams' in data
    )
  }
  watch(data, () => {
    if (isSync(data.value) == false) return

    const { url, method } = data.value
    callbackDict.value[url][method]
  })

  return { listen }
}

type CallbackDict = {
  [U in URLs]: Record<Methods, Function[]>
}

type Methods = 'POST' | 'PATCH' | 'DELETE'
type BaseURLs = '/menu' | '/menuCategory' | '/store' | '/storeCategory' | '/placeCategory' | '/order' | '/payment'
type URLSeqs = `${BaseURLs}/:seq`
type URLs = BaseURLs | URLSeqs

export namespace ApiMenu {
  export type URL = Extract<BaseURLs, '/menu'>
  export type URLSeq = `${URL}/:seq`
  export interface Post {
    reqBody: MenuEntityCreation
    resBody: MenuEntity
  }
  export interface Patch {
    reqBody: MenuEntity
    resBody: MenuEntity
  }
  export interface Delete {
    reqBody: MenuEntity['seq']
  }
}

export namespace ApiMenuCtg {
  export type URL = Extract<BaseURLs, '/menuCategory'>
  export type URLSeq = `${URL}/:seq`
  export interface Post {
    reqBody: MenuCategoryEntityCreation
    resBody: MenuCategoryEntity
  }

  export interface Patch {
    URL: `${URL}/:seq`
    reqBody: MenuCategoryEntity
    resBody: MenuCategoryEntity
  }
  export interface Delete {
    URL: `${URL}/:seq`
    reqBody: MenuCategoryEntity['seq']
  }
}
