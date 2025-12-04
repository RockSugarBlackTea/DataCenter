import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入路由表
import router from './router';
// 导入存储库
import store from './store/index';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App);

app.use(router);
app.use(store);
app.use(ElementPlus);

app.mount('#app');