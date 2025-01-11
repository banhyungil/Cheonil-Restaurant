<script setup lang="ts">
import useSwal from '@/composable/useSwal'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import { VNumberInput } from 'vuetify/labs/components'
import { VChip } from 'vuetify/components'

const Swal = useSwal()
const router = useRouter()
const apiSupply = useApiSupply()
const apiProduct = useApiProduct()
const apiUnit = useApiUnit()

const supplies = ref<SupplyEntity[]>([])
const units = ref<UnitEntity[]>([])
const originProduct = ref<ProductEntity>()
const product = ref({} as ProductEntityCreation)

const selUnit = ref<UnitEntity>()
const unitCnt = ref(1)

const mapPrdUnits = ref<MapProductUnitCreationEntity[]>([])

const cSelSupl = computed(() => supplies.value.find((supl) => supl.seq == product.value.suplSeq))

interface Props {
    // routerParam
    seq?: string
}
const props = defineProps<Props>()

apiSupply.selectList().then((res) => {
    supplies.value = res
})
apiUnit.selectList().then((res) => {
    units.value = res
})

if (props.seq) {
    apiProduct.select(+props.seq).then((res) => {
        originProduct.value = _.cloneDeep(res)
        product.value = res
        mapPrdUnits.value = product.value.mapUnits
    })
}

const cIsUpdateView = computed(() => (props.seq ? true : false))
const cIsUpdated = computed(() => _.isEqual(product.value, originProduct.value) == false && _.isEqual(mapPrdUnits.value, originProduct.value) == false)
const cText = computed(() => (cIsUpdateView.value ? '수정' : '등록'))
const REQUIRED_KEYS = ['suplSeq', 'name', 'unit'] as const
const LBL = {
    suplSeq: '식자재',
    name: '제품명',
    unit: '단위',
    unitCnt: '단위수량',
}
const reqRules = REQUIRED_KEYS.reduce((result, key) => {
    result[key] = {
        required: helpers.withMessage(`${LBL[key]}를 선택해주세요.`, required),
    }
    return result
}, {} as any)
const rules = {
    ...reqRules,
} as ValidationArgs<ProductEntityCreation>
const cVTarget = computed(() => ({ ...product.value, unit: mapPrdUnits.value }))
const v$ = useVuelidate(rules, cVTarget, { $autoDirty: true })

function assertPrd(val: any): asserts val is ProductEntity {
    if (product.value.seq == null) throw new Error('not possible')
}
async function onSave() {
    if ((await v$.value.$validate()) == false) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: v$.value.$errors[0].$message.toString() })
        return
    }

    // 검증
    if (cIsUpdateView.value) {
        assertPrd(product.value)
        await apiProduct.update(product.value)
        Swal.fireCustom({ toast: true, messageType: 'update' })
    } else {
        await apiProduct.create(product.value)
        Swal.fireCustom({ toast: true, messageType: 'save' })
    }

    router.back()
}

function onCancel() {
    router.back()
}

function addUnit() {
    if (selUnit.value == null) return
    // 단위수량이 있다면 단위수량까지 등로고디어있어야함
    const tgtMpu = mapPrdUnits.value.find((mpu) => mpu.unitSeq == selUnit.value!.seq)
    const { isUnitCnt } = selUnit.value
    if ((isUnitCnt && tgtMpu?.unitCntList?.some((cnt) => cnt == unitCnt.value)) || (isUnitCnt == false && tgtMpu)) {
        Swal.fireCustom({ toast: true, title: '', text: '이미 등록된 단위입니다.' })
        return
    }

    let mpu: MapProductUnitCreationEntity
    if (tgtMpu == null) {
        mpu = { unitSeq: selUnit.value.seq } as MapProductUnitEntity
        if (isUnitCnt) mpu.unitCntList = []
        mapPrdUnits.value.push(mpu)
    } else {
        mpu = tgtMpu
    }

    if (isUnitCnt && unitCnt.value) {
        mpu.unitCntList!.push(unitCnt.value)
    }
}

function openUnitPop() {
    router.push('/unitEdit')
}

