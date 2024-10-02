export default function useApiProduct() {
    const api = useApi()
    const prefix = '/product'

    async function selectList() {
        const res = await api.get(prefix)

        return res.data as ProductEntity[]
    }

    async function select(seq: number) {
        const res = await api.get(`${prefix}/${seq}`)

        return res.data as ProductEntity
    }

    async function create(product: ProductEntityCreation) {
        const res = await api.post(prefix, product)

        return res.data as ProductEntity
    }

    async function update(seq: number, product: ProductEntity) {
        const res = await api.patch(`${prefix}/${seq}`, product)

        return res.data as ProductEntity
    }

    function remove(seq: number) {
        return api.delete(`${prefix}/${seq}`)
    }

    return { selectList, select, create, update, remove }
}
