import { defineStore } from 'pinia'
export const useOrderStore = defineStore('order', () => {
  const orders = ref([] as Order[])

  return { orders }
})

export function getPayAmount(payments: PaymentEntity[]) {
  return payments.reduce((result, p) => {
    result = result + p.amount
    return result
  }, 0)
}

export function getTotalPayAmount(orders: Order[]) {
  return orders.reduce((result, od) => {
    result = result + getPayAmount(od.payments)
    return result
  }, 0)
}

export function getTotalOrderAmount(orders: Order[]) {
  return orders.reduce((result, od) => {
    result = result + od.amount
    return result
  }, 0)
}
