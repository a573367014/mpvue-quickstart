let sensors;

// 微信小程序
if (mpvuePlatform === 'wx') {
    sensors = require('./wx/sensorsdata');
}

// 支付宝小程序
if (mpvuePlatform === 'my') {
    sensors = require('./my/sensorsdata');
}

//  百度小程序
if (mpvuePlatform === 'swan') {
    sensors = require('./swan/sensorsdata');
}

export default sensors;
