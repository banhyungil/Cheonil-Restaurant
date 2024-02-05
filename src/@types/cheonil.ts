import {
  type OrderEntity,
  type MenuEntity,
  type StoreEntity,
  type MenuCategoryEntity,
  type StoreCategoryEntity,
} from './Database'

export interface Menu extends Omit<MenuEntity, 'categoryName'> {
  category: MenuCategoryEntity
}
export type MenuC = Omit<Menu, 'id' | 'created' | 'updated'>
export type MenuCategoryEntityC = Omit<MenuCategoryEntity, 'created' | 'updated'>

export interface Store extends Omit<StoreEntity, 'categoryName'> {
  category: StoreCategoryEntity
}
export type StoreC = Omit<Store, 'id' | 'created' | 'updated'>

export type StoreCategoryEntityC = Omit<StoreCategoryEntity, 'created' | 'updated'>
export interface Order extends Omit<OrderEntity, 'storeId'> {
  menues: OrderMenu[]
  store: Store
}
export type OrderC = Omit<Order, 'id' | 'created' | 'updated'>

export interface OrderMenu extends Menu {
  cnt: number
}
export type OrderMenuC = Omit<OrderMenu, 'id' | 'created' | 'updated'>
