<template>
    <view class="c-icon"
          :class="['c-icon--' + type, _class]"
          :style="_style"
          @click="e => $emit('click', e)">
        <image :src="src" />
    </view>
</template>

<script>
// mpvue 不支持解析模板相对路径require打包
// 需require后并赋值到data
// 借此提供icon组件避免太多的图片require到data
const files = require.context('@/assets/icon', false, /\.(png|svg|jpg|jpeg|gif)$/);
const names = files.keys();
const typeMap = {};

names.forEach((name, i) => {
    // ./1.jpg  type = 1
    const type = name.match(/\/(.+)\.\w+$/)[1];
    if (type) {
        typeMap[type] = names[i];
    } else {
        throw new Error('icon name match error');
    }
});

export default {
    props: {
        _style: {
            type: String,
            default: ''
        },
        _class: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            required: true
        }
    },
    computed: {
        src () {
            const key = typeMap[this.type];
            if (key === undefined) throw new Error('type prop is invalid');
            return files(key);
        }
    }
};
</script>
<style lang="less">
.c-icon {
    display: inline-block;
    vertical-align: middle;
    image {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
    }
}
</style>