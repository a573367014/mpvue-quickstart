/*
 * 小程序简易版axios
 * @Author: facai
 * @Date: 2018-04-16 13:50:52
 * @Last Modified by: facai
 * @Last Modified time: 2019-03-13 16:25:07
 */

import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import InterceptorManager from './Interceptor';
import CancelToken from './CancelToken';

// 可配置参数
const defaultConfig = () => {
    return {
        'baseURL': '',
        'headers': {
            'common': {
                'Accept': 'application/json, text/plain, */*'
            },
            'delete': {},
            'get': {},
            'head': {},
            'post': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'put': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            'patch': {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    };
};

// 组装请求参数
const assemblyParams = {
    init (instancConfig, options) {
        // 方法名必须大写
        options.method = (options.method || 'GET').toUpperCase();
        options.header = this.setHeader(instancConfig, options.headers, options.method);
        options.url = this.setURL(options.params, options.url, options.baseURL, instancConfig.baseURL);
        delete options.headers;
        delete options.params;
        return options;
    },
    setHeader (instancConfig, optionHeaders, curMethod) {
        let defaultHeaders = defaultConfig().headers;
        let instancHeaders = instancConfig ? instancConfig.headers : {};
        let resultHeaders = {};
        let mergeHeaders = merge(
            instancHeaders,
            optionHeaders
        );

        for (let k in mergeHeaders) {
            if (!defaultHeaders.hasOwnProperty(k)) resultHeaders[k] = mergeHeaders[k];
        };

        Object.assign(
            mergeHeaders.common,
            mergeHeaders[curMethod.toLowerCase()],
            resultHeaders
        );

        return resultHeaders;
    },
    setURL (params, optionsURl, baseURL, instancConfigURL) {
        let url = '';
        let query = '';
        if (optionsURl.indexOf('http://') === 0 || optionsURl.indexOf('https://') === 0) {
            url = optionsURl;
        } else {
            url = (baseURL || instancConfigURL || '') + '/' + optionsURl;
        }
        url = url.replace(
            /([^:])\/{2,}/g,
            function (...rest) { return rest[1] + '/'; }
        );
        if (params) {
            query = url.indexOf('?') === -1 ? '?' : '';
            for (let k in params) {
                query += `&${k}=${params[k]}`;
            }
        }
        return url + query.replace('?&', '?');
    }
};

class Axios {
    constructor (config) {
        this.defaults = merge(defaultConfig(), config);
        // 挂载拦截器
        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager()
        };
    }
    request (_options) {
        const cancelToken = _options.cancelToken;

        delete _options.cancelToken;
        const options = assemblyParams.init(this.defaults, cloneDeep(_options));
        // 注册“拦截请求”
        return Promise.resolve(options).then(
            this.interceptors.request.fulfilled ||
            (options => options)
        ).then(lastOptions => {
            return new Promise((resolve, reject) => {
                const result = mpvue.request({
                    ...lastOptions,
                    success: response => {
                        response.status = response.status || response.statusCode;
                        response.config = lastOptions;
                        resolve(response);
                    },
                    fail: err => {
                        err.config = lastOptions;
                        reject(err);
                    }
                });
                if (cancelToken) {
                    cancelToken.promise.then(() => {
                        result.abort();
                    });
                }
            });
        // 注册“拦截响应“
        }).then(
            this.interceptors.response.fulfilled || (response => response),
            this.interceptors.response.rejected || (err => Promise.reject(err))
        );
    }
}

// 注册别名
['post', 'put', 'patch'].forEach(method => {
    Axios.prototype[method] = function (url, data, _config) {
        let config = Object.assign({}, _config);
        config.data = merge(data, config.data);
        config.url = url;
        config.method = method;
        return this.request(config);
    };
});

['get', 'delete', 'head'].forEach(method => {
    Axios.prototype[method] = function (url, _config) {
        let config = Object.assign({}, _config);
        config.url = url;
        config.method = method;
        return this.request(config);
    };
});

const axios = new Axios();
axios.create = config => new Axios(config);
axios.CancelToken = CancelToken;
export default axios;
