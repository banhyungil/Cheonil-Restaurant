export type ProductExt = ProductEntity & { prdInfo: ProductInfoEntity; unit: UnitEntity }

export default function useApiProduct() {
    const api = useApi()
    const prefix = '/products'

    // TODO QueryParam 수정 UnitEditView 에러수정
    // QueryParam Expand 배열로 입력받게 수정
    async function selectList(query?: QueryParam) {
        const res = await api.get(`${prefix}`, { params: query })
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
