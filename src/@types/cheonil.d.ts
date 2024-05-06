import {
  type OrderEntity,
  type MenuEntity,
  type StoreEntity,
  type MenuCategoryEntity,
  type StoreCategoryEntity,
} from './Database'

export type MenuCategoryEntityC = Omit<MenuCategoryEntity, 'created' | 'updated'>

export interface Store extends Omit<StoreEntity, 'categoryName'> {
  category: StoreCategoryEntity
}
export type StoreC = Omit<Store, 'id' | 'created' | 'updated'>

export type StoreCategoryEntityC = Omit<StoreCategoryEntity, 'created' | 'updated'>
