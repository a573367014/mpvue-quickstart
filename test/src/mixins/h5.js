// webview mixin
import { Base64 } from 'js-base64';
import { mapState } from 'vuex';
import { stringifyQuery } from '@/utils';

import baseSensorsMixin from '@/mixins/base';

const app = getApp();
let i = 0;
export default {
    mixins: [baseSensorsMixin],
    data () {
        return {
            url: ''
        };
    },

    computed: {
        ...mapState(['userInfo', 'systemInfo', 'loginToken'])
    },

    methods: {
        setUrl (href, params = {}) {
            const curUserId = this.userInfo ? this.userInfo.id : '';
            // 携带参数
            this.url = href + stringifyQuery({
                _r: ++i,
                curUserId,
                isIphoneX: this.systemInfo.isIphoneX,
                token: this.loginToken,
                // 若是不用微信JSSDK，可以不用base64处理
                sensors: !app.sensors ? '' : Base64.encode(
                    JSON.stringify({
                        default: {
                            ...app.sensors.defaultProperties
                        },
                        prev: {
                            ...app.sensors.cacheProperties
                        }
                    })
                ),

                ...params
            });

            console.log(this.url);
        }
    },

    onUnload () {
        this.url = '';
    }
};
