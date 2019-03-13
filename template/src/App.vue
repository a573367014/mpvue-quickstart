<script>
import './assets/style/index.less';
import Vue from 'vue';
import sensors from '@/services/sensors/sensorsdata';
import Icon from './components/icon.vue';
import '@/services/taroApi';

Vue.component('MyIcon', Icon);
export default {
    onLaunch (e) {
        // 初始化神策埋点
        sensors.init();
    },

    onError (e) {
        console.error(e, '-onError-');
    }
};
</script>