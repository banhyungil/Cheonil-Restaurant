<script setup lang="ts">
import type { StoreCategoryEntity } from '@/@types/Database'
import useApiStoreCtg from '@/api/useApiStoreCtg'
import useSwal from '@/composable/useSwal'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'

const storeStore = useStoreStore()
const Toast = useSwal({ toast: true })
const Swal = useSwal()
const router = useRouter()
const apiStoreCtg = useApiStoreCtg()

interface Props {
  name?: string
}
const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.name ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))
const ctg = ref<StoreCategoryEntity>({ name: '' })
if (props.name) {
  ctg.value = _.cloneDeep(storeStore.categories.find((ctg) => ctg.name == props.name))!
}

const inp = ref() as Ref<HTMLInputElement>
async function onSave() {
  // 검증
  if (storeStore.categories.some((iCtg) => iCtg.name == ctg.value.name)) {
    Toast.fire({ title: '중복된 카테고리가 존재합니다.', icon: 'warning' })

    inp.value.focus()
  } else {
    if (cIsUpdate.value) {
      await apiStoreCtg.update(props.name!, ctg.value)
      Toast.update()
    } else {
      await apiStoreCtg.create(ctg.value)
      Toast.create()
    }
    storeStore.categories = await apiStoreCtg.select()
    router.back()
  }
}

async function onRemove() {
  if (await Swal.isConfirm('remove')) {
    await apiStoreCtg.remove(ctg.value.name)
    storeStore.categories = await apiStoreCtg.select()

    Toast.remove()
    router.back()
  }
}
function onCancel() {
  router.back()
}
</script>
<template>
  <section class="store-ctg-view">
    <section class="wrapper g-form">
      <section class="top">{{ `매장 카테고리 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label">카테고리 명</span>
          <input class="val" ref="inp" type="text" v-model="ctg.name" />
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
.store-ctg-view {
  @include center-view;
}
</style>
