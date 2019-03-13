const systemInfo = mpvue.getSystemInfoSync();

/**
 * 微信异步接口转promise
 * @param {wx Function} wxfn
 * @param {Object} options
 * @return {Promise}
 */
function promiseify (wxfn, options) {
    return new Promise((resolve, reject) => {
        wxfn({
            success: resolve,
            fail: reject,
            ...options
        });
    });
}

/**
 * 生成唯一ID
 */
function guid () {
    function S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
}

function rpx2px (rpx) {
    return rpx / 750 * systemInfo.windowWidth;
}

/**
 * 效果同background-size: contain;
 * @param {Object} target    目标对象 {width, height}
 * @param {Object} wrap      容器对象 {width, height}
 * @return {Object}
 */
function backgroundContain (target, wrap) {
    const width = target.width;
    const height = target.height;
    const result = {};

    const wrapWidth = wrap.width;
    const wrapHeight = wrap.height;

    if (width / height < wrapWidth / wrap.height) {
        result.width = width / height * wrapHeight;
        result.height = wrapHeight;
    } else {
        result.height = wrapWidth / (width / height);
        result.width = wrapWidth;
    }

    return result;
}

export default {
    promiseify,
    guid,
    rpx2px,
    backgroundContain
};
