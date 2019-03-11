export default {
    /**
     * 获取并解码url query返回对象
     * @param {String} url
     * @return {Object}
     */
    parseQuery (url) {
        url = url == null ? window.location.href : url;
        if (url.indexOf('?') === -1) return {};

        var qs = url.substring(url.lastIndexOf('?') + 1);
        var args = {};
        var items = qs.length > 0 ? qs.split('&') : [];
        var item = null;
        var name = null;
        var value = null;
        for (var i = 0; i < items.length; i++) {
            item = items[i].split('=');
            // 用decodeURIComponent()分别解码name 和value（因为查询字符串应该是被编码过的）。
            name = decodeURIComponent(item[0]);
            value = decodeURIComponent(item[1]);
            if (name.length) {
                args[name] = value;
            }
        }
        return args;
    },

    /**
     * 解析成get 字符串参数
     * @param {Object}  query
     * @return {String} 字符串拼接get参数
     */
    stringifyQuery (query) {
        let str = '?';
        for (let k in query) {
            k = encodeURIComponent(k);
            if (query[k]) str += `&${k}=${encodeURIComponent(query[k])}`;
        }
        return str.replace('&', '');
    },

    /**
     * 解析header属性 ps：header不区分大小写、所以做个兼容
     * @param {Object}  header 请求头
     * @param {Object}  key    请求头属性
     * @return {String} 返回属性具体值
     */
    getHeader (header, key) {
        if (header[key]) return header[key];
        let resultKey = Object.keys(header).find(prop => {
            if (prop.toLowerCase() === key.toLowerCase()) {
                return true;
            }
        });
        return header[resultKey];
    }
};
