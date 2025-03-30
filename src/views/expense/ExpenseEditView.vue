<script setup lang="ts">
import { today } from '@/utils/CommonUtils'

const router = useRouter()
const apiExpense = useApiExpense()

// 매장
// 제품
// 카테고리리

interface Props {
    seq?: number
}
const props = defineProps<Props>()

// if (props?.seq) {
// }

const expenseAt = ref<Date>()

function onCancel() {
    router.back()
}
</script>
<template>
    <section class="expense-edit">
        <section class="top"></section>
        <section class="body tw-flex">
            <label>지출일자</label>
            <VueDatePicker v-model="expenseAt" :format="'yy.MM.dd'" :time-picker="false" text-input teleport :max-date="today()" auto-apply locale="ko-KR">
            </VueDatePicker>
        </section>
        <section class="footer tw-flex tw-justify-end">
            <button>등록</button>
            <button @click="onCancel">취소</button>
        </section>
    </section>
</template>

<style lang="scss" scoped>
.expense-edit {
}
</style>
