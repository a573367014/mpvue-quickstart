import http from './network';
import pathToRegexp from 'path-to-regexp';
import { getHeader } from '@/utils';

// 支持resetful
export default class OrmRequest {
    constructor (restPath, pathParams, _http) {
        // 解析resetful类型地址
        const urlTokens = pathToRegexp.parse(restPath);
        const urlLastToken = urlTokens[urlTokens.length - 1];
        if (typeof urlLastToken === 'object') {
            urlLastToken.optional = true;
        }

        this.$path = pathToRegexp.tokensToFunction(urlTokens)(pathParams);
        this.$http = _http || http;
        this.$fullPath = this.$http.defaults.baseURL + this.$path;

        Object.assign(this, {
            // 返回值是一个对象
            find: (data, config) => this.$http.get(this.$path, { params: data, ...config }),
            // 返回值是一个数组
            select: (data, config) => this.find(data, config),
            // 返回值带分页信息
            selectPage: (data, config) => {
                // 添加分页信息
                return this.select(data, config).then(res => {
                    try {
                        res.pagination = JSON.parse(getHeader(res.headers, 'x-pagination'));
                    } catch (e) {
                        res.pagination = null;
                    }
                    return res;
                });
            },
            delete: (data, config) => this.$http.delete(this.$path, { params: data, ...config }),
            save: (data, config) => this.$http.put(this.$path, data, config),
            add: (data, config) => this.$http.post(this.$path, data, config)
        });
    }
}
