<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'

interface Item {
    id: number
    name: string
    price: number
    count: number
}

const items = ref<Item[]>([
    { id: 1, name: '김치찌개', price: 8000, count: 1 },
    { id: 2, name: '된장찌개', price: 7000, count: 2 },
    { id: 3, name: '비빔밥', price: 9000, count: 1 },
    { id: 4, name: '불고기', price: 15000, count: 1 },
    { id: 5, name: '냉면', price: 10000, count: 1 },
])

const totalAmount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.count, 0)
})

function increaseCount(item: Item) {
    item.count++
}

function decreaseCount(item: Item) {
    if (item.count > 1) {
        item.count--
    }
}

function removeItem(index: number) {
    items.value.splice(index, 1)
}
</script>

<template>
    <div class="draggable-view">
        <h2 class="title">Vue Draggable Next 예제</h2>

        <div class="container">
            <VueDraggableNext v-model="items" tag="ul" class="item-list" handle=".drag-handle" animation="200">
                <li v-for="(item, index) in items" :key="item.id" class="item">
                    <div class="drag-handle">
                        <font-awesome-icon :icon="['fas', 'grip-vertical']" />
                    </div>
                    <div class="content">
                        <div class="info">
                            <span class="name">{{ item.name }}</span>
                            <span class="price">{{ item.price.toLocaleString('ko-KR') }}원</span>
                        </div>
                        <div class="controls">
                            <BButton @click="decreaseCount(item)" variant="normal" class="btn-small">
                                <font-awesome-icon :icon="['fas', 'minus']" />
                            </BButton>
                            <BInput v-model="item.count" type="number" class="count-input" :active-cancel="false" />
                            <BButton @click="increaseCount(item)" variant="normal" class="btn-small">
                                <font-awesome-icon :icon="['fas', 'plus']" />
                            </BButton>
                            <BButton @click="removeItem(index)" variant="danger" class="btn-small">
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </BButton>
                        </div>
                    </div>
                    <div class="subtotal">{{ (item.price * item.count).toLocaleString('ko-KR') }}원</div>
                </li>
            </VueDraggableNext>

            <div class="total">
                <span class="label">총 금액:</span>
                <span class="amount">{{ totalAmount.toLocaleString('ko-KR') }}원</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.draggable-view {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;

    .title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
        text-align: center;
    }

    .container {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;

        .item-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;

            .item {
                background: white;
                border: 1px solid #ddd;
                border-radius: 6px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
                cursor: move;
                transition: all 0.2s;

                &:hover {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .drag-handle {
                    cursor: grab;
                    color: #999;
                    font-size: 18px;
                    padding: 5px;

                    &:active {
                        cursor: grabbing;
                    }
                }

                .content {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;

                    .info {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;

                        .name {
                            font-size: 16px;
                            font-weight: 600;
                        }

                        .price {
                            font-size: 14px;
                            color: #666;
                        }
                    }

                    .controls {
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .count-input {
                            width: 60px;

                            :deep(input) {
                                text-align: center;
                            }
                        }

                        .btn-small {
                            padding: 6px 10px;
                            min-width: 35px;
                        }
                    }
                }

                .subtotal {
                    font-size: 16px;
                    font-weight: bold;
                    color: #2563eb;
                    min-width: 100px;
                    text-align: right;
                }
            }
        }

        .total {
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 2px solid #2563eb;

            .label {
                font-size: 18px;
                font-weight: 600;
            }

            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
            }
        }
    }
}
</style>
