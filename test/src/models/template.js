import RequestOrm from '@/services/requestOrm';

// 获取模板数据的静态参数
templateModel.static = {
    platform_id: 128,
    channels: 32,
    type: 'movie',
    columns: 'id,title,preview,description,mask_num,channels,features'
};
export default function templateModel (pathParams) {
    const path = '/templets/:id';
    return new RequestOrm(path, pathParams);
}
