<script setup lang="ts">
import type { VDataTable } from 'vuetify/components'
import { PAGE_SIZE_LIST } from '@/composables/usePagination'
import useSwal from '@/composables/useSwal'
import _ from 'lodash'

const router = useRouter()
const Swal = useSwal()
const apiSupply = useApiSupply()

const supplies = ref<SupplyEntity[]>([])
const cSuplTotalCnt = computed(() => supplies.value.length)

apiSupply.selectList().then((res) => {
    supplies.value = res
})

const pageSize = ref<number>(PAGE_SIZE_LIST[0])
const { pageNo, cOffset, cTotalPage } = usePagination(cSuplTotalCnt, pageSize)
watch(pageNo, () => {
    window.scrollTo(0, 0)
})

const headers = ref([
    { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
    { title: '식자재', key: 'name', align: 'center' },
    { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>
const cHeaders = computed(() => {
    return isEdit.value ? headers.value : headers.value.filter((h) => h.key != 'actions')
})

const isEdit = ref(false)

const cDtProducts = computed(() =>
    supplies.value.map((supply, idx) => {
        return {
            ...supply,
            no: cOffset.value + idx + 1,
            splNm: supply.name,
            actions: supply.seq,
        }
    })
)

function addProduct() {
    router.push({ path: '/supplyEdit' })
}

function onUpdate(seq: number) {
    router.push(`/supplyEdit/${seq}`)
}

async function onRemove(seq: number) {
    if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
        await apiSupply.remove(seq)
        _.remove(supplies.value, (supl) => supl.seq == seq)

        Swal.fireCustom({ toast: true, messageType: 'remove' })
    }
}
</script>

<template>
    <!--
    disable paging: items-per-page="0"
    -->
    <v-data-table class="order-list" :headers="cHeaders" :items="cDtProducts" item-value="seq" :items-per-page="0" :hide-default-footer="true">
        <template #top>
            <div class="tw-flex tw-justify-end">
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
                <v-pagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></v-pagination>
                <div class="right">
                    <h3 style="width: max-content">총: {{ cSuplTotalCnt }} 건</h3>
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
                @apply tw-text-lg;
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
