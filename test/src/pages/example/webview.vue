<template>
<web-view :src="url"></web-view>
</template>
<script>
import h5Mixin from '@/mixins/h5';
import { WEBVIEW_URL } from '@/config';

export default {
    mixins: [h5Mixin],
    data () {
        return {
            href: WEBVIEW_URL + 'blesscard'
        };
    },
    onLoad ({userId, templetId}) {
        this.setUrl(this.href, {
            userId,
            templetId
        });
    }
};
</script>

<style lang="less">
</style>
