export default function useApiProduct() {
    const api = useApi()
    const prefix = '/products'

    async function selectList() {
        const res = await api.get(`${prefix}`)
        return res.data as ProductEntity[]
    }

    async function createList(mpus: ProductEntity[]) {
        return api.post(`${prefix}/batch-create`, mpus)
    }

    async function deleteProductInfo(prdInfoSeq: number) {
        return api.delete(`${prefix}/productInfo/${prdInfoSeq}`)
    }

    return { selectList, createList, deleteProductInfo }
}
