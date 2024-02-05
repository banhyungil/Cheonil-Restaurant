<script setup lang="ts">
import type { Menu, Order, Store } from '@/@types/cheonil'
import useApiMenu from '@/api/useApiMenu'
import useApiStore from '@/api/useApiStore'
import MenuTab from '@/components/MenuTab.vue'
import StoreTab from '@/components/StoreTab.vue'
import { ref, watch, type Ref } from 'vue'

// 주문완료시 Order 저장 후 리셋
const tab = ref<'store' | 'menu'>('store')

// 주문 목록 entity는 주문을 할떄 만들어진다
const nOrder = ref({} as Partial<Order>)
watch(
  () => nOrder.value,
  () => {
    if (nOrder.value == null) tab.value = 'store'
  }
)

function onSelectStore(store: Store) {
  nOrder.value.store = store

  tab.value = 'menu'
}

function onSelectMenu(menu: Menu) {
  if (nOrder.value.menues == null) nOrder.value.menues = []
  const omenu = nOrder.value.menues.find((omenu) => omenu.id == menu.id)
  // 해당 메뉴 존재 시 수량 증가
  if (omenu) ++omenu.cnt
  else nOrder.value.menues.push({ ...menu, cnt: 1 })
}

function onClickStoreName() {
  tab.value = 'store'
}
</script>

<template>
  <div class="order-view">
    <section class="left">
      <StoreTab v-if="tab" @select="onSelectStore" />
      <MenuTab v-else @select="onSelectMenu" />
    </section>
    <section class="right">
      <section class="top">
        <button @click="onClickStoreName">{{ nOrder.store?.name }}</button>
      </section>
      <section class="content">
        <ul class="orders">
          <!-- 주문 목록을 표시, 주문 목록 정보 객체를 만들어야함 -->
          <li v-for="(menu, idx) in nOrder.menues" :key="idx">
            <div>
              <span>{{ menu.name }}</span>
              <button></button>
              <span></span>
              <button></button>
            </div>
          </li>
        </ul>
        <div class="c-total"></div>
      </section>
      <section class="btt"></section>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.order-view {
  display: flex;
  height: 100%;
  background-color: rgb(199, 197, 197);

  .left {
    width: 60vw;
    height: 100%;
    .top {
    }
    .ctgs {
    }
    .grid {
    }
  }
  .right {
    width: calc(100% - 60vw);
    height: 100%;
    background-color: blue;
    .top {
    }
    .content {
      .orders {
      }
      .c-total {
      }
    }
    .btt {
    }
  }
}
</style>
