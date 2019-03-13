export default class CancelToken {
    constructor (executor) {
        let resolvePromise = null;
        this.promise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        executor(message => {
            // 证明已经取消过了
            if (this.canceled) return;
            this.canceled = true;
            resolvePromise();
        });
    }
    source () {
        let cancel = null;
        return {
            cancel: cancel,
            token: new CancelToken(c => {
                cancel = c;
            })
        };
    }
}
