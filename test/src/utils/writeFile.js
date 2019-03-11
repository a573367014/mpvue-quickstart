const fsm = wx.getFileSystemManager();

/**
 * 写入临时文件并放回资源临时路径
 * @param {ArrayBuffer} buffer 文件二进制数据
 * @param {String} fileName 文件路径包含文件名
 * @return {Promise}
 */
const writeFile = function (buffer, fileName) {
    return new Promise((resolve, reject) => {
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;

        fsm.writeFile({
            filePath,
            data: buffer,
            encoding: 'binary',
            success () {
                resolve(filePath);
            },
            fail () {
                reject(new Error('临时文件写入失败'));
            }
        });
    });
};

export default writeFile;
