import { mapState } from 'vuex';
import { guid } from '@/utils';
import { SENSOR_PROJECT, MINIPROGRAM_VERSION } from '@/config';
import sensors from '@/services/sensors/sensorsdata';
import Log from '@/services/logger';

let info;
let app;
let bigVersion;
let subVersion;

// 平台判断
info = mpvue.getSystemInfoSync();
app = getApp();

// 版本号
bigVersion = MINIPROGRAM_VERSION.split('.')[0];
subVersion = MINIPROGRAM_VERSION.replace(/^\d\./, '');

app.sensors = sensors;
// 默认字段
app.sensors.defaultProperties = {
    // 软件版本
    ver_id: bigVersion,
    // 软件子版本
    ver_sub_id: subVersion,
    // 设备厂商
    dev_man: info.brand,
    // 设备型号
    dev_model: info.model,
    // 分辨率
    dev_res: info.pixelRatio * info.windowWidth + '*' + info.pixelRatio * info.windowHeight,
    // 平台
    dev_domain: 'miniprogram',
    // 平台版本
    dev_domain_ver: info.system + ':' + info.version,
    // 微信基础库版本
    sdk_ver: info.SDKVersion,
    // 微信版本
    wechat_ver: info.version,
    project: SENSOR_PROJECT,
    type: 'track',
    // 会话ID
    sou_ses: guid(),
    // 区分小程序标识，由产品提供
    pm_name: 'test'
};
app.sensors.registerApp(app.sensors.defaultProperties);
// 缓存上一个页面的埋点信息（透传相关）
app.sensors.cacheProperties = {};

export default {
    computed: {
        ...mapState(['userInfo'])
    },
    watch: {
        userInfo: {
            handler (v) {
                // 神策跟踪已登录的用户ID
                v && v.id && sensors.login(v.id + '');
            },
            immediate: true
        }
    },
    methods: {
        _setCacheProperties (payload) {
            Object.assign(app.sensors.cacheProperties, payload);
        },
        // 发送事件
        sensorsTrack (event, payload) {
            try {
                let result = {};

                // 过滤无效值
                for (let k in payload) {
                    let regExp = /^ext\d+/g;
                    if (payload[k] !== '' && payload[k] !== undefined && payload[k] !== null) result[k] = payload[k];
                    // 强制转字符串形式
                    if ((k === 'obj_id' || regExp.test(k)) && (result[k] || result[k] === 0)) {
                        result[k] += '';
                    }
                }

                // 缓存直至下一个页面visit之前被获取
                this._setCacheProperties({
                    // 来源页面
                    sou_page: result.sc_page
                });

                // 只有点击的透传有效
                if (event === 'click') {
                    this._setCacheProperties({
                        // 来源操作
                        sou_but: result.op_but,
                        // 来源资源位
                        sou_mod: result.sc_mod || app.sensors.cacheProperties.sou_mod,
                        // 来源位置
                        sou_pos: result.sc_pos || app.sensors.cacheProperties.sou_pos
                    });
                }

                app.sensors.track(event, result);
            } catch (e) {
                Log.error('base.js sensorsTrack', e);
                console.error(e);
            }
        },
        // 接收webview 发送的埋点来源数据
        receiveWebviewSensors (query) {
            try {
                if (!query || !query.sensors) return;
                let sensors = {};
                sensors = JSON.parse(decodeURIComponent(query.sensors));
                this._setCacheProperties(sensors);
            } catch (e) {
                Log.error('base.js receiveWebviewSensors', e);
                console.error(e);
            }
        }
    }
    // onShareAppMessage () {
    //     return {
    //         title: 'test',
    //         path: '/pages/index'
    //     };
    // }
};
