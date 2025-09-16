<script setup lang="ts">
import { RouterView } from 'vue-router'

// 설정 값 조회
const settingStore = useSettingStore()
const apiSetting = useApiSetting()
apiSetting.select().then((res) => {
    settingStore.setting = res
})
</script>

<template>
    <main>
        <RouterView> </RouterView>
    </main>
</template>

<style scoped></style>
