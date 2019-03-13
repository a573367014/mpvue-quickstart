import {
    onAndSyncApis,
    noPromiseApis,
    otherApis,
    initPxTransform
} from '../core/native-apis';

function processApis (taro) {
    const weApis = Object.assign({ }, onAndSyncApis, noPromiseApis, otherApis);
    Object.keys(weApis).forEach(key => {
        if (!(key in tt)) {
            taro[key] = () => {
                console.warn(`头条小程序暂不支持 ${key}`);
            };
            return;
        }
        if (!onAndSyncApis[key] && !noPromiseApis[key]) {
            taro[key] = (options, ...args) => {
                options = options || {};
                let task = null;
                let obj = Object.assign({}, options);
                if (typeof options === 'string') {
                    if (args.length) {
                        return tt[key](options, ...args);
                    }
                    return tt[key](options);
                }
                const p = new Promise((resolve, reject) => {
                    ['fail', 'success', 'complete'].forEach((k) => {
                        obj[k] = (res) => {
                            options[k] && options[k](res);
                            if (k === 'success') {
                                if (key === 'connectSocket') {
                                    resolve(
                                        Promise.resolve().then(() => Object.assign(task, res))
                                    );
                                } else {
                                    resolve(res);
                                }
                            } else if (k === 'fail') {
                                reject(res);
                            }
                        };
                    });
                    if (args.length) {
                        task = tt[key](obj, ...args);
                    } else {
                        task = tt[key](obj);
                    }
                });
                if (key === 'uploadFile' || key === 'downloadFile') {
                    p.progress = cb => {
                        if (task) {
                            task.onProgressUpdate(cb);
                        }
                        return p;
                    };
                    p.abort = cb => {
                        cb && cb();
                        if (task) {
                            task.abort();
                        }
                        return p;
                    };
                }
                return p;
            };
        } else {
            taro[key] = (...args) => {
                const argsLen = args.length;
                const newArgs = args.concat();
                const lastArg = newArgs[argsLen - 1];
                if (lastArg && lastArg.isTaroComponent && lastArg.$scope) {
                    newArgs.splice(argsLen - 1, 1, lastArg.$scope);
                }
                return tt[key].apply(tt, newArgs);
            };
        }
    });
}

function pxTransform (size) {
    const { designWidth, deviceRatio } = this.config;
    if (!(designWidth in deviceRatio)) {
        throw new Error(`deviceRatio 配置中不存在 ${designWidth} 的设置！`);
    }
    return parseInt(size, 10) / deviceRatio[designWidth] + 'rpx';
}

export default function initNativeApi (taro) {
    processApis(taro);
    taro.getCurrentPages = getCurrentPages;
    taro.getApp = getApp;
    taro.initPxTransform = initPxTransform.bind(taro);
    taro.pxTransform = pxTransform.bind(taro);
}
