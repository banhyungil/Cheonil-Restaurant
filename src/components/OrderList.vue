<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import type { VDataTable } from 'vuetify/components'
import _ from 'lodash'
import dayjs from 'dayjs'
import usePagination from '@/composable/usePagination'

const orders = defineModel<Order[]>({ default: [], required: true })
const selected = defineModel<Order[]>('selected')

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
  { title: '결재방식', key: 'payWay', align: 'center' },
  { title: '결재날짜', key: 'payAt', align: 'center' },
]) as Ref<NonNullable<VDataTable['$props']['headers']>>
const cHeaders = computed(() => headers.value.filter((item) => item.key))

const apiOrder = useApiOrder()

apiOrder.selectList().then((res) => {
  orders.value = res
})

const cDtOrders = computed(() =>
  orders.value.map((od, idx) => {
    const menuNm = od.orderMenues.map((om) => om.menu.name + om.cnt).join(', ')
    const orderAtF = dayjs(od.orderAt).format('YY.MM.DD HH:MM')

    const [payWay, payAt] = (() => {
      if (od.payments.length == 0) return ['미수', null]
      else {
        const date = _.last(od.payments)!.payAt
        const payTypes = _.uniq(od.payments.map((p) => p.payType))
        if (payTypes.length > 1) return ['복합', date]
        else if (payTypes[0] == 'CASH') return ['현금', date]
        else return ['카드', date]
      }
    })()

    const completeAtF = dayjs(od.completeAt).format('YY.MM.DD HH:MM')

    return { ...od, no: idx + 1, menuNm, orderAtF, payWay, payAt, completeAtF }
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
</script>

<template>
  <v-data-table :show-select="Array.isArray(selected)" v-model="selected" :headers="cHeaders" :items="cDtOrders" item-value="seq">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <slot name="top"></slot>
    </template>
    <template v-slot:bottom>
      <div class="c-page" style="display: flex">
        <v-pagination class="page" v-model="pageNo" :length="cTotalPage"></v-pagination>
        <v-select class="select" :items="PAGE_SIZE_LIST" v-model="pageSize" density="comfortable"></v-select>
      </div>
    </template>
  </v-data-table>
</template>

<style lang="scss" scoped>
.c-page {
  display: flex;

  .page {
    width: 100%;
  }
  .select {
    width: 100px;
  }
}
</style>
