<script setup lang="ts">
import useSwal from '@/composables/useSwal'
import { ref, type Ref } from 'vue'
import _ from 'lodash'
import { helpers, required } from '@vuelidate/validators'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import type { VDataTable } from 'vuetify/components'
import { PAGE_SIZE_LIST } from '@/composables/usePagination'
import BModal from '@/base-components/BModal.vue'

//ANCHOR - Props
interface Props {
    expenseCategories: ExpenseCategoryEntity[]
    onCancel: () => void
    onCreate: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onUpdate: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onRemove: (seq: number) => Promise<void>
}
const props = defineProps<Props>()
const isOpen = defineModel({
    default: true,
})

//ANCHOR - Start
const Swal = useSwal()

const expsCtg = reactive({ path: '' } as ExpenseCategoryEntity)

const REQUIRED_KEYS = ['path'] as const
const LBL = {
    pSeq: '부모 카테고리',
    path: '카테고리',
}
const reqRules = REQUIRED_KEYS.reduce((result, key) => {
    result[key] = {
        required: helpers.withMessage(`${LBL[key]}를 입력해주세요.`, required),
    }
    return result
}, {} as any)
const rules = {
    ...reqRules,
} as ValidationArgs<ExpenseCategoryEntity>
const v$ = useVuelidate(rules, expsCtg, { $autoDirty: true })

async function validate() {
    if ((await v$.value.$validate()) == false) {
        Swal.fireCustom({ toast: true, messageType: 'error', title: '', text: v$.value.$errors[0].$message.toString() })
        return false
    } else if (props.expenseCategories.some((u) => u.path == expsCtg.path)) {
        Swal.fireCustom({ toast: true, messageType: 'error', title: '', text: '이미 등록된 카테고리 입니다.' })
        return false
    } else if (expsCtg.path.includes('/')) {
        Swal.fireCustom({ toast: true, messageType: 'error', title: '', text: '이름에 / 문자를 포함할 수 없습니다.' })
        return false
    }

    return true
}
async function onClickCreate() {
    if ((await validate()) == false) return

    await props.onCreate(expsCtg)
    Swal.fireCustom({ toast: true, messageType: 'save', title: '' })
}

const cUnitTotalCnt = computed(() => props.expenseCategories.length)
const pageSize = ref<number>(PAGE_SIZE_LIST[0])
const { pageNo, cOffset, cTotalPage } = usePagination(cUnitTotalCnt, pageSize)
watch(pageNo, () => {
    window.scrollTo(0, 0)
})

const headers = ref([
    { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
    { title: '카테고리', key: 'unit', align: 'center' },
    { title: 'Actions', key: 'actions', align: 'center', sortable: false },
]) as Ref<NonNullable<Mutable<VDataTable['$props']['headers']>>>

const cDtExpsCtgs = computed(() =>
    props.expenseCategories.map((expsCtg, idx) => {
        return {
            ...expsCtg,
            no: cOffset.value + idx + 1,
            path: expsCtg.path,
            actions: expsCtg.seq,
        }
    })
)

async function onClickRemove(seq: number) {
    props.onRemove(seq)
}
</script>
<template>
    <BModal class="expense-ctg-modal bg-red" title="카테고리 관리" v-model="isOpen">
        <template #content>
            <section class="form flex flex-col gap-2">
                <div class="row">
                    <span class="label">{{ LBL.pSeq }}</span>
                    <VSelect
                        v-model="expsCtg.pSeq"
                        :items="expenseCategories"
                        item-title="name"
                        item-value="seq"
                        placeholder="미선택시 최상위 카테고리"
                        clearable
                        density="compact"
                    >
                    </VSelect>
                </div>
                <div class="row">
                    <span class="label">{{ LBL.path }}</span>
                    <VTextField type="text" v-model="expsCtg.path" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                </div>
                <BButton @click="onClickCreate" variant="primary">등록</BButton>
            </section>
        </template>
        <v-data-table
            a-table
            class="order-list scroll"
            :headers="headers"
            :items="cDtExpsCtgs"
            item-value="seq"
            :items-per-page="0"
            :hide-default-footer="true"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <div style="display: flex; justify-content: center; gap: 10px">
                    <button @click="onClickRemove(item.seq)" style="color: rgb(var(--color-success))" v-tooltip="'수정'">
                        <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                    </button>
                    <button @click="onClickRemove(item.seq)" style="color: rgb(var(--color-danger))" v-tooltip="'삭제'">
                        <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                </div>
            </template>
            <template #bottom>
                <div class="c-page">
                    <v-pagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></v-pagination>
                    <div class="flex justify-between">
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
    </BModal>
    <!-- <section class="expense-ctg-modal">
        <section class="wrapper g-form">
            <section class="top">
                <span>단위관리</span>
                <VBtn density="compact" style="min-width: 0; width: 36px; border-radius: 14px" color="warning" @click="$emit('cancel')">X</VBtn>
            </section>
            <section class="content">
                <div>
                    <div class="row">
                        <span class="label">{{ LBL.name }}</span>
                        <VTextField type="text" v-model="expsCtg.name" density="compact" :hide-details="true" style="height: 45px"></VTextField>
                    </div>
                </div>
            </section>
            <section class="btt" style="border-top: 0; border-bottom: 1px solid grey">
                <v-btn @click="onClickCreate">등록</v-btn>
            </section>
            <v-data-table class="order-list scroll" :headers="headers" :items="cDtExpsCtgs" item-value="seq" :items-per-page="0" :hide-default-footer="true">
                <template #item.actions="{ value }">
                    <div style="display: flex; justify-content: center; gap: 10px">
                        <button @click="onClickRemove(value)" style="color: rgb(var(--color-success))" v-tooltip="'수정'">
                            <font-awesome-icon :icon="['fas', 'pen-to-square']" />
                        </button>
                        <button @click="onClickRemove(value)" style="color: rgb(var(--color-danger))" v-tooltip="'삭제'">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </template>
                <template #bottom>
                    <div class="c-page">
                        <v-pagination v-show="cTotalPage > 0" lass="page" v-model="pageNo" :length="cTotalPage" :total-visible="5"></v-pagination>
                        <div class="flex justify-between">
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
    </section> -->
</template>

<style lang="scss">
.expense-ctg-modal {
}
</style>
