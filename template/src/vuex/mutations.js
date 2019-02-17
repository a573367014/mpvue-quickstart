import storage from '@/utils/storage';

export default {
    'set/userInfo' (state, payload) {
        state.userInfo = !payload || Object.assign({}, state.userInfo, payload);
        storage.set('userInfo', state.userInfo);
    }
};
