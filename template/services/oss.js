/**
 * services/oss
 * by ali-oss
 *
 * 扩展部分方法
 *
 * upload
 * imageInfo
 */

const path = require('path');
const crypto = require('crypto');

// const axios = require('axios');
const lodash = require('lodash');
const dateFormat = require('date-fns/format');
const Promise = require('bluebird');
const random = require('random-js')();
const OSS = require('ali-oss').Wrapper;

const env = process.env;
const oss = new OSS({
    internal: env.OSS_INTERNAL === 'true',
    accessKeySecret: env.OSS_SECRET_KEY,
    accessKeyId: env.OSS_ACCESS_KEY,
    region: `oss-${env.OSS_REGION}`,
    bucket: env.OSS_BUCKET,
    secure: false
});

const hmac = function (key = '', input = '', digestType = 'hex', hash = 'sha1') {
    const hmac = crypto.createHmac(hash, key);

    hmac.update(input);

    if (digestType) {
        return hmac.digest(digestType);
    }

    return hmac.digest();
};

// extend methods
lodash.assign(oss, {
    uptoken (key, bucket = env.OSS_BUCKET) {
        const hourMs = 60 * 60 * 1000;
        const expMs = Date.now() + hourMs;
        const policy = JSON.stringify({
            expiration: new Date(expMs),
            conditions: [
                { key }
            ]
        });
        const policyBase64 = Buffer.from(policy).toString('base64');
        const signature = hmac(env.OSS_SECRET_KEY, policyBase64, 'base64');

        oss.useBucket(bucket);

        return {
            action: `//${env.OSS_HOST}`,
            oss_action: `//${env.OSS_BUCKET}.oss-${env.OSS_REGION}.aliyuncs.com`,
            access_key: env.OSS_ACCESS_KEY,
            policy: policyBase64,
            signature,
            key
        };
    },
    url (key, host = env.OSS_HOST, protocol = 'https') {
        const baseUrl = `${protocol}://${host}/`;

        return baseUrl + key;
    },
    upload (file, key, bucket = env.OSS_BUCKET) {
        const isBuffer = Buffer.isBuffer(file);
        const typeToExtMap = {
            jpeg: 'jpg'
        };

        let ext = '';
        if (isBuffer) {
            ext = path.basename('' + file.type);
            ext = typeToExtMap[ext] || ext;
            ext = '.' + ext;
        } else {
            ext = path.extname(file);
        }

        // 自动补全 key
        if (!key) {
            key += `tmp/${dateFormat(new Date(), 'YYYY-MM-DD')}/`;
        }

        // 自动补全 name
        if (key.slice(-1) === '/') {
            key += `${dateFormat(new Date(), 'YYYYMMDD-HHmmss-')}${random.string(5)}${ext}`;
        }

        return Promise.try(() => {
            oss.useBucket(bucket);

            return oss.put(key, file);
        })
            .then(ret => {
            // Ext props
                ret.innerUrl = ret.url;
                ret.url = this.url(ret.name);

                return ret;
            });
    },
    imageInfo (key, bucket = env.OSS_BUCKET) {
        return Promise.try(() => {
            oss.useBucket(bucket);

            return oss.get(key, {
                process: 'image/info'
            });
        })
            .then(res => {
                const data = res.data;

                return {
                    format: data.Format.value,
                    size: +data.FileSize.value || 0,
                    width: +data.ImageWidth.value || 0,
                    height: +data.ImageHeight.value || 0
                };
            });
    }
});

module.exports = oss;
