export default {
    isLogin: state => {
        return state.userInfo && !!state.userInfo.id;
    }
};
