export default function useApiProduct() {
    const api = useApi()
    const prefix = '/product'

    async function createList(mpus: ProductEntity[]) {
        return api.post(`${prefix}/batch-create`, mpus)
    }

    async function deleteProductInfo(prdInfoSeq: number) {
        return api.delete(`${prefix}/productInfo/${prdInfoSeq}`)
    }

    return { createList, deleteProductInfo }
}
