export default {
    set (key, value) {
        mpvue.setStorageSync(key, value);
    },
    get (key) {
        return mpvue.getStorageSync(key);
    },
    getInfo () {
        return mpvue.getStorageInfoSync();
    },
    remove (key) {
        mpvue.removeStorageSync(key);
    },
    clear () {
        mpvue.clearStorageSync();
    }
}
;
