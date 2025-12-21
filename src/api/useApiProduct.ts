export type ProductExt = ProductEntity & { prdInfo: ProductInfoEntity; unit: UnitEntity }

export default function useApiProduct() {
    const api = useApi()
    const prefix = '/products'

    type Expands = 'prdInfo' | 'unit'
    async function selectList() {
        const expands: Expands[] = ['prdInfo', 'unit']

        const res = await api.get(`${prefix}`, { params: { expand: expands.join(',') } })
        const products = res.data as ProductExt[]

        // unitCntList 기본값 설정
        products.forEach((prd) => (prd.unitCntList = prd.unitCntList ?? []))

        return products
    }

    async function createList(mpus: ProductEntity[]) {
        return api.post(`${prefix}/batch-create`, mpus)
    }

    async function deleteProductInfo(prdInfoSeq: number) {
        return api.delete(`${prefix}/productInfo/${prdInfoSeq}`)
    }

    return { selectList, createList, deleteProductInfo }
}
