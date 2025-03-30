import useApi from './useApi'

interface ExpenseEntityExt extends ExpenseEntity {}
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

    const create = async (menu: ExpenseEntityCreation) => {
        const res = await api.post(prefix, menu)
        return res.data as ExpenseEntity
    }

    const update = async (menu: MenuEntity) => {
        const res = await api.patch(`${prefix}/${menu.seq}`, menu)
        return res.data as ExpenseEntity
    }

    const remove = (seq: number) => {
        return api.delete(`${prefix}/${seq}`)
    }

    return { selectList, select, create, update, remove }
}
