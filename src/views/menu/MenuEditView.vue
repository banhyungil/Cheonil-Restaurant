<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'
import { useMenuStore } from '@/stores/menuStore'
import useApiMenu from '@/api/useApiMenu'
import BInputNumFormat from '@/components/base/BInputNumFormat.vue'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'

// 주문 화면 다음으로 이동될 화면
// 가게, 카테고리 목록은 store에 저장된 데이터 사용
const menuStore = useMenuStore()
const apiMenu = useApiMenu()
const Swal = useSwal()
const router = useRouter()
const routeQuery = useRoute().query

interface Props {
  seq?: number
}

const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.seq ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))
const menu = ref({ name: '', price: 0 } as MenuEntityCreation)
if (props.seq) {
  menu.value = _.cloneDeep(menuStore.items.find((item) => item.seq == props.seq)) as MenuEntityCreation
}
if (routeQuery) {
  if ('ctgSeq' in routeQuery && typeof routeQuery.ctgSeq == 'string') {
    menu.value.ctgSeq = +routeQuery.ctgSeq
  }
}

const oMenuProp: { [k in keyof MenuEntityCreation]: { label: string } } = {
  ctgSeq: { label: '카테고리' },
  name: { label: '메뉴명' },
  abv: { label: '메뉴명(축약)' },
  price: { label: '가격' },
  cmt: { label: '비고' },
}

const rules = {
  ctgSeq: {
    required: helpers.withMessage(`${oMenuProp.ctgSeq.label}를 선택해주세요.`, required),
  },
  name: {
    required: helpers.withMessage(`${oMenuProp.name.label}을 입력해주세요.`, required),
  },
  price: {
    required: helpers.withMessage(`${oMenuProp.price.label}을 입력해주세요.`, required),
  },
} as ValidationArgs<MenuEntityCreation>
const v$ = useVuelidate(rules, menu)

async function onSave() {
  if ((await v$.value.$validate()) == false) {
    Swal.fireCustom({ toast: true, title: v$.value.$silentErrors[0].$message, icon: 'warning' })
    return
  }
  if (cIsUpdate.value) {
    const uMenu = await apiMenu.update(menu.value as MenuEntity)

    Swal.fireCustom({ toast: true, messageType: 'update' })
  } else {
    if (menu.value.abv == null) menu.value.abv = menu.value.name.slice(0, 2)
    const nMenu = await apiMenu.create(menu.value)

    Swal.fireCustom({ toast: true, messageType: 'save' })
  }
  menuStore.items = await apiMenu.selectList()

  router.back()
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    await apiMenu.remove(props.seq!)
    menuStore.items = await apiMenu.selectList()

    Swal.fireCustom({ toast: true, messageType: 'remove' })
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
      <section class="top">{{ `메뉴 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label required">{{ oMenuProp.ctgSeq.label }}</span>
          <v-select :items="menuStore.categories" item-value="seq" item-title="name" v-model="menu.ctgSeq" density="comfortable"></v-select>
        </div>
        <div class="row">
          <span class="label required">{{ oMenuProp.name.label }}</span>
          <input class="val" type="text" v-model="menu.name" />
        </div>
        <div class="row">
          <span class="label">{{ oMenuProp.abv!.label }}</span>
          <input class="val" type="text" v-model="menu.abv" :placeholder="menu.name.slice(0, 2)" />
        </div>
        <div class="row">
          <span class="label required">{{ oMenuProp.price.label }}</span>
          <BInputNumFormat class="val" v-model="menu.price"></BInputNumFormat>
        </div>
        <div class="row">
          <span>{{ oMenuProp.cmt!.label }}</span>
          <v-textarea class="val" v-model="menu.cmt" rows="1" auto-grow bg-color="#fff" variant="outlined" style="height: fit-content"></v-textarea>
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
