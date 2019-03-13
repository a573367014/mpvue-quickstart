<style lang="less">
.page-log {
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
<view class="page-login">
    上报的内容请查看调试工具network
    <button type="primary"
            @click="onLog">上传错误日志</button>
</view>
</template>

<script>
import axios from 'axios';
import baseMixin from '@/mixins/base';
import templateModel from '@/models/template';
import Log from '@/services/logger';
import ui from '@/utils/ui';

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
        async onLog () {
            // 上报错误日志
            try {
                throw new Error('test');
            } catch (e) {
                await Log.error(new Error('test error log'));
                ui.showToast('上传成功');
            }
        }
    }
};
</script>
