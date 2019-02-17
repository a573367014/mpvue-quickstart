import { promiseify } from '@/utils';
import imageTokenModel from '@/models/imageToken';

// 图片压缩上传服务（公共的）
const IMAGE_HOST = 'https://image-uploader.dancf.com/';

const uploadImage = (tempUrl) => {
    let resultUrl = '';

    // token的获取由后端提供
    return imageTokenModel().add({
        module_key: 'works/elements',
        file_name: tempUrl,
        app_type: 'web'
    }).then(res => {
        const { upload_rule: upload, token_info: token } = res.data;

        resultUrl = upload.final_url;

        const formData = {
            key: upload.save_path,
            policy: token.policy,
            Signature: token.signature,
            OSSAccessKeyId: token.access_key_id,
            OSSUploadAction: upload.bucket_domain
        };
        return promiseify(wx.uploadFile, {
            url: IMAGE_HOST,
            filePath: tempUrl,
            name: 'file',
            formData
        });
    }).then(res => {
        return resultUrl;
    });
};

export default uploadImage;
