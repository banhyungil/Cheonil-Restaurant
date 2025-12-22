<script setup lang="ts">
import type { ProductExt } from '@/api/useApiProduct'
import type { BTableColInfo } from '@/base-components/BTable.vue'
import { SwalExt } from '@/utils/swalExt'
import _ from 'lodash'
import { helpers, required, minValue } from '@vuelidate/validators'
import { useVuelidate } from '@vuelidate/core'
import type { ErrorObject, ValidationArgs } from '@vuelidate/core'
import { faLampStreet } from '@fortawesome/pro-solid-svg-icons'

// 매장
// 제품
// 카테고리리
//ANCHOR - Props
interface Props {
    expenses: ExpenseEntity[]
    uExpense?: ExpenseEntity
    expenseCategories: ExpenseCategoryEntity[]
    stores: StoreEntity[]
    onCreate: (expense: ExpenseEntityCreation, expenseProducts: ExpenseProductEntityCreation[]) => Promise<void>
    onUpdate: (expense: ExpenseEntity, expenseProducts: ExpenseProductEntityCreation[]) => Promise<void>
    onCreateExpenseCategory: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onUpdateExpenseCategory: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onRemoveExpenseCategory: (seq: number) => Promise<void>
}
const props = defineProps<Props>()

//ANCHOR - Hooks
onBeforeMount(() => {
    apiProduct.selectList().then((res) => {
        products.value = res
    })
})
onMounted(() => {
    if (expenseProducts.value.length === 0) {
        addProduct()
    }
})

//ANCHOR - Composables, Store
const apiProduct = useApiProduct()
const router = useRouter()

//ANCHOR - Start
const cIsUpdate = computed(() => !!props.uExpense)
const products = ref<ProductExt[]>([])
const dProduct = computed(() => _.keyBy(products.value, 'seq'))
const expense = ref({} as ExpenseEntity)
const isShowModal = ref(false)

// 지출항목 리스트
const expenseProducts = ref<ExpenseProductEntity[]>([])

watch(
    () => props.uExpense,
    () => {
        if (props.uExpense) expense.value = props.uExpense
    }
)

const expenseAt = ref<Date>()

// 선택된 단위의 unitCntList
function getUnitCntListForProduct(item: ExpenseProductEntity) {
    const product = products.value.find((p) => p.seq === item.prdSeq)
    return product?.unitCntList ?? []
}

// 새 항목 추가
function addProduct() {
    expenseProducts.value.push({
        cnt: 1,
        price: 0,
    } as ExpenseProductEntity)
}

function onUpdateStore(storeSeq: number) {
    expense.value.name = props.stores.find((s) => s.seq === storeSeq)?.name || ''
}

// 항목 삭제
function removeProduct(index: number) {
    expenseProducts.value.splice(index, 1)
}

// Vuelidate 검증 규칙 - expense 기본 정보
const expenseRules = {
    storeSeq: {
        required: helpers.withMessage('매장을 선택해주세요.', required),
    },
    name: {
        required: helpers.withMessage('지출명을 입력해주세요.', required),
    },
    ctgSeq: {
        required: helpers.withMessage('카테고리를 선택해주세요.', required),
    },
    expenseAt: {
        required: helpers.withMessage('지출일자를 선택해주세요.', required),
    },
} as ValidationArgs<Partial<ExpenseEntity>>

const v$Expense = useVuelidate(expenseRules, expense, { $autoDirty: true })

// Vuelidate 검증 규칙 - expenseProducts
const rules = computed(() => {
    const productRules: Record<number, ValidationArgs<Partial<ExpenseProductEntity>>> = {}
    expenseProducts.value.forEach((_, index) => {
        productRules[index] = {
            prdSeq: {
                required: helpers.withMessage('제품을 선택해주세요.', required),
            },
            unitCnt: {
                required: helpers.withMessage('단위를 선택해주세요.', required),
            },
            cnt: {
                required: helpers.withMessage('수량을 입력해주세요.', required),
                minValue: helpers.withMessage('수량은 0보다 커야 합니다.', minValue(0.01)),
            },
            price: {
                required: helpers.withMessage('가격을 입력해주세요.', required),
                minValue: helpers.withMessage('가격은 0보다 커야 합니다.', minValue(0.01)),
            },
        }
    })
    return productRules
})

const v$ = useVuelidate(rules, expenseProducts, { $autoDirty: true })

// 제품 선택 시 첫 번째 단위 자동 선택
function onProductSelect(item: ExpenseProductEntity) {
    item.unitCnt = undefined
    const product = products.value.find((p) => p.seq === item.prdSeq)

    if (product && product.unitCntList.length > 0) {
        item.unitCnt = product.unitCntList[0]
    }
}

