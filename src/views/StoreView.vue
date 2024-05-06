<script setup lang="ts">
import type { StoreEntity } from '@/@types/Database'
import useApiStore from '@/api/useApiStore'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'

// 주문 화면 다음으로 이동될 화면
// 가게, 카테고리 목록은 store에 저장된 데이터 사용
const storeStore = useStoreStore()
const apiStore = useApiStore()
const Toast = useSwal({ toast: true })
const Swal = useSwal()
const router = useRouter()

interface Props {
  id?: string
}

const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.id ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))

const store = ref({ categoryName: null } as StoreEntity)
if (props.id) {
  store.value = _.cloneDeep(storeStore.items.find((item) => item.id == props.id)) as StoreEntity
}

async function onSave() {
  if (cIsUpdate.value) {
    await apiStore.update(props.id!, store.value)
    Toast.update()
  } else {
    await apiStore.create(store.value)
    Toast.create()
  }
  storeStore.items = await apiStore.select()

  router.back()
}

async function onRemove() {
  if (await Swal.isConfirm('remove')) {
    await apiStore.remove(props.id!)
    storeStore.items = await apiStore.select()

    Toast.remove()
    router.back()
  }
}

function onCancel() {
  router.back()
}
</script>

<template>
  <section class="store-view">
    <section class="wrapper g-form">
      <section class="top">{{ `매장 카테고리 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label">카테고리</span>
          <select class="val" v-model="store.categoryName">
            <option :value="null">미지정</option>
            <option v-for="ctg in storeStore.categories" :key="ctg.name" :value="ctg.name">
              {{ ctg.name }}
            </option>
          </select>
        </div>
        <div class="row">
          <span class="label">매장명</span>
          <input class="val" type="text" v-model="store.name" />
        </div>
        <div class="row">
          <span>비고</span>
          <input class="val" type="text" v-model="store.cmt" />
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
.store-view {
  @include center-view;
}
</style>
