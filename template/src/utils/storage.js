export default {
    set (key, value) {
        wx.setStorageSync(key, value);
    },
    get (key) {
        return wx.getStorageSync(key);
    },
    getInfo () {
        return wx.getStorageInfoSync();
    },
    remove (key) {
        wx.removeStorageSync(key);
    },
    clear () {
        wx.clearStorageSync();
    }
}
;
