import axios from 'axios';
import writeFile from '@/utils/writeFile';
import { API_URL } from '@/config';

export default async function (data) {
    const res = await axios.post(
        API_URL + 'api/wechat/qrcode', data,
        {
            responseType: 'arraybuffer',
            headers: { Accept: '*/*' }
        }
    );

    const url = await writeFile(res.data, 'tem_miniprogram_qrcode.png');

    return url;
}
