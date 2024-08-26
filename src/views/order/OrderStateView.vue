<script setup lang="ts">
import useApiOrder from '@/api/useApiOrder'
import { ref } from 'vue'
import { format, differenceInSeconds, toDate } from 'date-fns'
import { useNow } from '@vueuse/core'
import useSwal from '@/composable/useSwal'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { Dropdown } from 'floating-vue'
import useWebSocket from '@/api/useWebSocket'

const WS = useWebSocket()
const apiOrder = useApiOrder()
const orders = ref<Order[]>([])
const completeOrders = ref<Order[]>([])
const dLoading = ref<Record<string, boolean>>({})
const router = useRouter()
apiOrder.selectList({ whereOptions: { status: { eq: 'READY' } } }).then((list) => {
  orders.value = list.orders
})

apiOrder.selectList({ whereOptions: { status: { eq: 'COOKED' }, orderAt: { gte: toDate(new Date().setHours(0, 0, 0, 0)) } }, limit: 10 }).then((res) => {
  completeOrders.value = res.orders
})

WS.listen('/api/order', 'POST', async (sync) => {
  const nOrder = await apiOrder.select(sync.resBody.seq)
  orders.value.push(nOrder)
  orders.value = _.orderBy(orders.value, ['orderAt'], ['desc'])
})

WS.listen('/api/order/:seq', 'PATCH', (sync) => {
  const tgtOrder = orders.value.find((od) => od.seq == sync.resBody.seq)
  if (tgtOrder) Object.assign(tgtOrder, sync.resBody)
})

WS.listen('/api/order/:seq', 'DELETE', (sync) => {
  _.remove(orders.value, (od) => od.seq == +sync.routeParams.seq)
})

const Swal = useSwal()

async function onComplete(order: Order) {
  dLoading.value[order.seq!] = true

  order.status = 'COOKED'
  const data = {
    seq: order.seq,
    status: order.status,
    cookedAt: new Date(),
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
    cookedAt: new Date(),
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

function onUpdate(orderSeq: number) {
  router.push(`/order/${orderSeq}`)
}

async function onRemove(orderId: number) {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    apiOrder.remove(orderId)
    _.remove(orders.value, (od) => od.seq == orderId)

    Swal.fireCustom({ toast: true, messageType: 'remove' })
  }
}
const isDisplaykitchen = ref(false)
</script>

<template>
  <div class="order-state-view" :class="{ kitchen: isDisplaykitchen }">
    <div class="tw-flex tw-justify-end">
      <v-btn @click="() => (isDisplaykitchen = !isDisplaykitchen)" :color="isDisplaykitchen ? 'primary' : ''" class="kitchen" style="height: 24px">
        주방용
      </v-btn>
    </div>
    <div class="react-grid-col ready">
      <TransitionGroup name="slide">
        <div v-for="order in orders" :key="order.seq" class="item c-order">
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
            <div v-for="(om, idx) in order.orderMenues" :key="om.menuSeq" class="text" style="font-weight: bold; margin: 2px">
              <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
              <span v-if="idx < order.orderMenues.length - 1">,</span>
            </div>
          </div>
          <div v-if="order.cmt">{{ `요청사항: ${order.cmt}` }}</div>
          <template v-if="isDisplaykitchen == false">
            <div class="time">
              <span class="order-time" v-tooltip="'주문접수시간'">
                <font-awesome-icon :icon="['fas', 'timer']" />
                {{ order.orderAt ? format(order.orderAt, 'hh:mm aa') : null }}
              </span>
              <span class="elapsed"> {{ `${formatTime(differenceInSeconds(now, order.orderAt!))}` }}</span>
            </div>
            <v-btn class="complete" @click="onComplete(order)" :loading="dLoading[order.seq!]">완료</v-btn>
          </template>
        </div>
      </TransitionGroup>
    </div>
    <!-- 
      주문처리완료 목록
    -->
    <div v-if="isDisplaykitchen == false" class="c-completed">
      <div class="title">주문완료 목록</div>
      <div class="react-grid-col cooked">
        <TransitionGroup name="slide">
          <div v-for="order in completeOrders" :key="order.seq" class="item c-order">
            <div class="store">
              <span>{{ order.store.name }}</span>
            </div>
            <div class="menues">
              <div v-for="(om, idx) in order.orderMenues" :key="om.menuSeq" class="text">
                <span>{{ `${om.menu.abv ?? om.menu.name} ${om.cnt}` }}</span>
                <span v-if="idx < order.orderMenues.length - 1">, </span>
              </div>
            </div>
            <div v-if="order.cmt">{{ `요청사항: ${order.cmt}` }}</div>
            <div class="time" v-tooltip="'완료시간'">
              <span class="order-time" style="color: var(--color-point)">
                <font-awesome-icon :icon="['fas', 'timer']" />
                {{ order.cookedAt ? format(order.cookedAt, 'hh:mm aa') : null }}
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
.order-state-view {
  display: grid;
  grid-template-rows: max-content 1fr 280px;
  height: calc(100vh - 60px - 40px - 20px);
  font-weight: bold;

  button.kitchen {
    &:hover {
      border: 1px solid var(--color-point);
      color: var(--color-point);
      transition: all 0.1s ease-in-out;
    }
  }

  @apply tw-text-3xl;

  @media screen and (max-height: 1000px) {
    @apply tw-text-lg;
  }

  .react-grid-col {
    $item-min-width: 240px;

    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    height: 100%;
    padding: 4px;

    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 0;
    }

    &.ready {
      grid-template-rows: repeat(3, 1fr);
    }

    button.complete {
      height: max-content;
      padding: 8px;
    }

    &.cooked {
      max-width: 100%;
      grid-auto-flow: column;
      height: 100%;

      overflow-x: auto;
      &::-webkit-scrollbar {
        width: 0;
      }

      & > .item {
        margin-bottom: 10px;
      }
    }

    @media screen and (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media screen and (max-width: 768px) {
      grid-template-columns: repeat(1, 1fr);
    }

    .c-order {
      display: flex;
      align-items: center;
      flex-direction: column;
      row-gap: 6px;
      box-shadow: var(--box-shadow);
      min-width: $item-min-width;

      & > * {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .store {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        text-align: center;
        padding: 10px;
        font-weight: bold;
        color: #fff;
        background-color: #646464;

        @apply tw-text-6xl;

        .c-choice {
          position: absolute;
          right: 4px;

          button.choice {
            padding: 0 14px;

            &:hover {
              color: rgb(81 81 81);
            }
          }
        }
      }
      .menues {
        flex-grow: 1;
        display: flex;
        flex-wrap: wrap;
        margin: 10px 0;

        @apply tw-text-6xl;
      }

      .time {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin: 10px 0;

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

      @media screen and (max-height: 1000px) {
        @apply tw-text-lg;
        .store {
          @apply tw-text-lg;
        }
        .menues {
          @apply tw-text-lg;
        }
        .time {
          @apply tw-text-lg;
        }
      }
    }
  }

  .c-completed {
    display: grid;
    grid-template-rows: max-content 1fr;
    overflow: hidden;

    .title {
      width: 100%;
      min-width: 140px;
      padding: 8px;
      color: #fff;
      background-color: #525252;
      opacity: 0.9;
      margin-bottom: 10px;
      font-size: 1.2em;
      font-weight: bold;
    }
  }

  &.kitchen {
    grid-template-rows: max-content 1fr;
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
