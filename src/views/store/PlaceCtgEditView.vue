<script setup lang="ts">
import useApiPlaceCtg from '@/api/useApiPlaceCtg'
import useSwal from '@/composable/useSwal'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'

const Swal = useSwal()
const router = useRouter()

const apiPlaceCtg = useApiPlaceCtg()
const list = ref([] as PlaceCategoryEntity[])

interface Props {
  name?: string
}

const props = defineProps<Props>()

const cIsUpdate = computed(() => (props.name ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))
const ctg = ref<PlaceCategoryEntity>({ name: '' })

onMounted(async () => {
  await apiPlaceCtg.select().then((res) => {
    list.value = res
  })

  if (props.name) {
    ctg.value = _.cloneDeep(list.value.find((ctg) => ctg.name == props.name))!
  }
})

const inp = ref() as Ref<HTMLInputElement>
async function onSave() {
  // 검증
  if (list.value.some((iCtg) => iCtg.name == ctg.value.name)) {
    Swal.fire({ title: '중복된 구역이 존재합니다.', icon: 'warning' })

    inp.value.focus()
  } else {
    if (cIsUpdate.value) {
      await apiPlaceCtg.update(props.name!, ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'update' })
    } else {
      await apiPlaceCtg.create(ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'save' })
    }
    list.value = await apiPlaceCtg.select()
    router.back()
  }
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'update' })) {
    await apiPlaceCtg.remove(ctg.value.name)
    list.value = await apiPlaceCtg.select()

    Swal.fireCustom({ toast: true, messageType: 'remove' })
    router.back()
  }
}
function onCancel() {
  router.back()
}
</script>
<template>
  <section class="place-ctg-view">
    <section class="wrapper g-form">
      <section class="top">{{ `구역 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label">구역</span>
          <input class="val" ref="inp" type="text" v-model="ctg.name" />
        </div>
        <div class="row">
          <span class="label">비고</span>
          <v-textarea
            class="val"
            v-model="ctg.cmt"
            rows="1"
            auto-grow
            bg-color="#fff"
            variant="outlined"
            style="height: fit-content"
          ></v-textarea>
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
.place-ctg-view {
  @include center-view;
}
</style>
