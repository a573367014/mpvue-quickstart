import RequestOrm from '@/services/requestOrm';

export default function (pathParams) {
    const path = 'miniprogram/uptokens/aliyun';
    return new RequestOrm(path, pathParams);
}
