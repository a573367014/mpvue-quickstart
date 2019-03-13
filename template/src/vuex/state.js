const info = mpvue.getSystemInfoSync();
const state = {
    userInfo: {},
    loginToken: '',

    systemInfo: {
        // 是否支持单页的自定义头部
        isWeappCustomHeader: info.version >= '7',

        isIphoneX: info.model.toLowerCase().indexOf('iphone x') !== -1,
        isAndroid: info.system.indexOf('Android') !== -1,
        isDevTools: info.platform === 'devtools'
    }
};

export default state;
