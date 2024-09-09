import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import router from './router.ts'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus).use(router)
app.mount('#app')