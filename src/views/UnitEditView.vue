<script setup lang="ts">
import useSwal from '@/composable/useSwal'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import type { VDataTable } from 'vuetify/components'
import { PAGE_SIZE_LIST } from '@/composable/usePagination'

const router = useRouter()
const Swal = useSwal()
const apiUnit = useApiUnit()

const unit = reactive({ name: '' } as UnitEntity)
const units = ref<UnitEntity[]>([])

apiUnit.selectList().then((res) => {
    units.value = res
})

const REQUIRED_KEYS = ['name'] as const
const LBL = {
    name: '단위',
}
const reqRules = REQUIRED_KEYS.reduce((result, key) => {
    result[key] = {
        required: helpers.withMessage(`${LBL[key]}를 입력해주세요.`, required),
    }
    return result
}, {} as any)
const rules = {
    ...reqRules,
} as ValidationArgs<UnitEntity>
const v$ = useVuelidate(rules, unit, { $autoDirty: true })

async function validate() {
    if ((await v$.value.$validate()) == false) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: v$.value.$errors[0].$message.toString() })
        return false
    } else if (units.value.some((u) => u.name == unit.name)) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: '이미 등록된 단위 입니다.' })
        return false
    }

    return true
}
async function onCreate() {
    if ((await validate()) == false) return

    // 검증
    const nUnit = await apiUnit.create(unit)
    units.value.push(nUnit)

    Swal.fireCustom({ toast: true, messageType: 'save' })
}

const cUnitTotalCnt = computed(() => units.value.length)
const pageSize = ref<number>(PAGE_SIZE_LIST[0])
const { pageNo, cOffset, cTotalPage } = usePagination(cUnitTotalCnt, pageSize)
watch(pageNo, () => {
    window.scrollTo(0, 0)
})

const headers = ref([
    { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
    { title: '단위', key: 'unit', align: 'center' },
    { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>

const cDtProducts = computed(() =>
    units.value.map((unit, idx) => {
        return {
            ...unit,
            no: cOffset.value + idx + 1,
            unit: (unit.isUnitCnt ? '+' : '') + unit.name,
            actions: unit.seq,
        }
    })
)

async function onRemove(seq: number) {
    if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
        await apiUnit.remove(seq)
        _.remove(units.value, (u) => u.seq == seq)

        Swal.fireCustom({ toast: true, messageType: 'remove' })
    }
}
</script>
<template>
    <section class="place-ctg-view">
        <section class="wrapper g-form">
            <section class="top">
                <span>단위관리</span>
                <VBtn density="compact" style="min-width: 0; width: 36px; border-radius: 14px" color="warning" @click="() => router.back()">X</VBtn>
            </section>
            <section class="content">
                <div>
                    <div class="row">
                        <span class="label">{{ LBL.name }}</span>
                        <VTextField type="text" v-model="unit.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                    </div>
                    <div class="tw-flex tw-items-center tw-justify-end">
                        <span>단위수량 유무</span>
                        <VCheckbox v-model="unit.isUnitCnt" density="compact" :hide-details="true"></VCheckbox>
                    </div>
                </div>
            </section>
            <section class="btt" style="border-top: 0; border-bottom: 1px solid grey">
                <v-btn @click="onCreate">등록</v-btn>
            </section>
            <v-data-table class="order-list scroll" :headers="headers" :items="cDtProducts" item-value="seq" :items-per-page="0" :hide-default-footer="true">
                <template #item.actions="{ value }">
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <button @click="onRemove(value)" style="color: var(--color-danger)" v-tooltip="'삭제'">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
                <template #bottom>
                    <div class="c-page">
                        <v-pagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></v-pagination>
                        <div class="tw-flex tw-justify-between">
                            <h3 style="width: max-content">총: {{ cUnitTotalCnt }} 건</h3>
                            <div style="width: 100px">
                                <v-select
                                    :items="PAGE_SIZE_LIST"
                                    v-model="pageSize"
                                    item-value="key"
                                    item-title="title"
                                    density="comfortable"
                                    :hide-details="true"
                                ></v-select>
                            </div>
                        </div>
                    </div>
                </template>
            </v-data-table>
        </section>
    </section>
</template>

<style lang="scss">
.place-ctg-view {
    @include center-view;

    .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .plus-btn {
        min-width: 0;
        width: 38px;
    }

    .chips {
        display: flex;
        justify-content: end;
    }

    .order-list {
        max-height: 50vh;
    }
}
</style>
