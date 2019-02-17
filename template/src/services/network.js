import axios from 'axios';
import mpAdapter from 'axios-miniprogram-adapter';
import store from '@/vuex/store';

import { API_URL, DEBUG } from '@/config';
import { promiseify } from '@/utils';

axios.defaults.adapter = mpAdapter;
const http = axios.create({
    // 注意：API_URL 最后一个字符得是 "/"
    baseURL: API_URL + 'api/',
    headers: {
        post: { 'Content-Type': 'application/json; charset=utf-8' },
        put: { 'Content-Type': 'application/json; charset=utf-8' },
        patch: { 'Content-Type': 'application/json; charset=utf-8' }
    }
});

// 添加响应拦截器
http.interceptors.response.use(
    res => {
        res._isPreventDefault = false;
        res.preventDefault = () => {
            res._isPreventDefault = true;
        };

        // 未登录或登录态失效
        if (res.status === 401) {
            store.dispatch('clearLogin');
            return Promise.reject(res);
        } else if (res.status !== 200) {
            setTimeout(() => {
                !res._isPreventDefault &&
                res.data &&
                res.data.message &&
                wx.showToast({
                    duration: 2500,
                    title: res.data.message,
                    icon: 'none'
                });
            }, 100);

            return Promise.reject(res);
        }

        DEBUG && console.log('响应拦截:', res, res.config.url);
        return res;
    },
    async err => {
        err._isPreventDefault = false;
        err.preventDefault = () => {
            err._isPreventDefault = true;
        };

        if (err.errMsg !== 'request:fail abort') {
            const { networkType } = await promiseify(wx.getNetworkType);
            const isTimeout = (msg) => msg.indexOf('time') !== -1;
            const isNetworkError = networkType === 'none';

            setTimeout(() => {
                let msg = err.errMsg || err.message || '';

                if (isTimeout(msg)) {
                    msg = '请求超时，请重试';
                } else if (isNetworkError) {
                    msg = '网络连接中断, 请检查网络';
                };

                !err._isPreventDefault && wx.showToast({
                    duration: 2500,
                    title: msg,
                    icon: 'none'
                });
            }, 100);

            console.error('请求错误', err);
        }

        return Promise.reject(err);
    }
);

// 添加请求拦截器
http.interceptors.request.use(
    function (config) {
        // doSomething
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

export default http;
