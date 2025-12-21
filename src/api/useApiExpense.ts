import useApi from './useApi'

interface ExpenseProductExt extends ExpenseProductEntity {
    product: ProductExt
}
// url
// post
export default function useApiExpense() {
    const api = useApi()
    const prefix = '/expenses'

    const selectList = async () => {
        const res = await api.get(prefix)

        return res.data as ExpenseEntity[]
    }

    const select = async (seq: number) => {
        const res = await api.get(`${prefix}/${seq}`)

        return res.data as ExpenseEntity
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
