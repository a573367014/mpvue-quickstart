<template>
<view>
    <image :src="src" style="height: 200px; width: 200px"></image>
</view>
</template>

<script>
import qrcodeModel from '@/models/qrcode';

export default {
    data () {
        return {
            src: ''
        };
    },
    mounted () {
        qrcodeModel().then(res => {
            console.log(res);
            this.src = res;
        }).catch(console.error);
    }
};
</script>
