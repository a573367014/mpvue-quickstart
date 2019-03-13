// 拦截器
export default class InterceptorManager {
    constructor () {
        this.handlers = [];
    }
    // 注册拦截器
    use (fulfilled, rejected) {
        this.fulfilled = fulfilled;
        this.rejected = rejected;

        // return () => {
        //     this.fulfilled = null;
        //     this.rejected = null;
        // };
    }
    // 注销拦截器
    // eject (fn) {
    //     fn();
    // }
}
