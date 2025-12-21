<script setup lang="ts">
import type { ProductExt } from '@/api/useApiProduct'
import { today } from '@/utils/common'

// 매장
// 제품
// 카테고리리
//ANCHOR - Props
interface Props {
    expenses: ExpenseEntity[]
    uExpense?: ExpenseEntity
    expenseCategories: ExpenseCategoryEntity[]
    stores: StoreEntity[]
    onCreateExpenseCategory: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onUpdateExpenseCategory: (expsCtg: ExpenseCategoryEntity) => Promise<void>
    onRemoveExpenseCategory: (seq: number) => Promise<void>
}
const props = defineProps<Props>()
//ANCHOR - Emits
const emit = defineEmits<{
    create: [expense: ExpenseEntity]
    update: [expense: ExpenseEntity]
    createExpenseCategory: [expenseCategory: ExpenseCategoryEntity]
    updateExpenseCategory: [expenseCategory: ExpenseCategoryEntity]
    removeExpenseCategory: [seq: number]
    cancel: []
}>()

//ANCHOR - Hooks
onBeforeMount(() => {
    apiProduct.selectList().then((res) => {
        products.value = res
    })
})

//ANCHOR - Composables, Store
const apiProduct = useApiProduct()
const cIsUpdate = computed(() => !!props.uExpense)

//ANCHOR - Start
const products = ref<ProductExt[]>([])
const expense = ref({} as ExpenseEntity)
const isShowModal = ref(false)

// 제품 항목 리스트

const expenseProducts = ref<ExpenseProductEntityCreate[]>([])

watch(
    () => props.uExpense,
    () => {
        if (props.uExpense) expense.value = props.uExpense
    }
)

const expenseAt = ref<Date>()

// 선택된 단위의 unitCntList
function getUnitCntListForProduct(item: ExpenseProductEntityCreate) {
    const product = products.value.find((p) => p.seq === item.prdSeq)
    return product?.unitCntList ?? []
}

// 새 항목 추가
function addProduct() {
    expenseProducts.value.push({
        cnt: 1,
        price: 0,
    } as ExpenseProductEntityCreate)
}

// 항목 삭제
function removeProduct(index: number) {
    expenseProducts.value.splice(index, 1)
}

// 제품 선택 시 첫 번째 단위 자동 선택
function onProductSelect(item: ExpenseProductEntityCreate) {
    const product = products.value.find((p) => p.seq === item.prdSeq)
    if (product && product.unitCntList.length > 0) {
        item.unitCnt = product.unitCntList[0]
    }
}

// 총 금액 계산
const cTotalAmount = computed(() => {
    return expenseProducts.value.reduce((sum, item) => sum + item.price * item.cnt, 0)
})

function onSave() {
    // expense.amount에 총 금액 설정
    expense.value.amount = cTotalAmount.value
    expense.value.expenseAt = expenseAt.value || new Date()

    if (cIsUpdate.value) emit('update', expense.value)
    else emit('create', expense.value)
}

// 초기 항목 추가
onMounted(() => {
    if (expenseProducts.value.length === 0) {
        addProduct()
    }
})
</script>
<template>
    <section class="expense-edit">
        <section class="top"></section>
        <section class="body flex flex-col gap-2">
            <div class="row">
                <label>지출일자</label>
                <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
                </VueDatePicker>
            </div>
            <div class="row">
                <label>카테고리</label>
                <VSelect :items="expenseCategories" item-title="path" item-value="seq" v-model="expense.ctgSeq" density="compact" :hide-details="true">
                    <template v-slot:append-item>
                        <VBtn @click="() => (isShowModal = true)" color="primary" class="w-full"
                            ><span class="mr-2">추가</span><font-awesome-icon :icon="['fas', 'plus']"
                        /></VBtn>
                        <VDivider class="test mt-2 h-4" style="border: 2px solid black"></VDivider>
                    </template>
                </VSelect>
            </div>
            <div class="row">
                <label>매장</label>
                <VAutocomplete :items="stores" item-title="name" item-value="seq" v-model="expense.storeSeq" density="compact" :hide-details="true">
                </VAutocomplete>
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

                <div class="products-table">
                    <table class="w-full">
                        <thead>
                            <tr>
                                <th>제품</th>
                                <th>단위</th>
                                <th>단위수량</th>
                                <th>수량</th>
                                <th>가격</th>
                                <th>소계</th>
                                <th>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in expenseProducts" :key="index">
                                <td>
                                    <VAutocomplete
                                        v-model="item.prdSeq"
                                        :items="products"
                                        item-title="prdInfo.name"
                                        item-value="seq"
                                        placeholder="제품 선택"
                                        density="compact"
                                        :hide-details="true"
                                        @update:model-value="onProductSelect(item)"
                                    ></VAutocomplete>
                                </td>
                                <td>
                                    <VSelect
                                        v-model="item.unitCnt"
                                        :items="getUnitCntListForProduct(item)"
                                        placeholder="단위수량"
                                        density="compact"
                                        :hide-details="true"
                                        :disabled="!item.prdSeq"
                                    ></VSelect>
                                </td>
                                <td>
                                    <BInput v-model="item.cnt" type="number" class="w-20" :active-cancel="false"></BInput>
                                </td>
                                <td>
                                    <BInput v-model="item.price" type="number" class="w-24" :active-cancel="false"></BInput>
                                </td>
                                <td class="text-right">{{ (item.price * item.cnt).toLocaleString('ko-KR') }}원</td>
                                <td class="text-center">
                                    <button @click="removeProduct(index)" class="text-danger">
                                        <font-awesome-icon :icon="['fas', 'trash']" />
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="expenseProducts.length === 0">
                                <td colspan="7" class="text-center text-gray-400">항목을 추가해주세요</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr class="font-bold">
                                <td colspan="5" class="text-right">총 금액:</td>
                                <td class="text-right">{{ cTotalAmount.toLocaleString('ko-KR') }}원</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </section>
        <section class="footer flex justify-end gap-2">
            <BButton @click="onSave" variant="primary">{{ cIsUpdate ? '수정' : '저장' }}</BButton>
            <BButton @click="() => $emit('cancel')" variant="outline">취소</BButton>
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
    .products-section {
        margin-top: 1rem;

        .products-table {
            overflow-x: auto;
            border: 1px solid #ddd;
            border-radius: 4px;

            table {
                width: 100%;
                border-collapse: collapse;

                th,
                td {
                    padding: 8px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                thead {
                    background-color: #f5f5f5;

                    th {
                        font-weight: 600;
                        text-align: center;
                    }
                }

                tbody {
                    tr {
                        &:hover {
                            background-color: #f9f9f9;
                        }
                    }
                }

                tfoot {
                    background-color: #f5f5f5;
                    border-top: 2px solid #999;

                    td {
                        font-size: 16px;
                    }
                }
            }
        }
    }
}
</style>
