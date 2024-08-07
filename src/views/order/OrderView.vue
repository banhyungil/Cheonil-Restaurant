<script setup lang="ts">
import MenuTab from '@/components/MenuTab.vue'
import StoreTab from '@/components/StoreTab.vue'
import { useMenuStore } from '@/stores/menuStore'
import { computed, ref, watch } from 'vue'
import _ from 'lodash'
import useApiOrder, { type OrderMenuCreation } from '@/api/useApiOrder'
import { useEventListener, useWindowSize } from '@vueuse/core'
import useSwal from '@/composable/useSwal'
import { useRouter } from 'vue-router'

interface Props {
  // orderId
  seq?: string
}
const props = defineProps<Props>()

const router = useRouter()
const menuStore = useMenuStore()
const apiOrder = useApiOrder()

const Swal = useSwal()
const { width } = useWindowSize()

// 주문완료시 Order 저장 후 리셋
const tab = ref<'store' | 'menu'>('store')

// 주문 목록 entity는 주문을 할떄 만들어진다
const selStore = ref({} as StoreEntity)
const orderMenues = ref<OrderMenuCreation[]>([])
const order = ref({ amount: 0, status: 'READY' } as MyOrderEntity)

if (props.seq) {
  apiOrder.select(props.seq).then((orderResult) => {
    if (orderResult == null) {
      router.push('/order')
    } else {
      order.value = orderResult
      selStore.value = orderResult.store
      orderMenues.value = orderResult.orderMenues
    }
  })
}

watch(
  orderMenues,
  () => {
    const delIdx = orderMenues.value.findIndex((om) => om.cnt === 0)
    if (delIdx >= 0) orderMenues.value.splice(delIdx, 1)
  },
  { deep: true }
)

const cTotalAmount = computed(() => {
  return _.sum(orderMenues.value.map((om) => om.price * om.cnt))
})

function onChoiceStore(store: StoreEntity) {
  console.log('onChoiceStore')
  selStore.value = store

  tab.value = 'menu'
}

function onChoiceMenu(menu: MenuEntity) {
  console.log('onChoiceMenu', menu)
  // menu 가 존재하면 수량만 증가
  // 없으면 메뉴 추가
  const orderMenu = orderMenues.value?.find((om) => om.menuSeq == menu.seq)
  if (orderMenu) {
    ++orderMenu.cnt
  } else {
    orderMenues.value.push({
      menuSeq: menu.seq,
      cnt: 1,
      price: menu.price,
    })
  }
}

function onClickStoreName() {
  tab.value = 'store'
}

async function onComplete() {
  order.value.seq = selStore.value.seq
  orderMenues.value.forEach((om) => {
    order.value.amount += om.price * om.cnt
  })

  if (props.seq) {
    await apiOrder.update(order.value, orderMenues.value)
    Swal.fireCustom({ toast: true, messageType: 'update' })
    router.back()
  } else {
    await apiOrder.create(order.value, orderMenues.value)
    Swal.fireCustom({ toast: true, messageType: 'save' })
    init()
  }
}

function init() {
  order.value = { amount: 0 } as MyOrderEntity
  orderMenues.value = []
  tab.value = 'store'
  selStore.value = {} as StoreEntity
}

useEventListener(document, 'keyup', (e) => {
  if (e.key == 'Escape') {
    if (tab.value == 'menu') {
      tab.value = 'store'
    }
  }
})
</script>

