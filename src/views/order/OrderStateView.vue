<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import { ref } from 'vue'
import { format, differenceInSeconds } from 'date-fns'
import { useIntervalFn, useNow } from '@vueuse/core'
import useSwal from '@/composable/useSwal'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { Dropdown } from 'floating-vue'

const apiOrder = useApiOrder()
const orders = ref<Order[]>([])
const completeOrders = ref<Order[]>([])
const dLoading = ref<Record<string, boolean>>({})
const router = useRouter()
useIntervalFn(
  () => {
    apiOrder.selectList({ status: { eq: 'READY' } }).then((list) => {
      orders.value = list.orders
    })

    console.log('selectList')
  },
  10000,
  { immediateCallback: true }
)

apiOrder.selectList({ status: { eq: 'COOKED' } }).then((res) => {
  completeOrders.value = res.orders
})

const Swal = useSwal()

async function onComplete(order: Order) {
  dLoading.value[order.seq!] = true

  order.status = 'COOKED'
  const data = {
    seq: order.seq,
    status: order.status,
    completeAt: new Date(),
  } as MyOrderEntity

  const uOrderRes = await apiOrder.update(data)
  Swal.fireCustom({ toast: true, title: '주문이 처리되었습니다.', icon: 'success' })
  _.remove(orders.value, order)
  Object.assign(order, uOrderRes)

  completeOrders.value.splice(0, 0, order)

  dLoading.value[order.seq!] = false
}

async function onUnComplete(order: Order) {
  dLoading.value[order.seq!] = true

  order.status = 'READY'
  const data = {
    seq: order.seq,
    status: order.status,
    completeAt: new Date(),
  } as MyOrderEntity

  await apiOrder.update(data)
  _.remove(completeOrders.value, order)
  orders.value.push(order)
  orders.value.sort((a, b) => a.orderAt!.getTime() - b.orderAt!.getTime())

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
            <Dropdown class="c-choice">
              <button class="choice">
                <font-awesome-icon :icon="['fas', 'ellipsis-vertical']" />
              </button>
              <template #popper>
                <div class="c-btn">
                  <button class="update" @click="onUpdate(order.seq!)">수정</button>
                  <button class="remove" @click="onRemove(order.seq!)">삭제</button>
                </div>
              </template>
            </Dropdown>
          </div>
          <div class="menues">
            <div v-for="(om, idx) in order.orderMenues" :key="om.menuSeq" class="text">
              <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
              <span v-if="idx != order.orderMenues.length">,</span>
            </div>
          </div>
          <div v-if="order.cmt">{{ `요청사항: ${order.cmt}` }}</div>
          <div class="time">
            <span class="order-time" v-tooltip="'주문접수시간'">
              <font-awesome-icon :icon="['fas', 'timer']" />
              {{ order.orderAt ? format(order.orderAt, 'hh:MM aa') : null }}
            </span>
            <span class="elapsed"> {{ `${formatTime(differenceInSeconds(now, order.orderAt!))}` }}</span>
          </div>
          <v-btn class="complete" @click="onComplete(order)" :loading="dLoading[order.seq!]">완료</v-btn>
        </div>
      </TransitionGroup>
    </div>
    <!-- 
      주문처리완료 목록
    -->

    <div class="c-completed">
      <div class="title">주문완료 목록</div>
      <div class="react-grid-col">
        <TransitionGroup name="slide">
          <div v-for="order in completeOrders" :key="order.seq" class="c-order">
            <div class="store">
              <span>{{ order.store.name }}</span>
            </div>
            <div class="menues">
              <div v-for="(om, idx) in order.orderMenues" :key="om.menuSeq" class="text">
                <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
                <span v-if="idx != order.orderMenues.length">,</span>
              </div>
            </div>
            <div v-if="order.cmt">{{ `요청사항: ${order.cmt}` }}</div>
            <div class="time" v-tooltip="'완료시간'">
              <span class="order-time" style="color: var(--color-point)">
                <font-awesome-icon :icon="['fas', 'timer']" />
                {{ order.completeAt ? format(order.completeAt, 'hh:mm aa') : null }}
              </span>
            </div>
            <v-btn class="complete" style="background-color: var(--color-d)" @click="onUnComplete(order)" :loading="dLoading[order.seq!]">완료 취소</v-btn>
          </div>
        </TransitionGroup>
      </div>
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

  .c-completed {
    .title {
      padding: 8px;
      font-size: 18px;
      color: #fff;
      background-color: var(--color-point);
      opacity: 0.9;
      width: 100%;
      min-width: 140px;
      margin-bottom: 10px;
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
