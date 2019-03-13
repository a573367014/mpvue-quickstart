<script>
import './assets/style/index.less';
import '@/services/taroApi';
import Vue from 'vue';
import sensors from '@/services/sensors/sensorsdata';
import Icon from './components/icon.vue';

Vue.component('MyIcon', Icon);

export default {
    onLaunch (e) {
        try {
            // 初始化神策埋点
            sensors.init();
            // 挂在global
            this.sensors = sensors;
        } catch (e) {
            console.error(e);
        }
    },

    onError (e) {
        console.error(e, '-onError-');
    }
};
</script>