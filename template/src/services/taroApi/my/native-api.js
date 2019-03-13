import {
    onAndSyncApis,
    noPromiseApis,
    otherApis,
    initPxTransform
} from '../core/native-apis';

const apiDiff = {
    showActionSheet: {
        options: {
            change: [{
                old: 'itemList',
                new: 'items'
            }]
        }
    },
    showToast: {
        options: {
            change: [{
                old: 'title',
                new: 'content'
            }, {
                old: 'icon',
                new: 'type'
            }]
        }
    },
    showLoading: {
        options: {
            change: [{
                old: 'title',
                new: 'content'
            }]
        }
    },
    setNavigationBarTitle: {
        alias: 'setNavigationBar'
    },
    setNavigationBarColor: {
        alias: 'setNavigationBar'
    },
    saveImageToPhotosAlbum: {
        alias: 'saveImage',
        options: {
            change: [{
                old: 'filePath',
                new: 'url'
            }]
        }
    },
    previewImage: {
        options: {
            set: [{
                key: 'current',
                value (options) {
                    return options.urls.indexOf(options.current || options.urls[0]);
                }
            }]
        }
    },
    getFileInfo: {
        options: {
            change: [{
                old: 'filePath',
                new: 'apFilePath'
            }]
        }
    },
    getSavedFileInfo: {
        options: {
            change: [{
                old: 'filePath',
                new: 'apFilePath'
            }]
        }
    },
    removeSavedFile: {
        options: {
            change: [{
                old: 'filePath',
                new: 'apFilePath'
            }]
        }
    },
    saveFile: {
        options: {
            change: [{
                old: 'tempFilePath',
                new: 'apFilePath'
            }]
        }
    },
    openLocation: {
        options: {
            set: [{
                key: 'latitude',
                value (options) {
                    return String(options.latitude);
                }
            }, {
                key: 'longitude',
                value (options) {
                    return String(options.longitude);
                }
            }]
        }
    },
    uploadFile: {
        options: {
            change: [{
                old: 'name',
                new: 'fileName'
            }]
        }
    },
    getClipboardData: {
        alias: 'getClipboard'
    },
    setClipboardData: {
        alias: 'setClipboard',
        options: {
            change: [{
                old: 'data',
                new: 'text'
            }]
        }
    },
    makePhoneCall: {
        options: {
            change: [{
                old: 'phoneNumber',
                new: 'number'
            }]
        }
    },
    scanCode: {
        alias: 'scan',
        options: {
            change: [{
                old: 'onlyFromCamera',
                new: 'hideAlbum'
            }],
            set: [{
                key: 'type',
                value (options) {
                    return (options.scanType && options.scanType[0].slice(0, -4)) || 'qr';
                }
            }]
        }
    },
    setScreenBrightness: {
        options: {
            change: [{
                old: 'value',
                new: 'brightness'
            }]
        }
    },
    request: {
        options: {
            change: [{
                old: 'headers',
                new: 'header'
            }]
        }
    }
};

function processApis (taro) {
    const weApis = Object.assign({ }, onAndSyncApis, noPromiseApis, otherApis);
    Object.keys(weApis).forEach(key => {
        if (!onAndSyncApis[key] && !noPromiseApis[key]) {
            taro[key] = (options, ...args) => {
                const result = generateSpecialApis(key, options || {});
                const newKey = result.api;
                options = result.options;
                let task = null;
                let obj = Object.assign({}, options);
                if (!(newKey in my)) {
                    console.warn(`支付宝小程序暂不支持 ${newKey}`);
                    return;
                }
                if (typeof options === 'string') {
                    if (args.length) {
                        return my[newKey](options, ...args);
                    }
                    return my[newKey](options);
                }

                // 异步返回值兼容
                const p = new Promise((resolve, reject) => {
                    ['fail', 'success', 'complete'].forEach((k) => {
                        obj[k] = (res) => {
                            if (k === 'success') {
                                if (newKey === 'saveFile') {
                                    res.savedFilePath = res.apFilePath;
                                } else if (newKey === 'downloadFile') {
                                    res.tempFilePath = res.apFilePath;
                                } else if (newKey === 'chooseImage') {
                                    res.tempFilePaths = res.apFilePaths;
                                } else if (newKey === 'getClipboard') {
                                    res.data = res.text;
                                } else if (newKey === 'scan') {
                                    res.result = res.code;
                                }
                            }
                            options[k] && options[k](res);
                            if (k === 'success') {
                                resolve(res);
                            } else if (k === 'fail') {
                                reject(res);
                            }
                        };
                    });
                    if (args.length) {
                        task = my[newKey](obj, ...args);
                    } else {
                        task = my[newKey](obj);
                    }
                });

                if (key === 'uploadFile' || key === 'downloadFile' || key === 'request') {
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
                if (!(key in my)) {
                    console.warn(`支付宝小程序暂不支持 ${key}`);
                    return;
                }
                if (key === 'getStorageSync') {
                    const arg1 = args[0];
                    if (arg1 != null) {
                        return my[key]({ key: arg1 }).data || my[key]({ key: arg1 }).APDataStorage || '';
                    }
                    return console.log('getStorageSync 传入参数错误');
                }
                if (key === 'setStorageSync') {
                    const arg1 = args[0];
                    const arg2 = args[1];
                    if (arg1 != null) {
                        return my[key]({
                            key: arg1,
                            data: arg2
                        });
                    }
                    return console.log('setStorageSync 传入参数错误');
                }
                if (key === 'removeStorageSync') {
                    const arg1 = args[0];
                    if (arg1 != null) {
                        return my[key]({ key: arg1 });
                    }
                    return console.log('removeStorageSync 传入参数错误');
                }
                if (key === 'createSelectorQuery') {
                    const query = my[key]();
                    query.in = function () { return query; };
                    return query;
                }
                const argsLen = args.length;
                const newArgs = args.concat();
                const lastArg = newArgs[argsLen - 1];
                if (lastArg && lastArg.isTaroComponent && lastArg.$scope) {
                    newArgs.splice(argsLen - 1, 1, lastArg.$scope);
                }
                return my[key].apply(my, newArgs);
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

function generateSpecialApis (api, options) {
    let apiAlias = api;
    if (api === 'showModal') {
        options.cancelButtonText = options.cancelText;
        options.confirmButtonText = options.confirmText || '确定';
        apiAlias = 'confirm';
        if (options.showCancel === false) {
            options.buttonText = options.confirmText || '确定';
            apiAlias = 'alert';
        }
    } else {
        Object.keys(apiDiff).forEach(item => {
            const apiItem = apiDiff[item];
            if (api === item) {
                if (apiItem.alias) {
                    apiAlias = apiItem.alias;
                }
                if (apiItem.options) {
                    const change = apiItem.options.change;
                    const set = apiItem.options.set;
                    if (change) {
                        change.forEach(changeItem => {
                            options[changeItem.new] = options[changeItem.old];
                        });
                    }
                    if (set) {
                        set.forEach(setItem => {
                            options[setItem.key] = typeof setItem.value === 'function' ? setItem.value(options) : setItem.value;
                        });
                    }
                }
            }
        });
    }

    return {
        api: apiAlias,
        options
    };
}

export default function initNativeApi (taro) {
    processApis(taro);
    taro.getCurrentPages = getCurrentPages;
    taro.getApp = getApp;
    taro.initPxTransform = initPxTransform.bind(taro);
    taro.pxTransform = pxTransform.bind(taro);
}