import { version } from '../../package.json';

// 小程序版本号
const MINIPROGRAM_VERSION = version;

let DEBUG = false;
// 接口
let API_URL = 'https://ephoto.gaoding.com/';
// 嵌套H5
let WEBVIEW_URL = 'https://ephoto.gaoding.com/';

// 神策埋点项目名称
let SENSOR_PROJECT = 'xcx_poster';
// 神策埋点
let SENSOR_URL = `https://sensor-data.gaoding.com?project=${SENSOR_PROJECT}`;

if (process.env.NODE_ENV === 'development') {
    API_URL = 'https://ephoto-stage.gaoding.com/';
    WEBVIEW_URL = 'https://ephoto-stage.gaoding.com/';

    SENSOR_PROJECT = 'xcx_poster_dev';
    SENSOR_URL = `https://sensor-data.gaoding.com/debug?project=${SENSOR_PROJECT}`;
    DEBUG = true;
}

export {
    WEBVIEW_URL,
    SENSOR_URL,
    SENSOR_PROJECT,
    API_URL,
    MINIPROGRAM_VERSION,
    DEBUG
};
