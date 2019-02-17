import { wxLoginModel, wxBindUserModel } from '@/models/login';
import { promiseify } from '@/utils/index';
import ui from '@/utils/ui';

export default {
    methods: {
        async _getUserInfo () {
            try {
                const { code } = await promiseify(wx.login);
                const { encryptedData, iv, userInfo } = await promiseify(wx.getUserInfo);

                return {
                    code,
                    encryptedData,
                    iv,
                    userInfo
                };
            } catch (error) {
                ui.showToast(error);
            }
        },

        async onWxLogin (e) {
            if (e.mp.detail.errMsg === 'getUserInfo:ok') {
                try {
                    const params = await this._getUserInfo();
                    await this.wxLoginAsync(params);
                } catch (e) {
                    console.error(e);
                    e.preventDefault && e.preventDefault();
                    ui.showToast('微信登录失败');
                    throw new Error('微信登录失败');
                }
            } else {
                ui.showToast('微信登录失败');
                throw new Error('微信登录失败');
            }
        },

        // 微信异步登录
        async wxLoginAsync (params) {
            let sessionRes = null;

            try {
                // 获取session id
                // 添加头像 名称更新
                sessionRes = await wxLoginModel({ type: 'miniprogram' }).add({
                    iv: params.iv,
                    encrypted_data: params.encryptedData,
                    code: params.code,
                    avatar: params.userInfo.avatarUrl,
                    nick: params.userInfo.nickName
                });

                this.$store.commit('set/userInfo', sessionRes.data);
                // return res;
            } catch (e) {
                // 未注册，走注册流程
                if (e.data && e.data.status === 500) {
                    e.preventDefault && e.preventDefault();

                    const params = await this._getUserInfo();
                    await this.wxRegisterAsync(params);
                }
                throw e;
            }
        },

        // 用户注册
        async wxRegisterAsync ({ iv, encryptedData, code, userInfo }) {
            try {
                await wxBindUserModel().add({
                    iv,
                    code,
                    encrypted_data: encryptedData,
                    gender: userInfo.gender,
                    avatar: userInfo.avatarUrl,
                    nick: userInfo.nickName
                });

                const params = await this._getUserInfo();

                // 注册完继续登录
                await this.wxLoginAsync(params);
            } catch (e) {
                e.preventDefault();
                ui.showToast('用户注册失败，请联系管理员');
                throw e;
            }
        }
    }
};
