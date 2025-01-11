export default function useApiMapProductUnit() {
    const api = useApi()
    const prefix = '/mapProductUnit'

    async function createList(mpus: MapProductUnitEntity[]) {
        return api.post(`${prefix}/batch-create`, mpus)
    }

    async function deleteList(mpus: MapProductUnitEntity[]) {
        return api.post(`${prefix}/batch-delete`, mpus)
    }

    return { createList, deleteList }
}
