<style lang="less">
.page-login {
    .login__text {
        font-size: 36rpx;
        color: #000;
        text-align: center;
        padding: 36rpx 0 68rpx;
    }
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
    <div class="login__text">登录后即可继续操作</div>
    <button type="primary"
            open-type="getUserInfo"
            @getuserinfo="onLogin">微信登录</button>
</view>

</template>

<script>
import loginMixin from '@/mixins/login';
import ui from '@/utils/ui';

export default {
    mixins: [loginMixin],
    data () {
        return {
        };
    },
    methods: {
        async onLogin (e) {
            ui.showLoading();
            try {
                await this.onWxLogin(e);
                ui.showToast('登录成功');
            } catch (e) {
                console.error(e);
            }
            ui.hideLoading();
        }
    }
};
</script>
