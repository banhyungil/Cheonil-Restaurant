<script setup lang="ts">
import useApiPlaceCtg from '@/api/useApiPlaceCtg'
import useSwal from '@/composable/useSwal'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'

const Swal = useSwal()
const router = useRouter()
const apiSupply = useApiSupply()

const originSupply = ref<SupplyEntity>()
const supply = ref({ name: '', unitList: [] } as SupplyEntityCreation)

interface Props {
    // routerParam
    seq?: string
}
const props = defineProps<Props>()

if (props.seq) {
    apiSupply.select(+props.seq).then((res) => {
        originSupply.value = _.cloneDeep(res)
        supply.value = res
    })
}
const unit = ref<string>()
const unitCnt = ref<number | null>()

const cIsUpdateView = computed(() => (props.seq ? true : false))
const cIsUpdated = computed(() => _.isEqual(supply.value, originSupply.value) == false)
const cText = computed(() => (cIsUpdateView.value ? '수정' : '등록'))
const REQUIRED_KEYS = ['name', 'unitList', 'unitCntList'] as ['name', 'unitList', 'unitCntList']
const LABEL_INFO = {
    name: '명칭',
    unitList: '단위목록',
    unitCntList: '단위수량목록',
}
const reqRules = REQUIRED_KEYS.reduce((result, key) => {
    result[key] = {
        required: helpers.withMessage(`${LABEL_INFO[key]}를 선택해주세요.`, required),
    }
    return result
}, {} as any)
const rules = {
    ...reqRules,
} as ValidationArgs<SupplyEntityCreation>
const v$ = useVuelidate(rules, supply, { $autoDirty: true })

const inp = ref() as Ref<HTMLInputElement>
function validate(val: SupplyEntity, valid: boolean): val is SupplyEntity {
    return valid
}
async function onSave() {
    if ((await v$.value.$validate()) == false) {
        Swal.fireCustom({ toast: true, icon: 'error', text: v$.value.$errors[0].$message.toString() })
        return
    }

    // 검증
    if (cIsUpdateView.value) {
        // await apiProduct.update(ctg.value as PlaceCategoryEntity)
        // Swal.fireCustom({ toast: true, messageType: 'update' })
    } else {
        // await apiPlaceCtg.create(ctg.value)
        // Swal.fireCustom({ toast: true, messageType: 'save' })
    }

    // list.value = await apiPlaceCtg.selectList()
    router.back()
}

async function onRemove() {
    // if (ctg.value.seq && (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' }))) {
    //     await apiPlaceCtg.remove(ctg.value.seq)
    //     // 카테고리 중 해당 구역 설정되어 있는 경우 수정
    //     // 매장 중 해당 구역 설정되어 있는 경우 수정
    //     storeStore.categories.forEach((storeCtg) => {
    //         if (storeCtg.placeCtgSeq == ctg.value.seq) {
    //             storeCtg.placeCtgSeq = null
    //         }
    //     })
    //     storeStore.items.forEach((store) => {
    //         if (store.placeCtgSeq == ctg.value.seq) {
    //             store.placeCtgSeq = null
    //         }
    //     })
    //     _.remove(list.value, (item) => item.seq == ctg.value.seq)
    //     Swal.fireCustom({ toast: true, messageType: 'remove' })
    //     router.back()
    // }
}
function onCancel() {
    router.back()
}

function addUnit() {
    if (unit.value) supply.value.unitList.push(unit.value)
}

function addUnitCnt() {
    if (unitCnt.value) {
        if (supply.value.unitCntList == null) supply.value.unitCntList = []

        supply.value.unitCntList.push(unitCnt.value)
    }
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
                        <span class="label">{{ LABEL_INFO.unitList }}</span>
                        <div class="tw-flex tw-w-full tw-items-center">
                            <VTextField type="text" v-model="unit" density="compact" class="compact" :hide-details="true"></VTextField>
                            <VBtn @click="addUnit" :disabled="_.isEmpty(unit) || supply.unitList?.includes(unit!)" color="primary" class="plus-btn"
                                ><font-awesome-icon :icon="['fas', 'plus']"
                            /></VBtn>
                            <VCheckbox :hide-details="true" :ripple="false"></VCheckbox>
                        </div>
                    </div>
                    <div class="chips">
                        <v-chip v-for="unit in supply.unitList" :key="unit" class="ma-2" closable @click:close="_.remove(supply.unitList, (u) => u == unit)">
                            {{ unit }}
                        </v-chip>
                    </div>
                </div>

                <div>
                    <div class="row">
                        <span class="label">{{ LABEL_INFO.unitCntList }}</span>
                        <div class="tw-flex tw-w-full tw-items-center">
                            <VTextField type="number" v-model="unitCnt" density="compact" class="compact" :hide-details="true"></VTextField>
                            <VBtn @click="addUnitCnt" :disabled="unitCnt == null || supply.unitCntList?.includes(unitCnt)" color="primary" class="plus-btn"
                                ><font-awesome-icon :icon="['fas', 'plus']"
                            /></VBtn>
                            <VCheckbox :hide-details="true" density="compact" :ripple="false"></VCheckbox>
                        </div>
                    </div>
                    <div class="chips">
                        <v-chip
                            v-for="unitCnt in supply.unitCntList"
                            :key="unitCnt"
                            class="ma-2"
                            closable
                            @click:close="_.remove(supply.unitCntList!, (u) => u == unitCnt)"
                        >
                            {{ unitCnt }}
                        </v-chip>
                    </div>
                </div>
            </section>
            <section class="btt">
                <v-btn @click="onSave" :disabled="cIsUpdated == false">{{ cText }}</v-btn>
                <v-btn v-if="cIsUpdateView" @click="onRemove">삭제</v-btn>
                <v-btn @click="onCancel">취소</v-btn>
            </section>
        </section>
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
