// 端能力 API
// copy taro 1.2.7版本
// https://nervjs.github.io/taro/docs/native-api.html

let result;

if (mpvuePlatform === 'wx') {
    result = require('./wx');
}

if (mpvuePlatform === 'my') {
    result = require('./my');
}

// 端能力 API
// copy taro 1.2.7版本
// https://nervjs.github.io/taro/docs/native-api.html
global.mpvue = result;
export default result;
