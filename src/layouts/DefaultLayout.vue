<script setup lang="ts">
import { KeepAlive } from 'vue'
</script>

<template>
    <div class="default-layout grid">
        <main class="h-full px-5 py-7">
            <KeepAlive>
                <RouterView></RouterView>
            </KeepAlive>
        </main>
        <div class="btt-bar border-primary grid items-center border-2">
            <RouterLink class="item" to="/order">주문</RouterLink>
            <RouterLink class="item" to="/orderState">주문현황</RouterLink>
            <RouterLink class="item link" to="/account" v-tooltip.top="'관리자 화면'">
                <font-awesome-icon :icon="['fas', 'user']" />
            </RouterLink>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.default-layout {
    grid-template-rows: calc(100vh - 60px) 60px;

    .btt-bar {
        grid-template-columns: 1fr 1fr 100px;
        .item {
            @apply flex-center;
        }
    }
}
</style>
<!-- <style lang="scss" scoped>
.default-layout .btt-bar .item {
    @apply flex-center;
}
</style> -->
