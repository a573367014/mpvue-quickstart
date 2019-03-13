export default {
    /**
     * 获取节点位置信息
     * @param {String}  selector class / id
     * @return {Promise<Array|Object>}
     */
    getClientBoundingRect (selector) {
        let method = selector.indexOf('#') > -1 ? 'select' : 'selectAll';
        let query = mpvue.createSelectorQuery();
        return new Promise((resolve) => {
            query[method](selector).boundingClientRect();
            query.exec(res => {
                resolve(res[0] || res);
            });
        });
    }
};
