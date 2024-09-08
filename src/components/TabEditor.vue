<script setup lang="ts" generic="T extends Record<string, any>, S extends Record<string, any>">
import { ref, watch } from 'vue'

// generic 타입 K extends keyof T 가 정상 작동하지 않음... 그래서 string으로 대체
// assertion
// * item관련 key 값이 있는지 items 가 변경될 때 마다 체크해줘야함
interface Props {
    categories: S[]
    ctgKey?: string
    items: T[]
    itemKey: string
    isEdit?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    ctgKey: 'name',
})

watch(
    () => props.items.length,
    () => {
        if (props.items.length == 0) return
        // key값이 item에 있는지 검사
        const keys = [props.itemKey]
        if (props.items.every((item) => keys.every((key) => key in item)) == false) {
            throw new Error('Check the keys of Props!')
        }
    },
    { immediate: true }
)

watch(
    () => props.categories.length,
    () => {
        if (props.categories.length == 0) return
        // key값이 item에 있는지 검사
        const keys = [props.ctgKey]
        if (props.categories.every((ctg) => keys.every((key) => key in ctg)) == false) {
            throw new Error('Check the keys of Props!')
        }
    },
    { immediate: true }
)

// default key가 없는 경우는 종료해줘야함
const emit = defineEmits<{
    (e: 'select', item: T): void
    (e: 'selectCategory', category: S | 'all' | null): void
    (e: 'addItem'): void
    (e: 'addCategory'): void
}>()

function onAddCategory() {
    emit('addCategory')
}
function onAddItem() {
    emit('addItem')
}

function onClickItem(item: T) {
    emit('select', item)
}

const selCtg = ref<string | null>()
function onClickCategory(ctg: S | 'all' | null) {
    selCtg.value = ctg == null || ctg == 'all' ? ctg : ctg[props.ctgKey]
    emit('selectCategory', ctg)
}
</script>
<template>
    <div class="comp-tab-editor">
        <ul class="ctgs">
            <!-- 카테고리 목록 표시 -->
            <button @click="onClickCategory('all')" class="item" :class="{ on: selCtg == 'all' }">
                <span>{{ '전체' }}</span>
            </button>
            <button
                v-for="ctg in categories"
                :key="ctg[ctgKey]"
                :category="ctg"
                @click="onClickCategory(ctg)"
                class="item"
                :class="{ on: selCtg == ctg[ctgKey] }"
            >
                <span>{{ ctg[ctgKey] ?? '' }}</span>
            </button>
            <button @click="onClickCategory(null)" class="item" :class="{ on: selCtg == null }">
                <span>{{ '미지정' }}</span>
            </button>
            <button class="itemd" v-if="isEdit" @click="onAddCategory">
                <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
        </ul>
        <section class="grid">
            <!-- 메뉴 목록 표시 -->
            <slot name="item" v-for="item in items" :key="item[itemKey]" :item="item" :isEdit="isEdit">
                <button @click="onClickItem(item)">{{ item['name'] ?? '' }}</button>
            </slot>
            <button class="item add" v-if="isEdit" @click="onAddItem">
                <font-awesome-icon :icon="['fas', 'plus']" />
            </button>
        </section>
    </div>
</template>

<!-- 스타일 변경 확장성은 scoped를 해제해서 확보
scoped 해제 시에는 최대한 고유한 namespace를 지정하는 것이 필요
-->
<style lang="scss">
.comp-tab-editor {
    .ctgs {
        display: flex;
        align-items: center;
        // default class
        button {
            width: 100px;
            height: 40px;
            background-color: grey;

            &.on {
                color: #fff;
                background-color: #2aac8e;
            }
            &.add {
                height: 40px;
            }
        }
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(1fr, 5);
        width: 100%;
        background-color: blue;

        background-color: grey;
        button.item {
            width: 40px;
            height: 40px;
            background-color: grey;

            &.add {
                width: 30px;
                height: 30px;
            }
        }
    }
}
</style>
