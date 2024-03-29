/*
 * This file was generated by a tool.
 * Rerun sql-ts to regenerate this file.
 */

/** 설정
각종 설정을 json 타입으로 저장한다. */
export interface ConfigEntity {
  config: Object
  key: string
}

/** 메뉴 */
export interface MenuEntity {
  id: string
  categoryName: string | null
  name: string
  price: number
  cmt?: string | null
  created: Date | null
  updated?: Date | null
}

/** 메뉴 카테고리 */
export interface MenuCategoryEntity {
  name: string
  created: Date | null
  updated?: Date | null
}

/** 주문 메뉴 */
export interface OrderMenuRsvEntity {
  /** 수량 */
  cnt: string
  menuId: string
  orderRsvId: string

  /** 가격
  menu는 가격이 바뀔수가 있음 */
  price: number
}

/** 주문 예약
예약 정보에 따라 t_order를 생성한다 */
export interface OrderRsvEntity {
  /** 총 금액 */
  id: string
  amount: string | null

  /** cash: 현금, card: 카드, credit: 외상 */
  payType?: any
  periodType: any | null

  /** 기타 정보 */
  reqcmt?: string | null

  /** HH:MM */
  rsvTime: string
  storeId: string
  created: Date | null
  updated?: Date | null
}
export interface PaymentEntity {
  id: string

  /** 실제 대금 납부일 */
  payDate: Date | null
  created: Date | null
  updated?: Date | null
}
export interface StoreEntity {
  id: string
  categoryName: string

  /** 기타 정보 */
  cmt?: string | null
  name: string
  created: Date | null
  updated?: Date | null
}
export interface StoreCategoryEntity {
  name: string
  created: Date | null
  updated?: Date | null
}

/** 주문 */
export interface OrderEntity {
  /** 총 금액  **/
  amount: string | null
  id?: string
  payDate: Date | null
  paymentid: string

  /** cash: 현금, card: 카드 */
  payType?: any | null

  /** 기타 정보 */
  reqcmt?: string | null

  /** ready: 준비, complete: 완료 */
  status?: any
  storeId: string

  /** 주문 시간 */
  time?: Date
  created: Date | null
  updated?: Date | null
}

/** 주문 메뉴 */
export interface OrderMenuEntity {
  /** 수량 */
  orderId: string
  menuId: string
  cnt: string

  /** 가격
  menu는 가격이 바뀔수가 있음 */
  price: number
}
