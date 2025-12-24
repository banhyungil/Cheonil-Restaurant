import useApi from './useApi'
import type { ProductExt } from './useApiProduct'

export interface ExpenseExt extends ExpenseEntity {
    store?: StoreEntity
    category?: ExpenseCategoryEntity
    expsPrds?: (ExpenseProductEntity & { product: ProductExt })[]
}
// url
// post
export default function useApiExpense() {
    const api = useApi()
    const prefix = '/expenses'

    const selectList = async (query?: QueryParam) => {
        const res = await api.get(prefix, { params: query })

        return res.data as ExpenseExt[]
    }

    const select = async (seq: number, query?: QueryParam) => {
        const res = await api.get(`${prefix}/${seq}`, { params: query })

        return res.data as ExpenseExt
    }

    const create = async (expense: ExpenseEntityCreation, expenseProducts: ExpenseProductEntityCreation[]) => {
        const res = await api.post(prefix, { expense, expenseProducts })
        return res.data as ExpenseEntity
    }

    const update = async (expense: ExpenseEntity, expenseProducts: ExpenseProductEntityCreation[]) => {
        const res = await api.patch(`${prefix}/${expense.seq}`, { expense, expenseProducts })
        return res.data as ExpenseEntity
    }

    const remove = (seq: number) => {
        return api.delete(`${prefix}/${seq}`)
    }

    return { selectList, select, create, update, remove }
}
