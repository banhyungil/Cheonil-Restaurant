<script setup lang="ts">
import useSwal from '@/composable/useSwal'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import { useMenuStore } from '@/stores/menuStore'
import useApiMenuCtg from '@/api/useApiMenuCtg'

const menuStore = useMenuStore()
const apiMenuCtg = useApiMenuCtg()
const Swal = useSwal()
const router = useRouter()

interface Props {
  name?: string
}
const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.name ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))
const ctg = ref<MenuCategoryEntity>({ name: '' })
if (props.name) {
  ctg.value = _.cloneDeep(menuStore.categories.find((ctg) => ctg.name == props.name))!
}

const inp = ref() as Ref<HTMLInputElement>
async function onSave() {
  // 검증
  if (!cIsUpdate.value && menuStore.categories.some((iCtg) => iCtg.name == ctg.value.name)) {
    Swal.fire({ title: '중복된 카테고리가 존재합니다.', icon: 'warning' })

    inp.value.focus()
  } else {
    if (cIsUpdate.value) {
      await apiMenuCtg.update(props.name!, ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'update' })
    } else {
      await apiMenuCtg.create(ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'save' })
    }
    menuStore.categories = await apiMenuCtg.selectList()
    router.back()
  }
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    await apiMenuCtg.remove(ctg.value.name)
    menuStore.categories = await apiMenuCtg.selectList()

    Swal.fireCustom({ toast: true, messageType: 'remove' })
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
      <section class="top">{{ `메뉴 카테고리 ${cText}` }}</section>
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
