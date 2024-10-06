<script setup lang="ts">
import useSwal from '@/composable/useSwal'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import type UnitEditPop from '@/components/UnitEditPop.vue'

const Swal = useSwal()
const router = useRouter()
const apiSupply = useApiSupply()
const apiUnit = useApiUnit()

const originSupply = ref<SupplyEntity>()
const supply = ref<SupplyEntityCreation & { unitNms: string[] }>({ name: '', unitNms: [] })
const supplies = ref<SupplyEntity[]>([])
const units = ref<UnitEntity[]>([])

interface Props {
    // routerParam
    seq?: string
}
const props = defineProps<Props>()

if (props.seq) {
    apiSupply.select(+props.seq).then((res) => {
        originSupply.value = _.cloneDeep(res)
        supply.value = { ...res, unitNms: res.units.map((u) => u.name) }
    })
}

apiUnit.selectList().then((res) => {
    units.value = res
})

apiSupply.selectList().then((res) => {
    supplies.value = res
})

const cIsUpdateView = computed(() => (props.seq ? true : false))
const cIsUpdated = computed(() => _.isEqual(supply.value, originSupply.value) == false)
const cText = computed(() => (cIsUpdateView.value ? '수정' : '등록'))
const LABEL_INFO = {
    name: '명칭',
    units: '단위',
}
const rules = {
    name: {
        required: helpers.withMessage(`${LABEL_INFO.name}을 선택해주세요.`, required),
    },
} as ValidationArgs<SupplyEntityCreation>
const v$ = useVuelidate(rules, supply, { $autoDirty: true })

async function validate() {
    if ((await v$.value.$validate()) == false) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: v$.value.$errors[0].$message.toString() })
        return false
    } else if (supply.value.unitNms.length < 1) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: '단위를 선택해주세요' })
        return false
    } else if (cIsUpdateView.value == false && supplies.value.some((supl) => supl.name == supply.value.name)) {
        Swal.fireCustom({ toast: true, icon: 'error', title: '', text: '이미 등록된 식자재입니다.' })
        return false
    }

    return true
}

async function onSave() {
    if ((await validate()) == false) return

    if (cIsUpdateView.value) {
        await apiSupply.update(supply.value, supply.value.unitNms)
        Swal.fireCustom({ toast: true, messageType: 'save' })
    } else {
        await apiSupply.create({ name: supply.value.name }, supply.value.unitNms)
        Swal.fireCustom({ toast: true, messageType: 'save' })
    }

    router.back()
}

function onCancel() {
    router.back()
}

// function addUnit() {
//     if (unit.value) supply.value.units.push(unit.value)
// }

// function addUnitCnt() {
//     if (unitCnt.value) {
//         if (supply.value.unitCntList == null) supply.value.unitCntList = []

//         supply.value.unitCntList.push(unitCnt.value)
//     }
// }

const isOpenedPop = ref(false)
const comp = ref<InstanceType<typeof UnitEditPop>>()

function openPopup() {
    isOpenedPop.value = true
    console.log('onClickPrepend')
}
</script>
<template>
    <section class="place-ctg-view">
        <section class="wrapper g-form">
            <section class="top">{{ `식자재 ${cText}` }}</section>
            <section class="content">
                <div class="row">
                    <span class="label">{{ LABEL_INFO.name }}</span>
                    <VTextField type="text" v-model="supply.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                </div>
                <div>
                    <div class="row">
                        <span class="label">{{ LABEL_INFO.units }}</span>
                        <div class="tw-flex tw-w-full tw-items-center tw-justify-center">
                            <VSelect ref="comp" v-model="supply.unitNms" :items="units" item-title="name" chips multiple density="compact" :hide-details="true">
                            </VSelect>
                            <VBtn @click="openPopup" color="primary">
                                <font-awesome-icon :icon="['fas', 'pencil']" />
                            </VBtn>
                        </div>
                    </div>
                </div>
            </section>
            <section class="btt">
                <v-btn @click="onSave" :disabled="cIsUpdated == false">{{ cText }}</v-btn>
                <v-btn @click="onCancel" color="warning">취소</v-btn>
            </section>
        </section>
        <UnitEditPop
            v-if="isOpenedPop"
            @close="() => (isOpenedPop = false)"
            style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); height: fit-content"
        >
        </UnitEditPop>
    </section>
</template>

<style lang="scss" scoped>
.place-ctg-view {
    @include center-view;

    .plus-btn {
        min-width: 0;
        width: 38px;
    }

    .chips {
        display: flex;
        justify-content: end;
    }
}
</style>
