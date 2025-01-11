<script setup lang="ts">
import useSwal from '@/composable/useSwal'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'

const Swal = useSwal()
const router = useRouter()
const apiSupply = useApiSupply()
const apiProduct = useApiProduct()
const apiMapProductUnit = useApiMapProductUnit()
const apiUnit = useApiUnit()

const supplies = ref<SupplyEntity[]>([])
const units = ref<UnitEntity[]>([])
const originProduct = ref<ProductEntity>()
const product = ref({} as ProductEntityCreation)
const prdUnit = ref({} as UnitEntity)
const prdUnits = ref([] as UnitEntity[])
const unitCnt = ref(0)
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
    })
}

const cIsUpdateView = computed(() => (props.seq ? true : false))
const cIsUpdated = computed(() => _.isEqual(product.value, originProduct.value) == false && _.isEqual(prdUnits.value, originProduct.value) == false)
const cText = computed(() => (cIsUpdateView.value ? '수정' : '등록'))
const REQUIRED_KEYS = ['suplSeq', 'name', 'unit'] as const
const LABEL_INFO = {
    suplSeq: '식자재',
    name: '제품명',
    unit: '단위',
    unitCnt: '단위수량',
}
const reqRules = REQUIRED_KEYS.reduce((result, key) => {
    result[key] = {
        required: helpers.withMessage(`${LABEL_INFO[key]}를 선택해주세요.`, required),
    }
    return result
}, {} as any)
const rules = {
    ...reqRules,
} as ValidationArgs<ProductEntityCreation>
const cVTarget = computed(() => ({ ...product.value, unit: prdUnits.value }))
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
    // 기존 유닛이 있으면 수량목록만 갱신
    // 기존 유닛이 없으면 push
    const tgtUnit = prdUnits.value.find((pu) => pu.name == prdUnit.value.name)
    if (tgtUnit == null) prdUnits.value.push(prdUnit.value)
}

function openUnitPop() {
    router.push('/unitEdit')
}
</script>
<template>
    <section class="place-ctg-view">
        <section class="wrapper g-form">
            <section class="top">{{ `제품 ${cText}` }}</section>
            <section class="content">
                <div class="row">
                    <span class="label">{{ LABEL_INFO.suplSeq }}</span>
                    <VSelect :items="supplies" item-title="name" item-value="seq" v-model="product.suplSeq" density="compact" :hide-details="true"> </VSelect>
                </div>
                <div class="row">
                    <span class="label">{{ LABEL_INFO.name }}</span>
                    <div class="tw-flex tw-w-full tw-items-center">
                        <VTextField type="text" v-model="product.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                    </div>
                </div>
                <div class="c-unit">
                    <div class="row">
                        <span class="label">{{ LABEL_INFO.unit }}</span>
                        <VSelect
                            :disabled="cSelSupl == null"
                            :items="units.map((unit) => unit.name)"
                            item-title="name"
                            item-value="name"
                            @update:model-value="(name) => (prdUnit = units.find((u) => u.name == name)!)"
                            :model-value="prdUnit.name"
                            density="compact"
                            :hide-details="true"
                        >
                            <template v-slot:prepend-item>
                                <VBtn @click="openUnitPop" color="primary" class="tw-w-full"><font-awesome-icon :icon="['fas', 'plus']" /></VBtn>
                                <VDivider class="test tw-mt-2 tw-h-4" style="border: 2px solid black"></VDivider>
                            </template>
                        </VSelect>
                    </div>
                    <div>
                        <div class="row" v-if="prdUnit.isUnitCnt">
                            <span class="label">{{ LABEL_INFO.unitCnt }}</span>
                            <div class="tw-flex tw-w-full tw-items-center">
                                <VTextField type="number" v-model="unitCnt" density="compact" :min="0" :hide-details="true" style="height: 45px"> </VTextField>
                            </div>
                        </div>
                        <div class="justify-end tw-flex">
                            <VBtn @click="addUnit" :disabled="false" color="primary"><font-awesome-icon :icon="['fas', 'plus']" /></VBtn>
                        </div>
                    </div>
                </div>
                <div class="row"></div>
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
