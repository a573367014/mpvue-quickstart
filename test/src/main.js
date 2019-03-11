import './assets/style/index.less';
import Vue from 'vue';
import App from './App';
import sensors from '@/services/sensors/sensorsdata';
import store from '@/vuex/store';
// 小程序不支持cookie、引入插件支持
import 'weapp-cookie';

import Icon from './components/icon.vue';

Vue.component('MyIcon', Icon);
Vue.config.productionTip = false;
App.mpType = 'app';

const app = new Vue({
    store,
    ...App
});
// 初始化神策埋点
sensors.init();
app.$mount();
