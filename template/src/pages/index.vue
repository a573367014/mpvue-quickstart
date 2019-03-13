<template>
    <view>
        查看例子：
        <picker-view indicator-style="height: 50px;"
                     style="width: 100%; height: 400px;"
                     :value="value"
                     @change="onChange">
            <picker-view-column>
                <view v-for="item in list"
                     :key="item"
                     style="line-height: 50px">
                    {{labelMap[item]}}“{{item}}”
                </view>
            </picker-view-column>
        </picker-view>
        <button @click="onNavigate">确定</button>
    </view>
</template>
<script>
const pages = require.context('./example', false, /\.vue$/);
const labelMap = {
    './log.vue': '日志上传',
    './login.vue': '登录',
    './qrcode.vue': '二维码生成',
    './request.vue': '请求',
    './sensors.vue': '神策埋点',
    './webview.vue': 'webview'
};
export default {
    data () {
        return {
            value: 0,
            curValue: 0,
            list: pages.keys(),
            labelMap,
            img: require('@/assets/img/1.jpg')
        };
    },
    methods: {
        onChange (e) {
            this.curValue = e.mp.detail.value[0];
        },
        onNavigate () {
            mpvue.navigateTo({
                url: '/pages/example' + this.list[this.curValue].split('.')[1]
            });
        }
    }
};
</script>
<style lang="less">
.image {
    width: 200rpx;
    height: 200rpx;
}
</style>