const { getOptions } = require('loader-utils');
module.exports = function (source) {
    const { keep, tags } = getOptions(this);
    // \s\S 相当于匹配 .\n
    // 写法一： <wx>dsfdsfds</wx>
    // 写法二： //<wx> dsfsd //</wx>
    const pattern = (tag) => new RegExp(`(// *<${tag}>([\\s\\S]*?)// *</${tag}>)|(<${tag}>([\\s\\S]*?)</${tag}>)`, 'g');
    tags.forEach(tag => {
        let p = pattern(tag);
        if (tag !== keep) {
            source = source.replace(p, '');
        } else {
            source = source.replace(p, val => {
                p = new RegExp(`</?${tag}>`, 'g');
                return val.replace(p, '');
            });
        }
    });

    return source;
};
