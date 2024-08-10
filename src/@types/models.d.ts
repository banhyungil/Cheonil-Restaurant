/*
 * This file was generated by a tool.
 * Rerun sql-ts to regenerate this file.
 */

/* 메뉴 */
interface MenuEntity {
  /* 메뉴 Seq */
  seq: number

  /* 메뉴 카테고리 Seq */
  ctgSeq: number

  /* 메뉴 명 */
  name: string

  /* 이름 약어 */
  abv?: string | null

  /* 가격 */
  price: number

  /* 비고 */
  cmt?: string | null

  /* 추가정보 */
  options?: string | null

  /* 생성시간 */
  createdAt?: Date | null

  /* 수정시간 */
  updatedAt?: Date | null
}

type MenuEntityCreation = PartialK<MenuEntity, 'seq'>

/* 메뉴 카테고리 */
interface MenuCategoryEntity {
  /* 메뉴 카테고리 Seq */
  seq: number

  /* 메뉴 카테고리 명 */
  name: string

  /* 추가정보 */
  options?: string | null

  /* 생성시간 */
  createdAt?: Date | null

  /* 수정시간 */
  updatedAt?: Date | null
}

/* 주문 */
interface MyOrderEntity {
  /* 주문 Seq */
  seq: number

  /* 매장 Seq */
  storeSeq: number

  /* 총 금액 */
  amount: number

  /* READY: 준비, COMPLETE: 완료 */
  status?: 'READY' | 'COMPLETE'

  /* 주문 시간 */
  orderAt?: Date

  /* 조리완료 시간 */
  completeAt?: Date | null

  /* 비고 */
  cmt?: string | null

  /* 수정시간 */
  updatedAt?: Date
}

type MyOrderEntityCreation = PartialK<MyOrderEntity, 'seq'>

interface Order extends MyOrderEntity {
  orderMenues: OrderMenu[]
  payments: PaymentEntity[]
  store: StoreEntity
}

/* 주문 메뉴 */
interface OrderMenuEntity {
  /* 메뉴 Seq */
  menuSeq: number

  /* 주문 Seq */
  orderSeq: number

  /* 가격 menu는 가격이 바뀔수가 있음 */
  price: number

  /* 수량 */
  cnt: number
}

interface OrderMenu extends OrderMenuEntity {
  menu: MenuEntity
}

/* 주문 메뉴 예약 */
interface OrderMenuRsvEntity {
  /* 메뉴 Seq */
  menuSeq: number

  /* 주문예약 Seq */
  orderRsvSeq: number

  /* 가격 menu는 가격이 바뀔수가 있음 */
  price: number

  /* 수량 */
  cnt: number
}

/* 주문 예약 */
interface OrderRsvEntity {
  /* 주문예약 Seq */
  seq: number

  /* 매장 Seq */
  storeSeq: number

  /* 총 금액 */
  amount: number

  /* HH:MM */
  rsvTime: string

  /* 요일 */
  dayType?: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN' | null

  /* 비고 */
  cmt?: string | null

  /* 추가정보 */
  options?: string | null

  /* 생성시간 */
  createdAt?: Date | null

  /* 수정시간 */
  updatedAt?: Date | null
}

type OrderRsvEntityCreation = PartialK<OrderRsvEntity, 'seq'>

/* 결재 */
interface PaymentEntity {
  /* 결재 Seq */
  seq: number

  /* 주문 Seq */
  orderSeq: number

  /* 결재 금액 */
  amount: number

  /* CASH: 현금, CARD: 카드 */
  payType?: 'CASH' | 'CARD'

  /* 지급날짜 */
  payAt: Date
}

type PaymentEntityCreation = PartialK<PaymentEntity, 'seq'>

/* 장소 카테고리 */
interface PlaceCategoryEntity {
  /* 장소 카테고리 Seq */
  seq: number

  /* 장소 카테고리 명 */
  name: string

  /* 비고 */
  cmt?: string | null

  /* 추가정보 */
  options?: string | null
}

/* 설정 */
interface SettingEntity {
  /* 설정 정보 */
  config: string
}

/* 매장 */
interface StoreEntity {
  /* 매장 Seq */
  seq: number

  /* 매장 카테고리 Seq */
  ctgSeq: number

  /* 장소 카테고리 Seq */
  placeCtgseq?: number | null

  /* 매장 명 */
  name: string

  /* 기타 정보 */
  cmt?: string | null

  /* 위도 */
  latitude?: number | null

  /* 경도 */
  longitude?: number | null

  /* 추가정보 */
  options?: string | null

  /* 생성시간 */
  createdAt?: Date | null

  /* 수정시간 */
  updatedAt?: Date | null
}

type StoreEntityCreation = PartialK<StoreEntity, 'seq'>

/* 매장 카테고리 */
interface StoreCategoryEntity {
  /* 매장 카테고리 Seq */
  seq: number

  /* 장소 카테고리 Seq */
  placeCtgseq?: number | null

  /* 매장 카테고리 명 */
  name: string

  /* 추가정보 */
  options?: string | null

  /* 생성시간 */
  createdAt?: Date | null

  /* 수정시간 */
  updatedAt?: Date | null
}
