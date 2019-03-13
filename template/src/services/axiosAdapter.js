import utils from 'axios/lib/utils';
import settle from 'axios/lib/core/settle';
import buildURL from 'axios/lib/helpers/buildURL';
import createError from 'axios/lib/core/createError';

let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
// encoder
function encoder (input) {
    let str = String(input);
    // initialize result and counter
    let block;
    let charCode;
    let idx = 0;
    let map = chars;
    let output = '';
    for (;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
        str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
    }
    return output;
}

let platFormName = 'wechat';
/**
 * 获取各个平台的请求函数
 */
function getRequest () {
    switch (true) {
    case typeof wx === 'object':
        platFormName = 'wechat';
        return mpvue.request.bind(wx);
    case typeof swan === 'object':
        platFormName = 'baidu';
        return swan.request.bind(swan);
    case typeof my === 'object':
        platFormName = 'alipay';
        return my.httpRequest.bind(my);
    default:
        return mpvue.request.bind(wx);
    }
}
/**
 * 处理各平台返回的响应数据，抹平差异
 * @param mpResponse
 * @param config axios处理过的请求配置对象
 * @param request 小程序的调用发起请求时，传递给小程序api的实际配置
 */
function transformResponse (mpResponse, config, mpRequestOption) {
    let headers = mpResponse.header || mpResponse.headers;
    let status = mpResponse.statusCode || mpResponse.status;
    let statusText = '';
    if (status === 200) {
        statusText = 'OK';
    } else if (status === 400) {
        statusText = 'Bad Request';
    }
    let response = {
        data: mpResponse.data,
        status: status,
        statusText: statusText,
        headers: headers,
        config: config,
        request: mpRequestOption
    };
    return response;
}
/**
 * 处理各平台返回的错误信息，抹平差异
 * @param error 小程序api返回的错误对象
 * @param reject 上层的promise reject 函数
 * @param config
 */
function transformError (error, reject, config) {
    switch (platFormName) {
    case 'wechat':
        if (error.errMsg.indexOf('request:fail abort') !== -1) {
            // Handle request cancellation (as opposed to a manual cancellation)
            reject(createError('Request aborted', config, 'ECONNABORTED', ''));
        } else if (error.errMsg.indexOf('timeout') !== -1) {
            // timeout
            reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', ''));
        } else {
            // NetWordError
            reject(createError('Network Error', config, null, ''));
        }
        break;
    case 'alipay':
        // https://docs.alipay.com/mini/api/network
        if ([14, 19].includes(error.error)) {
            reject(createError('Request aborted', config, 'ECONNABORTED', ''));
        } else if ([13].includes(error.error)) {
            // timeout
            reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', ''));
        } else {
            // NetWordError
            reject(createError('Network Error', config, null, ''));
        }
        break;
    case 'baidu':
        // TODO error.errCode
        reject(createError('Network Error', config, null, ''));
        break;
    }
}

let warn = console.warn;
function mpAdapter (config) {
    let request = getRequest();
    return new Promise(function (resolve, reject) {
        let requestTask;
        let requestData = config.data;
        let requestHeaders = config.headers;
        // baidu miniprogram only support upperCase
        let requestMethod = (config.method && config.method.toUpperCase()) || 'GET';
        // miniprogram network request config
        let mpRequestOption = {
            method: requestMethod,
            url: buildURL(config.url, config.params, config.paramsSerializer),
            // Listen for success
            success: function (mpResponse) {
                let response = transformResponse(mpResponse, config, mpRequestOption);
                settle(resolve, reject, response);
            },
            // Handle request Exception
            fail: function (error) {
                transformError(error, reject, config);
            },
            complete: function () {
                requestTask = undefined;
            }
        };
        // HTTP basic authentication
        if (config.auth) {
            let _a = [config.auth.username || '', config.auth.password || ''], username = _a[0], password = _a[1];
            requestHeaders.Authorization = 'Basic ' + encoder(username + ':' + password);
        }
        // Set the request timeout
        if (config.timeout !== 0) {
            warn('The "timeout" option is not supported by miniprogram. For more information about usage see "https://developers.weixin.qq.com/miniprogram/dev/framework/config.html#全局配置"');
        }
        // Add headers to the request
        utils.forEach(requestHeaders, function setRequestHeader (val, key) {
            let _header = key.toLowerCase();
            if ((typeof requestData === 'undefined' && _header === 'content-type') || _header === 'referer') {
                // Remove Content-Type if data is undefined
                // And the miniprogram document said that '设置请求的 header，header 中不能设置 Referer'
                delete requestHeaders[key];
            } else if (typeof requestData === 'string' && _header === 'content-type' && val === 'application/x-www-form-urlencoded') {
                // Wechat miniprograme document:对于 POST 方法且 header['content-type'] 为 application/x-www-form-urlencoded 的数据，小程序会将数据转换成 query string （encodeURIComponent(k)=encodeURIComponent(v)&encodeURIComponent(k)=encodeURIComponent(v)...
                // Specialized processing of wechat,jsut pass the object parameters
                try {
                    requestData = JSON.parse(requestData);
                } catch (error) {
                }
            }
        });
        mpRequestOption.header = requestHeaders;
        // Add responseType to request if needed
        if (config.responseType) {
            mpRequestOption.responseType = config.responseType;
        }
        if (config.cancelToken) {
            // Handle cancellation
            config.cancelToken.promise.then(function onCanceled (cancel) {
                if (!requestTask) {
                    return;
                }
                requestTask.abort();
                reject(cancel);
                // Clean up request
                requestTask = undefined;
            });
        }
        if (requestData !== undefined) {
            mpRequestOption.data = requestData;
        }
        requestTask = request(mpRequestOption);
    });
}

module.exports = mpAdapter;
