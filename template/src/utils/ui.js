export default {
    /**
     * 消息提示框
     *
     * @param {String} msg 提示信息
     */
    showToast (msg, timeout = 1500) {
        mpvue.showToast({
            title: msg,
            icon: 'none',
            duration: timeout
        });
    },

    /**
     * 隐藏消息提示框
     */
    hideToast () {
        mpvue.hideToast();
    },

    /**
     * 显示 loading 提示框
     *
     * @param {String} msg 提示信息
     */
    showLoading (msg) {
        mpvue.showLoading({
            title: msg || '加载中...',
            mask: true
        });
    },

    /**
     * 关闭 loading 提示框
     */
    hideLoading () {
        mpvue.hideLoading();
    }
};