<template>
  <div class="order-view">
    <section class="left">
      <StoreTab v-show="tab == 'store'" @selectItem="onChoiceStore" />
      <MenuTab v-show="tab == 'menu'" @selectItem="onChoiceMenu" />
    </section>
    <section class="right">
      <section class="top">
        <v-btn class="store-name" @click="onClickStoreName">
          {{ selStore?.name ?? '미지정' }}
        </v-btn>
      </section>
      <section class="content">
        <ul class="orders">
          <!-- 주문 목록을 표시, 주문 목록 정보 객체를 만들어야함 -->
          <li class="c-item" v-for="(om, idx) in orderMenues" :key="idx">
            <div class="main">
              <!-- price 반응형 레이아웃 적용 -->
              <div class="c-title">
                <span class="name">{{ menuStore.dict[om.menuSeq].name }}</span>
                <span v-if="width < 1024" style="float: right">{{ ` ${om.price.toLocaleString('ko-KR')}` }}</span>
              </div>
              <div class="c-cnt-btn">
                <v-btn @click="() => om.cnt++">
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </v-btn>
                <!-- <button @click="onUp(om)">+</button> -->
                <input class="box-shadow" type="number" v-model="om.cnt" />
                <v-btn @click="() => om.cnt--">
                  <font-awesome-icon :icon="['fas', 'minus']" />
                </v-btn>
              </div>
            </div>
            <div v-if="width >= 1024" class="sub">{{ om.price.toLocaleString('ko-KR') }}</div>
          </li>
        </ul>
        <div class="c-total">
          <span>총 금액: {{ cTotalAmount.toLocaleString('ko-KR') }}</span>
        </div>
      </section>
      <section class="btt">
        <v-btn class="complete" :class="{ update: seq }" @click="onComplete" :disabled="orderMenues.length < 1">
          {{ seq ? '수정완료' : '주문완료' }}
        </v-btn>
      </section>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.order-view {
  display: flex;
  height: 100%;
  column-gap: 10px;

  @include vueSlide(100%);

  .left {
    width: 60vw;
    height: 100%;
    background-color: rgb(199, 197, 197);

    .top {
    }
    .ctgs {
    }
    .grid {
    }
  }
  .right {
    display: grid;
    grid-template-rows: minmax(60px, 10vh) 1fr minmax(60px, 10vh);
    width: calc(100% - 60vw);
    height: 100%;
    background-color: rgb(199, 197, 197);

    .top {
      display: flex;
      align-items: center;
      justify-content: center;

      button.store-name {
        width: 55%;
        height: 55%;
        color: #fff;
        font-weight: bold;
        background-color: var(--color-point);
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 10px;
      margin: 0 10px;
      border: 1px solid grey;

      .orders {
        display: flex;
        flex-direction: column;
        row-gap: 10px;
        height: 100%;
        overflow-y: auto;
        padding: 0 2px;
        // scrollbar 생길 때 border를 만나면 box가 일그러져 보여 일단 안보이게 처리
        // scrollbar-width: none;

        list-style-type: none;

        .c-item {
          display: flex;
          flex-direction: column;
          row-gap: 6px;
          border: 1px solid grey;
          padding: 18px;

          .main {
            display: flex;
            justify-content: space-between;

            .c-title {
              width: 100%;
              display: flex;
              justify-content: space-around;
              .name {
                font-weight: bold;
              }
            }

            .c-cnt-btn {
              display: flex;
              column-gap: 12px;
              justify-content: center;
              align-items: center;

              input[type='number'] {
                width: 40px;
                height: 32px;
                text-align: center;
              }

              button {
                width: 40px;
                height: 32px;
              }
            }
          }
          .sub {
            display: flex;
            justify-content: end;
          }
        }
      }
      .c-total {
        display: flex;
        justify-content: end;
        font-weight: bold;
      }
    }
    .btt {
      display: flex;
      align-items: center;
      justify-content: center;

      button.complete {
        width: 55%;
        height: 55%;
        padding: 10px;

        font-weight: bold;

        &:hover {
          background-color: var(--color-point);
          color: #fff;
        }
      }
      button.update {
        &:hover {
          background-color: var(--color-u);
          color: #fff;
        }
      }
    }
  }
}
input {
  background-color: #fff;
}

@media screen and (max-width: 1024px) {
  .order-view {
    .right {
      .content {
        .orders {
          .c-item {
            .main {
              flex-direction: column;
              align-items: center;
              row-gap: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
