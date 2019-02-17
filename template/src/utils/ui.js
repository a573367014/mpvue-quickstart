export default {
    /**
     * 消息提示框
     *
     * @param {String} msg 提示信息
     */
    showToast (msg, timeout = 1500) {
        wx.showToast({
            title: msg,
            icon: 'none',
            duration: timeout
        });
    },

    /**
     * 隐藏消息提示框
     */
    hideToast () {
        wx.hideToast();
    },

    /**
     * 显示 loading 提示框
     *
     * @param {String} msg 提示信息
     */
    showLoading (msg) {
        wx.showLoading({
            title: msg || '加载中...',
            mask: true
        });
    },

    /**
     * 关闭 loading 提示框
     */
    hideLoading () {
        wx.hideLoading();
    }
};
