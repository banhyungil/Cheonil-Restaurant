import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
// import { fas } from '@fortawesome/free-solid-svg-icons'
import { fas } from '@fortawesome/pro-solid-svg-icons'
import { faStar } from '@fortawesome/pro-regular-svg-icons'
import { faSquare } from '@fortawesome/pro-regular-svg-icons'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import 'vue-select/dist/vue-select.css'
import VSelectExt from 'vue-select'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        },
    },
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: '#2aac8e',
                    success: '#5697d4',
                    warning: '#fa4a4a',
                },
            },
        },
    },
})
const app = createApp(App)

/* add icons to the library */
library.add(fas)
library.add(faSquare)
library.add(faStar)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('VueDatePicker', VueDatePicker)
app.component('VSelectExt', VSelectExt)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)
app.use(vuetify)
app.use(FloatingVue)
;(async () => {
    // 설정 값 조회
    const settingStore = useSettingStore()
    const apiSetting = useApiSetting()
    // 존재하는경우 localStorage 값 먼저 사용 후 조회하여 갱신 (mount non-block)
    if (settingStore.setting == null) settingStore.setting = await apiSetting.select()
    else apiSetting.select().then((res) => (settingStore.setting = res))
    app.mount('#app')
})()
