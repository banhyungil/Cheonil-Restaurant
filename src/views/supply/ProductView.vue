<script setup lang="ts">
import { VPagination, type VDataTable } from 'vuetify/components'
import _ from 'lodash'
import usePagination from '@/composables/usePagination'
import useSwal from '@/composables/useSwal'
import type { ProductInfoExt } from '@/api/useApiProductInfo'
import { PAGE_SIZE_LIST } from '@/composables/usePagination'

const router = useRouter()
const Swal = useSwal()
const apiProduct = useApiProduct()
const apiSupply = useApiSupply()
const apiProductInfo = useApiProductInfo()

const supplies = ref<SupplyEntity[]>([])
const cSupplyDict = computed(() => _.keyBy(supplies.value, 'seq'))
const prdInfos = ref<ProductInfoExt[]>([])
const cPrdInfos = computed(() => {
    return prdInfos.value.map((prd) => ({ ...prd, supply: cSupplyDict.value[prd.suplSeq] }))
})
const cPrdTotalCnt = computed(() => prdInfos.value.length)

apiSupply.selectList().then((res) => {
    supplies.value = res
})

apiProductInfo.selectList({ expand: 'products' }).then((res) => {
    prdInfos.value = res
})

const pageSize = ref<number>(PAGE_SIZE_LIST[0])
const { pageNo, cOffset, cTotalPage } = usePagination(cPrdTotalCnt, pageSize)
watch(pageNo, () => {
    window.scrollTo(0, 0)
})

const headers = ref([
    { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
    { title: '식자재', key: 'splNm', align: 'center' },
    { title: '제품명', key: 'name', align: 'center' },
    { title: '단위 목록', key: 'unitNms', align: 'center' },
    { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>
const cHeaders = computed(() => {
    return isEdit.value ? headers.value : headers.value.filter((h) => h.key != 'actions')
})

const isEdit = ref(false)

const cDtProducts = computed(() => {
    const result = cPrdInfos.value.map((prdInfo, idx) => {
        const unitNms = prdInfo.products.flatMap((prd) => {
            const { unit } = prd
            if (unit.isUnitCnt) return prd.unitCntList == null ? [] : prd.unitCntList?.map((unitCnt) => `${unitCnt}${unit.name}`)
            else return unit.name
        })

        return {
            ...prdInfo,
            no: cOffset.value + idx + 1,
            splNm: prdInfo.supply.name,
            unitNms: unitNms.join(' '),
            actions: prdInfo.seq,
        }
    })
    console.log('cDtProducts', result)

    return result
})

function addProduct() {
    router.push('/productEdit')
}

function onUpdate(seq: number) {
    router.push(`/productEdit/${seq}`)
}

async function onRemove(seq: number) {
    if ((await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) == false) return

    await apiProductInfo.remove(seq)
    _.remove(prdInfos.value, (prd) => prd.seq == seq)
    Swal.fireCustom({ toast: true, messageType: 'remove' })
}
</script>

<template>
    <v-data-table class="order-list" :headers="cHeaders" :items="cDtProducts" item-value="seq" :items-per-page="0" :hide-default-footer="true">
        <template #top>
            <div class="flex justify-end">
                <v-btn v-if="isEdit" @click="addProduct"> 추가 </v-btn>
                <v-btn @click="() => (isEdit = !isEdit)" :color="isEdit ? 'primary' : ''" v-tooltip="'편집'">
                    <font-awesome-icon :icon="['fas', 'pen']" />
                </v-btn>
            </div>
        </template>
        <template #item.actions="{ value }">
            <div style="display: flex; justify-content: center; gap: 10px">
                <button @click="onUpdate(value)" style="color: var(--color-success)" v-tooltip="'수정'">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                </button>
                <button @click="onRemove(value)" style="color: var(--color-danger)" v-tooltip="'삭제'">
                    <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
            </div>
        </template>
        <template #bottom>
            <div class="c-page">
                <VPagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></VPagination>
                <div class="right">
                    <h3 style="width: max-content">총: {{ cPrdTotalCnt }} 건</h3>
                    <v-select class="select" :items="PAGE_SIZE_LIST" v-model="pageSize" item-value="key" item-title="title" density="comfortable"></v-select>
                </div>
            </div>
        </template>
    </v-data-table>
</template>

<style lang="scss">
.order-list {
    .v-table__wrapper {
        margin: 8px 0;
    }

    .pay-info {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .type {
            font-weight: bold;
            color: var(--color-danger);

            &.collected {
                color: var(--color-second);
            }
        }

        .c-btn {
            display: flex;
            justify-content: center;
            gap: 4px;
            padding: 6px 0;

            button {
                min-width: 0;
                width: fit-content;
                height: 30px;
            }
        }
    }

    .c-summary {
        display: flex;
        flex-direction: column;
        align-items: end;
        color: var(--color-second);
        font-weight: bold;

        .grp {
            padding: 10px;

            .title {
                @apply text-lg;
            }
        }
    }

    .c-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 50px;

        .page {
            width: 100%;
        }

        .right {
            position: absolute;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            column-gap: 10px;
            width: 230px;

            & > * {
                display: flex;
                align-items: center;
            }
        }

        .select {
            display: flex;
            align-items: center;
            width: max-content;
        }
    }
}
</style>