function getAvailableProducts(currentItem: ExpenseProductEntity) {
    const expPrdSeqs = expenseProducts.value.map((ep) => ep.prdSeq)
    return products.value.filter((p) => !expPrdSeqs.includes(p.seq) || currentItem.prdSeq == p.seq)
}

// BTable colInfos 설정
const colInfos = ref([
    { key: 'prdSeq', title: '제품', editable: false },
    { key: 'unitCnt', title: '단위', editable: false },
    { key: 'cnt', title: '수량', colSize: '100px', editable: true, inputType: 'number' },
    { key: 'price', title: '가격', colSize: '140px', editable: true, inputType: 'number' },
    { key: 'amount', title: '금액', colSize: '140px', editable: true, inputType: 'number' },
    { key: 'cmt', title: '비고', editable: true, inputType: 'text' },
    { key: 'actions', title: '삭제', colSize: '80px', editable: false },
] as BTableColInfo<ExpenseProductEntity>[])

// BTable용 데이터 - no와 subtotal 추가
const cTableItems = computed(() => {
    return expenseProducts.value.map((item, idx) => ({
        ...item,
        no: idx + 1,
        amount: (item.price || 0) * (item.cnt || 0),
    }))
})

async function validate() {
    const message = await (async () => {
        if ((await v$.value.$validate()) == false) {
            const firstError = v$.value.$errors[0]

            return firstError.$message.toString()
        } else if ((await v$Expense.value.$validate()) == false) {
            const firstError = v$Expense.value.$errors[0]

            return firstError.$message.toString()
        } else if (expenseProducts.value.length === 0) {
            return '지출 항목을 하나 이상 추가해주세요.'
        } else {
            return null
        }
    })()
    if (message) {
        SwalExt.fireCustom({ toast: true, messageType: 'error', title: '', text: message })
        return false
    }

    return true
}

