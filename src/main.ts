import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
// import { fas } from '@fortawesome/free-solid-svg-icons'
import { fas } from '@fortawesome/pro-solid-svg-icons'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})
const app = createApp(App)

/* add icons to the library */
library.add(fas)
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(FloatingVue)

app.mount('#app')
