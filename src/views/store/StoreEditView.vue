<script setup lang="ts">
import useApiStore from '@/api/useApiStore'
import { useStoreStore } from '@/stores/storeStore'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import _ from 'lodash'
import useSwal from '@/composable/useSwal'
import { usePlaceCtgStore } from '@/stores/placeCtgStore'
import useApiPlaceCtg from '@/api/useApiPlaceCtg'
import { useVuelidate, type ValidationArgs } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'

// 주문 화면 다음으로 이동될 화면
// 가게, 카테고리 목록은 store에 저장된 데이터 사용
const storeStore = useStoreStore()
const apiStore = useApiStore()
const Swal = useSwal()
const router = useRouter()
const apiPlaceCtg = useApiPlaceCtg()
const placeCtgStore = usePlaceCtgStore()
apiPlaceCtg.selectList().then((res) => {
  placeCtgStore.items = res
})

interface Props {
  seq?: number
}

const props = defineProps<Props>()
const cIsUpdate = computed(() => (props.seq ? true : false))
const cText = computed(() => (cIsUpdate.value ? '수정' : '등록'))

const store = ref({} as StoreEntity)
if (props.seq) {
  store.value = _.cloneDeep(storeStore.items.find((item) => item.seq == props.seq)) as StoreEntity
}

const rules = {
  ctgSeq: {
    required: helpers.withMessage('카테고리를 선택해주세요.', required),
  },
  name: {
    required: helpers.withMessage('이름을 입력해주세요.', required),
  },
} as ValidationArgs
const v$ = useVuelidate(rules, store)

async function onSave() {
  if ((await v$.value.$validate()) == false) {
    Swal.fireCustom({ toast: true, title: v$.value.$silentErrors[0].$message, icon: 'warning' })
    return
  }
  if (cIsUpdate.value) {
    await apiStore.update(store.value)
    Swal.fireCustom({ toast: true, messageType: 'update' })
  } else {
    await apiStore.create(store.value)
    Swal.fireCustom({ toast: true, messageType: 'save' })
  }
  storeStore.items = await apiStore.selectList()

  router.back()
}

function onAddPlaceCtg() {
  router.push('/placeCtgEdit')
}

function onEditPlaceCtg(seq: number) {
  router.push({ path: `/placeCtgEdit/${seq}` })
}

async function onRemove() {
  if (await Swal.fireCustom({ isConfirm: true, messageType: 'remove' })) {
    await apiStore.remove(props.seq!)
    storeStore.items = await apiStore.selectList()

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
      <section class="top">{{ `매장 ${cText}` }}</section>
      <section class="content">
        <div class="row">
          <span class="label required">카테고리</span>
          <v-select :items="storeStore.categories" item-title="name" item-value="seq" v-model="store.ctgSeq" density="comfortable"> </v-select>
        </div>
        <div class="row">
          <span class="label required">매장명</span>
          <input class="val" type="text" v-model="store.name" />
        </div>
        <div class="row">
          <span class="label">구역</span>
          <div class="val" style="display: flex; justify-content: center; align-items: center; height: 56px">
            <v-select :items="placeCtgStore.items" item-value="seq" item-title="name" v-model="store.placeCtgSeq" density="comfortable">
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:append>
                    <button @click="onEditPlaceCtg(item.raw.seq)">
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
          <v-textarea class="val" v-model="store.cmt" rows="1" auto-grow bg-color="#fff" variant="outlined" style="height: fit-content"></v-textarea>
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
