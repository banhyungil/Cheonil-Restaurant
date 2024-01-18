import { type OrderEntity, type MenuEntity, type StoreEntity } from './Database'

export interface Menu extends MenuEntity {
  category: string
}

export interface Store extends StoreEntity {
  category: string
}

export interface Order extends OrderEntity {
  menues: OrderMenu[]
  store: Store
}

export interface OrderMenu extends Menu {
  cnt: number
}
