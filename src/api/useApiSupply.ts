export default function useApiSupply() {
    const api = useApi()
    const prefix = '/supply'

    async function selectList() {
        const res = await api.get(prefix)

        return res.data as SupplyEntity[]
    }

    async function select(seq: number) {
        const res = await api.get(`${prefix}/${seq}`)

        return res.data as SupplyEntity
    }

    async function create(supply: SupplyEntityCreation, unitNms: string[]) {
        const res = await api.post(prefix, { supply, unitNms })

        return res.data as SupplyEntity
    }

    async function update(supply: SupplyEntityCreation, unitNms: string[]) {
        const res = await api.patch(`${prefix}/${supply.seq}`, { supply, unitNms })

        return res.data as SupplyEntity
    }

    function remove(seq: number) {
        return api.delete(`${prefix}/${seq}`)
    }

    return { selectList, select, create, update, remove }
}
