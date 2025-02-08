export default function useApiExpense() {
    const prefix = '/expenses'
    const api = useApi()

    async function selectList() {
        const res = await api.get(prefix)
        return res.data as ExpenseExt[]
    }

    return { selectList }
}
