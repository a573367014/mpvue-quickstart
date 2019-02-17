const app = getApp();
// 个人中心
const curPage = 'share_page';

// 神策埋点相关方法
export default {
    data () {
        return {
            [curPage]: {}
        };
    },
    methods: {
        // 访问页面、通常是最先触发的事件
        trackVisit () {
            // 保证是在当前页埋点第一个触发
            // 把透传缓存到当前页面data
            this[curPage] = app.sensors.cacheProperties;
            const data = {
                sc_page: curPage,
                op_but: 'choose_card',
                ...this[curPage]
            };
            this.sensorsTrack('visit', data);
        },
        trackClick (payload) {
            const data = {
                sc_page: curPage,
                ...this[curPage],
                ...payload
            };
            this.sensorsTrack('click', data);
        }
    }
};
