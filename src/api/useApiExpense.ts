import useApi from './useApi'

// url
// post
export default function useApiExpense() {
    const api = useApi()
    const prefix = '/exepnse'

    const selectList = async () => {
        const res = await api.get(prefix, {
            data: '',
        })

        return res.data as ExpenseEntity[]
    }

    const select = async (seq: number) => {
        const res = await api.get(`${prefix}/${seq}`, {
            data: '',
        })

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
