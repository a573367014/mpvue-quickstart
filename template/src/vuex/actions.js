import { storage } from '@/utils';

export default {
    // 清理登录缓存
    clearLogin ({ commit }) {
        commit('set/userInfo', null);
        storage.remove('userInfo');
    }
};
