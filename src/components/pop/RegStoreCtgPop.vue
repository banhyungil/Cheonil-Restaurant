<script setup lang="ts">
import type { StoreCategoryEntity } from '@/@types/Database'
import type { StoreCategoryEntityC } from '@/@types/cheonil'
import useToast from '@/composable/useToast'
import { ref, type Ref } from 'vue'

const Toast = useToast()
interface Props {
  categories: StoreCategoryEntity[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'save', storeCtg: StoreCategoryEntityC): void
  (e: 'cancel'): void
}>()

const storeCtg = ref({} as StoreCategoryEntityC)

const inp = ref() as Ref<HTMLInputElement>
function onSave() {
  if (props.categories.some((ctg) => ctg.name == storeCtg.value.name)) {
    Toast.fire({ title: '중복된 카테고리가 존재합니다.', icon: 'warning' })

    inp.value.focus()
  } else {
    emit('save', storeCtg.value)
  }
}
</script>
<template>
  <div v-if="storeCtg" class="reg-pop">
    <div class="top">매장등록</div>
    <div class="content">
      <div class="row">
        <span>카테고리 명</span>
        <input ref="inp" type="text" v-model="storeCtg.name" />
      </div>
    </div>
    <div class="btt">
      <button @click="onSave">저장</button>
      <button @click="$emit('cancel')">취소</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reg-pop {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-rows: 34px 1fr 44px;
  width: 300px;
  color: #5f5f5f;
  background-color: #fff;
  padding: 10px 14px;

  .top {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid grey;
  }

  .content {
    .row {
      display: flex;
      align-items: center;
      margin: 30px 0;

      input {
        border: 1px solid #5f5f5f;
        padding: 10px 0;
        color: #000;

        &:focus {
          outline: 1.2px solid #5f5f5f;
        }
      }
      span {
        width: 100px;
      }
    }
  }

  .btt {
    display: flex;
    align-items: center;
    justify-content: end;
    border-top: 1px solid grey;
    height: 100%;

    button {
      width: 60px;
      height: 34px;
      color: #fff;
      background-color: #3fb499;
      border: none;
      margin: 0 4px;
    }
  }
}
</style>
