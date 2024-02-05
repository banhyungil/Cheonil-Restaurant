<script setup lang="ts">
import type { StoreCategoryEntity } from '@/@types/Database'
import type { StoreC } from '@/@types/cheonil'
import { computed, ref, watch } from 'vue'

interface Props {
  categories: StoreCategoryEntity[]
  initStore?: Partial<StoreC>
}
const props = defineProps<Props>()
defineEmits<{
  (e: 'save', store: StoreC): void
  (e: 'cancel'): void
}>()

const store = ref({ ...props.initStore } as StoreC)
store.value.category = store.value.category ?? null
</script>
<template>
  <div v-if="store" class="reg-pop">
    <div class="top">매장등록</div>
    {{ store.category }}
    <div class="content">
      <div class="row">
        <span>카테고리</span>
        <select v-model="store.category">
          <option :value="null">전체</option>
          <option v-for="ctg in categories" :key="ctg.name" :value="ctg">{{ ctg.name }}</option>
        </select>
      </div>
      <div class="row">
        <span>매장명</span>
        <input type="text" v-model="store.name" />
      </div>
      <div class="row">
        <span>비고</span>
        <input type="text" v-model="store.cmt" />
      </div>
    </div>
    <div class="btt">
      <button @click="$emit('save', store)">저장</button>
      <button @click="$emit('cancel')">취소</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.reg-pop {
  display: grid;
  grid-template-rows: 34px 1fr 44px;
  width: 300px;
  color: #333333;
  border: 1px solid #000;
  border-radius: 10px;

  background-color: rgb(170, 169, 169);
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

      select {
        min-width: 100px;
        padding: 6px 0;

        option {
          padding: 6px 0;
        }
      }

      input {
        border: 1px solid #5f5f5f;
        padding: 6px 3px;
        color: #5f5f5f;

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
