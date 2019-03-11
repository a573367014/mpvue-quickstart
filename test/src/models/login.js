import RequestOrm from '@/services/requestOrm';

export function wxLoginModel (pathParams) {
    // miniprogram  sms_code
    const path = 'sessions/wechat';
    return new RequestOrm(path, pathParams);
}

export function wxBindUserModel (pathParams) {
    // miniprogram  sms_code
    const path = 'users/wechat';
    return new RequestOrm(path, pathParams);
}

export function wxTokenModel (pathParams) {
    // miniprogram  sms_code
    const path = 'sessions/wechat_token';
    return new RequestOrm(path, pathParams);
}
