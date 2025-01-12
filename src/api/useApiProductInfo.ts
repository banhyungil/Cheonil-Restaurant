export default function useApiProductInfo() {
    const api = useApi()
    const prefix = '/productInfo'

    async function selectList() {
        const res = await api.get(prefix)

        return res.data as ProductInfoEntity[]
    }

    async function select(seq: number) {
        const res = await api.get(`${prefix}/${seq}`)

        return res.data as ProductInfoEntity
    }

    async function create(productInfo: ProductInfoCreationEntity) {
        const res = await api.post(prefix, productInfo)

        return res.data as ProductInfoEntity
    }

    async function update(productInfo: ProductInfoEntity) {
        const res = await api.patch(`${prefix}/${productInfo.seq}`, productInfo)

        return res.data as ProductInfoEntity
    }

    function remove(seq: number) {
        return api.delete(`${prefix}/${seq}`)
    }

    return { selectList, select, create, update, remove }
}
