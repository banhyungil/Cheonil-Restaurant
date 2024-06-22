<script setup lang="ts">
import useApiOrder, { type OrderResult } from '@/api/useApiOrder'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useEventBus, useIntervalFn, useNow } from '@vueuse/core'
import useSwal from '@/composable/useSwal'
import { useOrderStore } from '@/stores/orderStore'
import { useRouter } from 'vue-router'
import _ from 'lodash'

const apiOrder = useApiOrder()
const orderStore = useOrderStore()
const orders = ref<OrderResult[]>([])
const completeOrders = ref<OrderResult[]>([])
const dLoading = ref<Record<string, boolean>>({})
const router = useRouter()
useIntervalFn(
  () => {
    apiOrder.selectList({ status: { eq: 'READY' } }).then((list) => {
      orders.value = list
    })

    console.log('selectList')
  },
  1000000,
  { immediateCallback: true }
)

const Swal = useSwal()

async function onComplete(order: OrderResult) {
  dLoading.value[order.seq!] = true

  order.status = 'COMPLETE'
  const data = {
    seq: order.seq,
    status: order.status,
    completeTime: new Date(),
  } as OrderEntity

  await apiOrder.update(data)
  Swal.fireCustom({ toast: true, title: '주문이 처리되었습니다.', icon: 'success' })
  _.remove(orders.value, order)
  order.completeTime = new Date()
  completeOrders.value.splice(0, 0, order)

  dLoading.value[order.seq!] = false
}

async function onUnComplete(order: OrderResult) {
  dLoading.value[order.seq!] = true

  order.status = 'READY'
  const data = {
    seq: order.seq,
    status: order.status,
    completeTime: new Date(),
  } as OrderEntity

  await apiOrder.update(data)
  _.remove(completeOrders.value, order)
  orders.value.push(order)
  orders.value.sort((a, b) => a.orderTime!.getTime() - b.orderTime!.getTime())

  dLoading.value[order.seq!] = false
}

const now = useNow()
function formatTime(second: number) {
  return `${Math.floor(second / 60)}분${second % 60}초`
}

function onUpdate(orderId: number) {
  router.push(`/order/${orderId}`)
}

async function onRemove(orderId: number) {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    apiOrder.remove(orderId)
    _.remove(orders.value, (od) => od.seq == orderId)

    Swal.fireCustom({ toast: true, messageType: 'remove' })
  }
}
</script>

<template>
  <div class="order-state-view">
    <div class="react-grid-col">
      <TransitionGroup name="slide">
        <div v-for="order in orders" :key="order.seq" class="c-order">
          <div class="store">
            <span>{{ order.store.name }}</span>
            <VDropdown class="c-choice">
              <button class="choice">
                <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
              </button>
              <template #popper>
                <div class="c-btn">
                  <button class="update" @click="onUpdate(order.seq!)">수정</button>
                  <button class="remove" @click="onRemove(order.seq!)">삭제</button>
                </div>
              </template>
            </VDropdown>
          </div>
          <div class="menues">
            <div v-for="(om, idx) in order.orderMenues" :key="om.menuNm" class="text">
              <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
              <span v-if="idx != order.orderMenues.length">,</span>
            </div>
          </div>
          <div v-if="order.reqCmt">{{ `요청사항: ${order.reqCmt}` }}</div>
          <div class="time">
            <span class="order-time">
              <font-awesome-icon :icon="['fas', 'timer']" />
              {{ dayjs(order.orderTime).format('hh:MM a') }}
            </span>
            <span class="elapsed">
              {{ `${formatTime(dayjs(now).diff(order.orderTime, 'second'))}` }}</span
            >
          </div>
          <v-btn class="complete" @click="onComplete(order)" :loading="dLoading[order.seq!]"
            >완료</v-btn
          >
        </div>
      </TransitionGroup>
    </div>
    <!-- 
      주문처리완료 목록
    -->
    <div class="react-grid-col">
      <TransitionGroup name="slide">
        <div v-for="order in completeOrders" :key="order.seq" class="c-order">
          <div class="store">
            <span>{{ order.store.name }}</span>
          </div>
          <div class="menues">
            <div v-for="(om, idx) in order.orderMenues" :key="om.menuNm" class="text">
              <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
              <span v-if="idx != order.orderMenues.length">,</span>
            </div>
          </div>
          <div v-if="order.reqCmt">{{ `요청사항: ${order.reqCmt}` }}</div>
          <div class="time">
            <span class="order-time" style="color: var(--color-point)">
              <font-awesome-icon :icon="['fas', 'timer']" />
              {{ dayjs(order.completeTime).format('HH:MM') }}
            </span>
          </div>
          <v-btn
            class="complete"
            style="background-color: var(--color-d)"
            @click="onUnComplete(order)"
            :loading="dLoading[order.seq!]"
            >완료 취소</v-btn
          >
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$height-item: 194px;

.order-state-view {
  display: grid;
  grid-template-rows: 1fr minmax(max-content, $height-item);
  height: 100%;

  .react-grid-col {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    column-gap: 12px;

    @media screen and (max-width: 1024px) {
      grid-template-columns: repeat(5, 1fr);
    }

    @media screen and (max-width: 768px) {
      grid-template-columns: repeat(1, 1fr);
    }

    .c-order {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      row-gap: 6px;
      box-shadow: var(--box-shadow);
      height: $height-item;

      & > * {
        padding: 10px;
      }

      .store {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-align: center;
        color: #595959;
        // background-color: rgb(95, 171, 237);
        background-color: rgb(39 44 49 / 14%);
        font-weight: bold;

        .c-choice {
          position: absolute;
          right: 4px;

          button.choice {
            padding: 0 14px;

            &:hover {
              color: var(--color-point);
            }
          }
        }
      }
      .menues {
        display: flex;
        flex-wrap: wrap;
        height: 100%;
      }

      .time {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .order-time {
        }
        .elapsed {
          margin-left: 4px;
          color: var(--color-u);
        }
      }

      button.complete {
        width: 100%;
        text-align: center;
        background-color: var(--color-point);
        color: #fff;
      }
    }
  }
}

.v-popper__popper {
  .c-btn {
    display: flex;
    flex-direction: column;

    button {
      padding: 10px 14px;
      border-bottom: 1px solid grey;
      &:hover {
        color: #fff;
      }
      &.update:hover {
        background-color: var(--color-u);
      }
      &.remove:hover {
        background-color: var(--color-d);
      }
    }
  }
}
</style>
