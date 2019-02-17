import RequestOrm from '@/services/requestOrm';

export default function (pathParams) {
    const path = 'logs';
    return new RequestOrm(path, pathParams);
}
