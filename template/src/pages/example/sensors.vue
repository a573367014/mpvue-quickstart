<style lang="less">
.page-sensors {
    button {
        width: 600rpx;
        line-height: 88rpx;
        height: 88rpx;
        font-size: 32rpx;
        background: #1BAE19;
    }
}
</style>

<template>

<view class="page-sensors">
    控制台查看埋点信息
    <button type="primary"
            @click="onClickButton">点我</button>
</view>

</template>

<script>
import baseMixin from '@/mixins/base';
import indexMixin from '@/mixins/sensors/index';

export default {
    mixins: [baseMixin, indexMixin],
    data () {
        return {
        };
    },
    methods: {
        onClickButton () {
            this.trackClick();
        }
    },
    onLoad (query) {
        // 获取来源页为H5的埋点信息
        this.receiveWebviewSensors(query);

        // 访问埋点、保证优先触发
        this.trackVisit();
    }
};
</script>
