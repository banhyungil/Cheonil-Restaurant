import useApi from './useApi'

export default function useApiPayment() {
  const api = useApi()
  const prefix = '/payment'

  async function create(payment: PaymentEntityCreation) {
    const res = await api.post(prefix, payment)

    return res.data as PaymentEntity
  }

  async function update(payment: PaymentEntity) {
    const res = await api.patch(`${prefix}${payment.seq}`, payment)

    return res.data as PaymentEntity
  }

  function remove(seqs: number[]) {
    return api.post(`${prefix}/batch/delete`, seqs)
  }

  return { create, update, remove }
}
