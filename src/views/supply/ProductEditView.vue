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
const apiProduct = useApiProduct()

const supplies = ref<SupplyEntity[]>([])
const originProduct = ref<ProductEntity>()
type NProduct = ProductEntityCreation & { supplyNm: string }
const nProduct = ref({} as NProduct)

interface Props {
    // routerParam
    seq?: string
}
const props = defineProps<Props>()

apiSupply.selectList().then((res) => {
    supplies.value = res
})

if (props.seq) {
    apiProduct.select(+props.seq).then((res) => {
        originProduct.value = _.cloneDeep(res)
        nProduct.value = { ...res, supplyNm: supplies.value.find((spl) => spl.seq == res.splSeq)!.name }
    })
}

const cIsUpdateView = computed(() => (props.seq ? true : false))
const cIsUpdated = computed(() => _.isEqual(nProduct.value, originProduct.value) == false)
const cText = computed(() => (cIsUpdateView.value ? '수정' : '등록'))
const REQUIRED_KEYS = ['supplyNm', 'name', 'unit'] as ['supplyNm', 'name', 'unit']
const LABEL_INFO = {
    supplyNm: '식자재',
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
} as ValidationArgs<NProduct>
const v$ = useVuelidate(rules, nProduct, { $autoDirty: true })

const inp = ref() as Ref<HTMLInputElement>
function validate(val: NProduct, valid: boolean): val is NProduct {
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
</script>
<template>
    <section class="place-ctg-view">
        <section class="wrapper g-form">
            <section class="top">{{ `식자재 ${cText}` }}</section>
            <section class="content">
                <div class="row">
                    <span class="label">{{ LABEL_INFO.supplyNm }}</span>
                    <VSelect :items="supplies" item-value="name" item-title="name" v-model="nProduct.supplyNm" density="compact" :hide-details="true">
                        <template #prepend-item>
                            <VBtn color="primary" width="100%"><font-awesome-icon :icon="['fas', 'plus']" /></VBtn>
                        </template>
                    </VSelect>
                </div>
                <div class="row">
                    <span class="label">{{ LABEL_INFO.name }}</span>
                    <div class="tw-flex tw-w-full tw-items-center">
                        <VTextField type="text" v-model="nProduct.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                        <VCheckbox :hide-details="true" :ripple="false"></VCheckbox>
                    </div>
                </div>
                <div class="row">
                    <span class="label">{{ LABEL_INFO.unit }}</span>
                    <VTextField type="text" v-model="nProduct.unit" density="compact" :hide-details="true"></VTextField>
                </div>
                <div class="row">
                    <span class="label">{{ LABEL_INFO.unitCnt }}</span>
                    <div class="tw-flex tw-w-full tw-items-center">
                        <VTextField type="number" v-model="nProduct.unitCnt" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                        <VCheckbox :hide-details="true" density="compact" :ripple="false"></VCheckbox>
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
}
</style>
