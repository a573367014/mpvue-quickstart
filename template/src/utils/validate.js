/*
validate(
    {
        name: '',
        price: 'fds'
    }, {
        name: {
            required: true,
            label: '姓名',
            // 如果只有一个type则可这么写 ['*', 'e']
            rules: [{
                // pattern中的一个 or 自定义正则
                type: '*',

                msg: '自定义错误：不能为空'
            }, 'e']
        },
        price: {
            required: true,
            label: '价格',
            rules: ['n']
        }
    }
).then(() => {
    // 验证成功
}, errors => {
    // 验证失败
});
*/

export const msg = {
    '*': '不能为空！',
    '*6-16': '请填写6到16位任意字符！',
    'n': '请填写正整数！',
    'n6-16': '请填写6到16位数字！',
    's': '不能输入特殊字符！',
    's6-18': '请填写6到18位字符！',
    'w': '请填写字母、数字、_等有效的字符',
    'p': '请填写邮政编码！',
    'm': '格式错误！',
    'e': '格式错误！',
    'url': '请填写有效的网址！',
    'domain': '请填写有效的域名！',
    'password': '密码由6~16位大写字母、小写字母、数字及特殊字符中至少三种字符组成！',
    'nospace': '含有不安全的字符！'
};
export const pattern = {
    '*': /[\w\W]+/,
    '*6-16': /^[\w\W]{6,16}$/,
    'n': /^\d+$/,
    'n6-16': /^\d{6,16}$/,
    's': /^[\u4E00-\u9FA5\uf900-\ufa2d\w\\.\s]+$/,
    's6-18': /^[\u4E00-\u9FA5\uf900-\ufa2d\w\\.\s]{6,18}$/,
    'w': /^\w+$/,
    'p': /^[0-9]{6}$/,
    'm': /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,
    'e': /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    'url': /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
    'domain': /^(\w+\.)*\w+(\.\w+)$/,
    'password': /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{6,16}$/,
    'nospace': /\s/
};
/**
 * 验证
 * @param {Object} vm    验证的对象
 * @param {Object} rules 验证规则
 * @return {Promise}
 */
export default function validate (vm, rules) {
    let result = {valid: true, errors: []};
    for (let itemKey in rules) {
        let item = rules[itemKey];
        let itemRules = item.rules;
        let itemValue = vm[itemKey];
        itemRules = !Array.isArray(itemRules) ? [itemRules] : itemRules;

        for (let rule of itemRules) {
            let t = null;
            let m = null;
            if (typeof rule === 'string') {
                t = pattern[rule];
                m = msg[rule];
            } else {
                t = pattern[rule.type] || rule.type;
                m = msg[rule.type];
            }
            if ((item.required || itemValue !== '') && !t.test(itemValue)) {
                result.errors.push({
                    key: itemKey,
                    msg: rule.msg || (item.label || '') + m
                });
                result.valid = false;
                break;
            }
        }
    }
    return result.valid ? Promise.resolve() : Promise.reject(result.errors);
}