type UnitInfo = { name: string; unitCnt: number; unit: UnitEntity }
function getUnitInfos(mpu: MapProductUnitCreationEntity) {
    const unit = units.value.find((unit) => unit.seq == mpu.unitSeq)!
    if (unit.isUnitCnt) return mpu.unitCntList?.map((unitCnt) => ({ name: `${unitCnt}${unit.name}`, unitNm: unit.name, unitCnt, unit }) as UnitInfo)
    else return [{ name: unit.name, unit }]
}

function assertCntList(val: any): asserts val is number[] {
    if (Array.isArray(val) == false) throw new Error('not possible')
}
function onRemoveUnit(unitInfo: UnitInfo, mpu: MapProductUnitCreationEntity) {
    // 단위 수량이 없는 경우
    if (unitInfo.name == unitInfo.unit.name) {
        _.remove(mapPrdUnits.value, mpu)
    } else {
        assertCntList(mpu.unitCntList)
        _.remove(mpu.unitCntList, (cnt) => cnt == unitInfo.unitCnt)
        if (mpu.unitCntList.length == 0) _.remove(mapPrdUnits.value, mpu)
    }
}
</script>
<template>
    <section class="place-ctg-view">
        <section class="wrapper g-form">
            <section class="top">{{ `제품 ${cText}` }}</section>
            {{ mapPrdUnits }}
            <section class="content">
                <div class="row">
                    <span class="label">{{ LBL.suplSeq }}</span>
                    <VSelect :items="supplies" item-title="name" item-value="seq" v-model="product.suplSeq" density="compact" :hide-details="true"> </VSelect>
                </div>
                <div class="row">
                    <span class="label">{{ LBL.name }}</span>
                    <div class="tw-flex tw-w-full tw-items-center">
                        <VTextField type="text" v-model="product.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                    </div>
                </div>
                <div class="c-unit">
                    <div class="row">
                        <span class="label">{{ LBL.unit }}</span>
                        <VSelect
                            :disabled="cSelSupl == null"
                            :items="units"
                            item-title="name"
                            item-value="seq"
                            v-model="selUnit"
                            return-object
                            density="compact"
                            :hide-details="true"
                        >
                            <template v-slot:prepend-item>
                                <VBtn @click="openUnitPop" color="primary" class="tw-w-full"><font-awesome-icon :icon="['fas', 'plus']" /></VBtn>
                                <VDivider class="test tw-mt-2 tw-h-4" style="border: 2px solid black"></VDivider>
                            </template>
                        </VSelect>
                        <VNumberInput
                            v-show="selUnit?.isUnitCnt"
                            v-model="unitCnt"
                            controlVariant="stacked"
                            :min="1"
                            density="compact"
                            :hide-details="true"
                            style="height: 45px"
                        ></VNumberInput>
                    </div>
                    <div>
                        <div class="justify-end tw-flex">
                            <VBtn @click="addUnit" :disabled="false" color="primary"><font-awesome-icon :icon="['fas', 'plus']" /></VBtn>
                        </div>
                    </div>
                </div>
                <div class="tw-flex tw-flex-wrap tw-gap-3">
                    <template v-for="mpu in mapPrdUnits" :key="`${mpu.prdSeq}-${mpu.unitSeq}`">
                        <v-chip
                            v-for="info in getUnitInfos(mpu)"
                            :key="info.name"
                            density="compact"
                            closable
                            @click:close="onRemoveUnit(info, mpu)"
                            style="min-width: fit-content; width: fit-content"
                        >
                            {{ info.name }}
                        </v-chip>
                    </template>
                </div>
            </section>
            <section class="btt">
                <v-btn @click="onSave" :disabled="cIsUpdated == false">{{ cText }}</v-btn>
                <v-btn @click="onCancel">취소</v-btn>
            </section>
        </section>
    </section>
</template>

<style lang="scss" scoped>
.place-ctg-view {
    @include center-view;

    .c-unit {
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-top: 1px solid grey;
        border-bottom: 1px solid grey;
        padding: 10px 0;
    }
}
</style>
