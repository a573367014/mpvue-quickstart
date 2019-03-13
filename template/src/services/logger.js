/**
 * logger
 * 线上log查看：https://elk.hlgdata.com
 */
import { logger } from '@gaoding/miniprogram-logger';

// 在项目入口初始化
logger.init('testname', {
    isDebug: true,
    user: {id: 0}
});

logger.sendRequest = function (url, data) {
    mpvue.request({
        url: url,
        data: data
    });
};

// logger.error('发送一个错误日志');
// logger.error(new Error('发送一个错误日志'));

// logger.info('发送一个消息日志');

// 修改用户id
// logger.setUser({id: '45667'});

export default logger;