async function onSave() {
    // 검증
    if ((await validate()) == false) return

    // 저장여부 확인
    if ((await SwalExt.fireCustom({ isConfirm: true, messageType: cIsUpdate.value ? 'update' : 'save' })) == false) return

    // expense.amount에 총 금액 설정
    expense.value.amount = _.sumBy(expenseProducts.value, (ep) => (ep.price || 0) * (ep.cnt || 0))
    expense.value.expenseAt = expenseAt.value || new Date()

    if (cIsUpdate.value) {
        await props.onUpdate(expense.value, expenseProducts.value)
        SwalExt.fireCustom({ toast: true, messageType: 'update', title: '' })
    } else {
        await props.onCreate(expense.value, expenseProducts.value)
        SwalExt.fireCustom({ toast: true, messageType: 'save', title: '' })
    }

    router.back()
}
</script>
<template>
    <section class="expense-edit px-4">
        <section class="top py-3">
            <h2 class="text-xl font-bold">지출내역 {{ cIsUpdate ? '수정' : '등록' }}</h2>
        </section>
        <div class="border-b-2"></div>
        <section class="form flex flex-col gap-2">
            <div class="row">
                <label>매장</label>
                <VAutocomplete
                    :items="stores"
                    item-title="name"
                    item-value="seq"
                    v-model="expense.storeSeq"
                    @update:model-value="onUpdateStore"
                    density="compact"
                    :hide-details="false"
                    :error-messages="v$Expense.storeSeq?.$errors.map((e: ErrorObject) => e.$message as string)"
                >
                </VAutocomplete>
            </div>
            <div class="row">
                <label>지출명</label>
                <VTextField
                    v-model="expense.name"
                    density="compact"
                    :hide-details="false"
                    :error-messages="v$Expense.name?.$errors.map((e: ErrorObject) => e.$message as string)"
                />
            </div>
            <div class="row">
                <label>지출일자</label>
                <VueDatePicker
                    v-model="expense.expenseAt"
                    :format="'yy.MM.dd HH:mm'"
                    :time-picker="false"
                    text-input
                    teleport
                    :max-date="new Date()"
                    auto-apply
                    locale="ko-KR"
                >
                </VueDatePicker>
            </div>
            <div class="row">
                <label>카테고리</label>
                <VSelect
                    :items="expenseCategories"
                    item-title="path"
                    item-value="seq"
                    v-model="expense.ctgSeq"
                    density="compact"
                    :hide-details="false"
                    :error-messages="v$Expense.ctgSeq?.$errors.map((e: ErrorObject) => e.$message as string)"
                    class="h-16"
                >
                    <template v-slot:append-item>
                        <VBtn @click="() => (isShowModal = true)" color="primary" class="w-full"
                            ><span class="mr-2">추가</span><font-awesome-icon :icon="['fas', 'plus']"
                        /></VBtn>
                        <VDivider class="test mt-2 h-4" style="border: 2px solid black"></VDivider>
                    </template>
                </VSelect>
            </div>
            <div class="row">
                <label>금액</label>
                <VTextField :value="_.sumBy(expenseProducts, 'price').toLocaleString()" disabled density="compact" :hide-details="true"> </VTextField>
            </div>

            <!-- 제품 항목 테이블 -->
            <div class="products-section">
                <div class="mb-2 flex items-center justify-between">
                    <label class="font-bold">제품 항목</label>
                    <BButton @click="addProduct" variant="primary" size="sm">
                        <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" />
                        항목 추가
                    </BButton>
                </div>

                <BTable
                    v-if="expenseProducts.length > 0"
                    :items="cTableItems"
                    :col-infos="colInfos"
                    item-key="no"
                    theme="border"
                    class="expense-products-table"
                >
                    <template #prdSeq="{ rowIdx }">
                        <VAutocomplete
                            v-model="expenseProducts[rowIdx].prdSeq"
                            :items="getAvailableProducts(expenseProducts[rowIdx])"
                            :item-title="(prd) => `${dProduct[prd.seq]?.prdInfo.name} (${dProduct[prd.seq]?.unit.name})`"
                            item-value="seq"
                            placeholder="제품 선택"
                            density="compact"
                            class="h-10"
                            :hide-details="false"
                            :error-messages="v$[rowIdx]?.prdSeq?.$errors.map((e: ErrorObject) => e.$message as string)"
                            @update:model-value="onProductSelect(expenseProducts[rowIdx])"
                        ></VAutocomplete>
                    </template>

                    <template #unitCnt="{ rowIdx }">
                        <div class="flex gap-1">
                            <VCombobox
                                v-model="expenseProducts[rowIdx].unitCnt"
                                :items="getUnitCntListForProduct(expenseProducts[rowIdx])"
                                placeholder="단위수량"
                                density="compact"
                                :hide-details="false"
                                :error-messages="v$[rowIdx]?.unitCnt?.$errors.map((e: ErrorObject) => e.$message as string)"
                                :disabled="!expenseProducts[rowIdx].prdSeq"
                                :min="1"
                                class="h-10 w-max min-w-24"
                                type="number"
                            ></VCombobox>
                            <BInput type="text" :value="products.find((prd) => prd.seq === expenseProducts[rowIdx].prdSeq)?.unit.name" disabled class="w-20" />
                        </div>
                    </template>

                    <template #cnt="{ rowIdx }">
                        <BInput v-model="expenseProducts[rowIdx].cnt" type="number" :active-cancel="false"></BInput>
                    </template>

                    <template #price="{ rowIdx }">
                        <BInputNumber v-model="expenseProducts[rowIdx].price" number-format :min="100" :active-cancel="false"></BInputNumber>
                    </template>
                    <template #amount="{ item }">
                        <BInputNumber :value="item.amount" disabled number-format :active-cancel="false"></BInputNumber>
                    </template>

                    <template #cmt="{ rowIdx }">
                        <BInput v-model="expenseProducts[rowIdx].cmt"></BInput>
                    </template>

                    <template #actions="{ rowIdx }">
                        <button @click="removeProduct(rowIdx)" class="text-danger hover:text-red-700">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </template>
                </BTable>

                <div v-else class="empty-state">
                    <p class="text-gray-400">항목을 추가해주세요</p>
                </div>
            </div>
        </section>
        <section class="footer flex justify-end gap-2">
            <BButton @click="onSave" variant="primary">{{ cIsUpdate ? '수정' : '저장' }}</BButton>
            <BButton @click="() => $emit('cancel')" variant="danger">취소</BButton>
        </section>
        <ExpenseCategoryModal
            v-if="isShowModal"
            v-model="isShowModal"
            :expenseCategories="expenseCategories"
            :onCreate="onCreateExpenseCategory"
            :onUpdate="onUpdateExpenseCategory"
            :onRemove="onRemoveExpenseCategory"
            :onCancel="() => (isShowModal = !isShowModal)"
        >
        </ExpenseCategoryModal>
    </section>
</template>

<style lang="scss" scoped>
.expense-edit {
    .form {
        .row {
            @apply font-bold;
        }
    }

    .products-section {
        margin-top: 1rem;

        .empty-state {
            padding: 3rem;
            text-align: center;
            border: 1px dashed #ddd;
            border-radius: 4px;
            background-color: #fafafa;
        }

        .total-section {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #f5f5f5;
            border-radius: 4px;
            border: 2px solid #999;

            .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .label {
                    font-size: 18px;
                    font-weight: 600;
                }

                .amount {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2563eb;
                }
            }
        }

        :deep(.expense-products-table) {
            .b-table-cell {
                padding: 4px 8px;
            }
        }
    }
}
</style>
