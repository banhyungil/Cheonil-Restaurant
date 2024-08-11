<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { VDataTable } from 'vuetify/components'
import _ from 'lodash'
import dayjs from 'dayjs'
import usePagination from '@/composable/usePagination'

const orders = defineModel<Order[]>({ default: [], required: true })
const checkedSeqs = ref<Order['seq'][]>([])

interface Props {
  title: string
  whereInfo?: WhereInfo<MyOrderEntity>
  exceptKeys?: (keyof MyOrderEntity)[]
}

const props = defineProps<Props>()

const headers = ref([
  { title: '순번', key: 'no', sortable: false, align: 'start', width: '60px' },
  { title: '매장명', key: 'storeNm', align: 'center' },
  { title: '메뉴', key: 'menuNm', align: 'center' },
  { title: '주문시간', key: 'orderAtF', align: 'center' },
  { title: '완료시간', key: 'completeAtF', align: 'center' },
  { title: '결재방식', key: 'payInfo', align: 'center' },
  { title: '결재날짜', key: 'payAt', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center' },
]) as Ref<NonNullable<VDataTable['$props']['headers']>>
const cHeaders = computed(() => headers.value.filter((item) => item.key))

const apiOrder = useApiOrder()

apiOrder.selectList().then((res) => {
  orders.value = res
})

const isEdit = ref(false)

const cDtOrders = computed(() =>
  orders.value.map((od, idx) => {
    const menuNm = od.orderMenues.map((om) => om.menu.name + om.cnt).join(', ')
    const orderAtF = dayjs(od.orderAt).format('YY.MM.DD HH:MM')

    const payAt = _.last(od.payments)?.payAt
    const payType = (() => {
      if (od.payments.length == 0) return '미수'

      const payTypes = _.uniq(od.payments.map((p) => p.payType))
      if (payTypes.length > 1) return '복합'
      else if (payTypes[0] == 'CASH') return '현금'
      else return '카드'
    })()
    const payInfo = {
      type: payType,
      seqs: od.payments.map((p) => p.seq),
    }

    const completeAtF = dayjs(od.completeAt).format('YY.MM.DD HH:MM')

    return { ...od, no: idx + 1, storeNm: od.store.name, menuNm, orderAtF, payInfo, payAt, completeAtF }
  })
)

const { pageNo, pageSize, cOffset, cTotalPage, PAGE_SIZE_LIST } = usePagination(orders)

watch(
  [pageNo, pageSize],
  () => {
    apiOrder
      .selectList({
        ...props.whereInfo,
        status: { not: 'READY' },
        limit: pageSize.value,
        offset: cOffset.value,
      })
      .then((res) => {
        orders.value = res
      })
  },
  { immediate: true }
)

function collectionCash() {}
function collectionCard() {}
function cancelCollection() {}
</script>

<template>
  <v-data-table class="order-list" :show-select="isEdit" v-model="checkedSeqs" :headers="cHeaders" :items="cDtOrders" item-value="seq">
    <template #top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <section class="top">
        <!-- <v-btn @click="onRemove" class="toggle" :class="{ on: isEdit }"> 삭제 </v-btn> -->
        <v-btn>현금</v-btn>
        <v-btn>카드</v-btn>
        <v-btn @click="() => (isEdit = !isEdit)" class="toggle" :class="{ on: isEdit }" v-tooltip="'편집'">
          <font-awesome-icon :icon="['fas', 'pen']" />
        </v-btn>
      </section>
    </template>
    <template #item.actions>
      <button style="color: var(--color-d)" v-tooltip="'삭제'"><font-awesome-icon :icon="['fas', 'trash']" /></button>
    </template>
    <template #item.payInfo="{ value }">
      <div class="pay-info">
        <span>{{ value.type }}</span>
        <div class="c-btn">
          <template v-if="value.seqs.length == 0">
            <v-btn baseColor="var(--color-point)" text="현금" @click="collectionCash" style="color: #fff"></v-btn>
            <v-btn baseColor="var(--color-point)" @click="collectionCard" style="color: #fff">카드</v-btn>
          </template>
          <v-btn v-else @click="cancelCollection" base-color="var(--color-d)">수금 취소</v-btn>
        </div>
      </div>
    </template>
    <template #bottom>
      <div class="c-page" style="display: flex">
        <v-pagination class="page" v-model="pageNo" :length="cTotalPage"></v-pagination>
        <v-select class="select" :items="PAGE_SIZE_LIST" v-model="pageSize" density="comfortable"></v-select>
      </div>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
.order-list {
  section.top {
    display: flex;
    justify-content: end;
  }

  .pay-info {
    .c-btn {
      display: flex;
      justify-content: center;
      gap: 4px;

      button {
        min-width: 0;
        width: 46px;
      }
    }
  }

  .c-page {
    display: flex;

    .page {
      width: 100%;
    }
    .select {
      width: 100px;
    }
  }
}
</style>
