<script setup lang="ts">
import { type OrderMenuEntity, type StoreEntity } from '@/@types/Database'
import type { Menu, Order, Store } from '@/@types/cheonil'
import MenuTab from '@/components/MenuTab.vue'
import StoreTab from '@/components/StoreTab.vue'
import { useMenuStore } from '@/stores/menuStore'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref, watch, type Ref } from 'vue'
import _ from 'lodash'

const menuStore = useMenuStore()

// 주문완료시 Order 저장 후 리셋
const tab = ref<'store' | 'menu'>('store')

// 주문 목록 entity는 주문을 할떄 만들어진다\
const selStore = ref<StoreEntity>()
const orderMenues = ref<OrderMenuEntity[]>([])
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

function onSelectStore(store: StoreEntity) {
  console.log('onSelectStore')
  selStore.value = store

  tab.value = 'menu'
}

function onSelectMenu(menu: Menu) {
  console.log('onSelectMenu', menu)
  // menu 가 존재하면 수량만 증가
  // 없으면 메뉴 추가
  const orderMenu = orderMenues.value?.find((om) => om.menuId == menu.id)
  if (orderMenu) {
    ++orderMenu.cnt
  } else {
    orderMenues.value.push({
      menuId: menu.id,
      cnt: 1,
      price: menu.price,
    })
  }
}

function onClickStoreName() {
  tab.value = 'store'
}

function onComplete() {
  // db에 저장
  console.log('onComplete')
}

function onUp(om: OrderMenuEntity) {
  ++om.cnt
}

function onDown(om: OrderMenuEntity) {
  --om.cnt
}
</script>

<template>
  <div class="order-view">
    <section class="left">
      <StoreTab v-show="tab == 'store'" @selectItem="onSelectStore" />
      <MenuTab v-show="tab == 'menu'" @selectItem="onSelectMenu" />
    </section>
    <section class="right">
      <section class="top">
        <button class="store-name" @click="onClickStoreName">
          {{ selStore?.name ?? '미지정' }}
        </button>
      </section>
      <section class="content">
        <ul class="orders">
          <!-- 주문 목록을 표시, 주문 목록 정보 객체를 만들어야함 -->
          <li class="c-item" v-for="(om, idx) in orderMenues" :key="idx">
            <div class="main">
              <span class="name">{{ menuStore.dict[om.menuId].name }}</span>
              <div class="c-cnt-btn">
                <button @click="onUp(om)">+</button>
                <input type="number" v-model="om.cnt" />
                <button @click="onDown(om)">-</button>
              </div>
            </div>
            <div class="sub">{{ om.price.toLocaleString('ko-KR') }}</div>
          </li>
        </ul>
        <div class="c-total">
          <span>총 금액: {{ cTotalAmount.toLocaleString('ko-KR') }}</span>
        </div>
      </section>
      <section class="btt">
        <button class="complete" @click="onComplete" :disabled="orderMenues.length < 1">
          주문완료
        </button>
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
        padding: 10px;
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

            .name {
              font-weight: bold;
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
      }
    }
  }
}
</style>
