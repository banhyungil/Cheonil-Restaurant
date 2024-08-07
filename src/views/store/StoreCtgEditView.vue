<script setup lang="ts">
import useApiStoreCtg from '@/api/useApiStoreCtg'
import useSwal from '@/composable/useSwal'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import useApiPlaceCtg from '@/api/useApiPlaceCtg'
import { usePlaceCtgStore } from '@/stores/placeCtgStore'

const storeStore = useStoreStore()
const Swal = useSwal()
const router = useRouter()
const apiStoreCtg = useApiStoreCtg()
const apiPlaceCtg = useApiPlaceCtg()
const placeCtgStore = usePlaceCtgStore()
apiPlaceCtg.selectList().then((res) => {
  placeCtgStore.items = res
})

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
  if (!cIsUpdate.value && storeStore.categories.some((iCtg) => iCtg.name == ctg.value.name)) {
    Swal.fire({ title: '중복된 카테고리가 존재합니다.', icon: 'warning' })

    inp.value.focus()
  } else {
    if (cIsUpdate.value) {
      await apiStoreCtg.update(props.name!, ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'update' })
    } else {
      await apiStoreCtg.create(ctg.value)
      Swal.fireCustom({ toast: true, messageType: 'save' })
    }
    storeStore.categories = await apiStoreCtg.selectList()
    router.back()
  }
}

function onAddPlaceCtg() {
  router.push('/placeCtgEdit')
}

function onEditPlaceCtg(name: string) {
  router.push(`/placeCtgEdit/${name}`)
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    await apiStoreCtg.remove(ctg.value.name)
    storeStore.categories = await apiStoreCtg.selectList()

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
      <section class="top">{{ `매장 카테고리 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label">카테고리 명</span>
          <input class="val" ref="inp" type="text" v-model="ctg.name" />
        </div>
        <div class="row">
          <span class="label">구역 </span>
          <div
            class="val"
            style="display: flex; justify-content: center; align-items: center; height: 56px"
          >
            <v-select :items="placeCtgStore.items.map((ctg) => ctg.name)" v-model="ctg.placeCtgNm">
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:append>
                    <button @click="onEditPlaceCtg(item.raw)">
                      <font-awesome-icon :icon="['fas', 'pen']" />
                    </button>
                  </template>
                </v-list-item>
              </template>
            </v-select>
            <button @click="onAddPlaceCtg"><font-awesome-icon :icon="['fas', 'plus']" /></button>
          </div>
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
