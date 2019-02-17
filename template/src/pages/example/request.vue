<style lang="less">
.page-request {
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
<view class="page-request">
    <button type="primary"
            @click="onRequest">请求数据</button>
</view>
</template>

<script>
import axios from 'axios';
import baseMixin from '@/mixins/base';
import templateModel from '@/models/template';

export default {
    mixins: [baseMixin],
    data () {
        return {
            pagination: {
                num: 1,
                size: 100,
                total: 0,
                over: false
            },
            // 模板数据
            sliderData: []
        };
    },
    methods: {
        async loadTemplets () {
            const { num, size } = this.pagination;

            let params = templateModel.static;
            Object.assign(params, {
                page_num: num,
                page_size: size
            });

            params = Object.assign({}, templateModel.static, {
                id: 103
            });

            let cancel = null;
            const { data, pagination } = await templateModel().selectPage(params, {
                cancelToken: new axios.CancelToken(c => cancel = c)
            });
            cancel();

            Object.assign(this.pagination, {
                ...pagination,
                num: pagination.num + 1,
                over: data.length < pagination.size
            });

            this.sliderData = data;
        },
        async onRequest () {
            this.loadTemplets().catch(console.error);
        }
    }
};
</script>
