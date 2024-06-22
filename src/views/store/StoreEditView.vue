<script setup lang="ts">
import useApiStore from '@/api/useApiStore'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'
import { usePlaceCtgStore } from '@/stores/placeCtgStore'
import useApiPlaceCtg from '@/api/useApiPlaceCtg'

// 주문 화면 다음으로 이동될 화면
// 가게, 카테고리 목록은 store에 저장된 데이터 사용
const storeStore = useStoreStore()
const apiStore = useApiStore()
const Swal = useSwal()
const router = useRouter()
const apiPlaceCtg = useApiPlaceCtg()
const placeCtgStore = usePlaceCtgStore()
apiPlaceCtg.select().then((res) => {
  placeCtgStore.items = res
})

interface Props {
  name?: string
}

const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.name ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))

const store = ref({} as StoreEntity)
if (props.name) {
  store.value = _.cloneDeep(storeStore.items.find((item) => item.name == props.name)) as StoreEntity
}

async function onSave() {
  if (cIsUpdate.value) {
    await apiStore.update(props.name!, store.value)
    Swal.fireCustom({ toast: true, messageType: 'update' })
  } else {
    await apiStore.create(store.value)
    Swal.fireCustom({ toast: true, messageType: 'save' })
  }
  storeStore.items = await apiStore.select()

  router.back()
}

function onAddPlaceCtg() {
  router.push('/placeCtgEdit')
}

function onEditPlaceCtg(name: string) {
  router.push({ path: `/placeCtgEdit/${name}` })
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'update' })) {
    await apiStore.remove(props.name!)
    storeStore.items = await apiStore.select()

    Swal.fireCustom({ toast: true, messageType: 'remove' })
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
          <span class="label">구역</span>
          <div
            class="val"
            style="display: flex; justify-content: center; align-items: center; height: 56px"
          >
            <v-select
              :items="placeCtgStore.items.map((ctg) => ctg.name)"
              v-model="store.placeCtgName"
            >
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
        <div class="row">
          <span>비고</span>
          <v-textarea
            class="val"
            v-model="store.cmt"
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
.store-view {
  @include center-view;
}
</style>
