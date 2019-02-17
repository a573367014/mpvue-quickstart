/**
 * logger
 * 线上log查看：https://elk.hlgdata.com
 */

import Log from '@/models/logs';

const logger = {
    info (...args) {
        console.log(...args);
    },
    error (...args) {
        console.error(...args);

        this.postError(args[0]);
    },
    postError (err) {
        // ignore debug or canceled
        if (
            !err ||
            err.name === 'CancellationError' ||
            err.canceled
        ) {
            return;
        }

        if (!(err instanceof Error)) {
            if (String(err).toLowerCase() === '[object event]') {
                const logInfo = {};

                for (let field in err) {
                    const item = err[field];
                    let subItem;

                    // 只递归一层
                    if (item instanceof Object) {
                        subItem = {};
                        for (let subField in item) {
                            subItem[subField] = item[subField] instanceof Object ? '[object]' : item[subField];
                        }
                    } else {
                        subItem = item;
                    }

                    logInfo[field] = subItem;
                }

                err = JSON.stringify('Uncatched Event ' + logInfo);
            }

            err = new Error(err);
        }

        const routes = getCurrentPages();
        const url = routes[routes.length - 1].route;
        Log().add({
            page_url: url,
            message: `${'{{projectName}}'.toUpperCase()}_MINIPEOGRAM_LOG: ${err.stack || err.message || err.errMsg}`,
            column_no: err.columnNo || -1,
            line_no: err.lineNo || -1,
            js_url: err.url
        })
            .catch(err => {
                console.error(err);
            });
    }
};

export default logger;
