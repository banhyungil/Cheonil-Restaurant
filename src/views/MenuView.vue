<script setup lang="ts">
import type { MenuEntity } from '@/@types/Database'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'
import { useMenuStore } from '@/stores/menuStore'
import useApiMenu from '@/api/useApiMenu'
import BInputNumFormat from '@/components/base/BInputNumFormat.vue'

// 주문 화면 다음으로 이동될 화면
// 가게, 카테고리 목록은 store에 저장된 데이터 사용
const menuStore = useMenuStore()
const apiMenu = useApiMenu()
const Toast = useSwal({ toast: true })
const Swal = useSwal()
const router = useRouter()
const route = useRoute()

interface Props {
  id?: string
}

const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.id ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))
const menu = ref({ categoryName: route.query['ctgName'], name: '', price: 0 } as MenuEntity)
if (props.id) {
  menu.value = _.cloneDeep(menuStore.items.find((item) => item.id == props.id)) as MenuEntity
}

async function onSave() {
  if (cIsUpdate.value) {
    await apiMenu.update(props.id!, menu.value)
    Toast.update()
  } else {
    await apiMenu.create(menu.value)
    Toast.create()
  }
  menuStore.items = await apiMenu.select()

  router.back()
}

async function onRemove() {
  if (await Swal.isConfirm('remove')) {
    await apiMenu.remove(props.id!)
    menuStore.items = await apiMenu.select()

    Toast.remove()
    router.back()
  }
}

function onCancel() {
  router.back()
}
</script>

<template>
  <section class="menu-view">
    <section class="wrapper g-form">
      <section class="top">{{ `매장 카테고리 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label required">카테고리</span>
          <select class="val" v-model="menu.categoryName">
            <option :value="null">미지정</option>
            <option v-for="ctg in menuStore.categories" :key="ctg.name" :value="ctg.name">
              {{ ctg.name }}
            </option>
          </select>
        </div>
        <div class="row">
          <span class="label required">메뉴명</span>
          <input class="val" type="text" v-model="menu.name" />
        </div>
        <div class="row">
          <span class="label">메뉴명(축약)</span>
          <input
            class="val"
            type="text"
            v-model="menu.nameAbv"
            :placeholder="menu.name.slice(0, 2)"
          />
        </div>
        <div class="row">
          <span class="label required">가격</span>
          <BInputNumFormat v-model="menu.price"></BInputNumFormat>
        </div>
        <div class="row">
          <span>비고</span>
          <input class="val" type="text" v-model="menu.cmt" />
        </div>
      </section>
      <section class="btt">
        <button @click="onSave">{{ cText }}</button>
        <button v-if="cIsUpdate" @click="onRemove">삭제</button>
        <button @click="onCancel">취소</button>
      </section>
    </section>
  </section>
</template>

<style lang="scss" scoped>
.menu-view {
  @include center-view;
}
</style>
