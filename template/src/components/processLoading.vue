
<template>
    <div class="c-process-loading"
         v-if="visible"
         @touchmove.stop>

        <div class="c-process-loading__box">
            <div class="c-process-loading__icon u-flex-all-center">
                <canvas canvas-id="canvas" id="canvas" class="u-ps-full"></canvas>
                <image class="c-process-loading__image" :src="img.process" />
            </div>
            <div class="c-process-loading__text">{{text}}</div>
            <div class="c-process-loading__close" @click="$emit('cancel')">取消</div>
        </div>
    </div>
</template>

<script>
import {DEBUG} from '@/config';
const {windowWidth} = wx.getSystemInfoSync();

export default {
    props: {
        visible: Boolean,
        auto: {
            type: Boolean,
            default: true
        },
        text: {
            type: String,
            default: '加载中...'
        }
    },
    data () {
        return {
            value: 0,
            img: {
                process: require('@/assets/img/process.gif')
            }
        };
    },
    methods: {
        // 到指定进度
        set (v) {
            clearInterval(this._timer2);
            this.animation(v, 3);
        },

        // 模拟进度，一点点前进
        start (target = 100) {
            clearInterval(this._timer2);
            const fn = () => {
                const rangeValue = (target - this.value);
                const randomValue = Math.random() * rangeValue / 2;

                const toValue = Math.min(
                    this.value + randomValue,
                    target * 0.97
                );

                DEBUG && console.log(toValue, 'start');
                this.animation(toValue);
            };

            fn();
            this._timer2 = setInterval(fn, 1000);
        },

        done () {
            this.clear();
            return new Promise(resolve => {
                this.animation(100, 3, resolve);
            });
        },

        animation (toValue, gap = 1, callback) {
            clearInterval(this._timer);
            this._timer = setInterval(() => {
                // 判断大致接近目标值，关闭定时器
                if (Math.abs(toValue - this.value) < gap) {
                    this.value = toValue;
                    clearInterval(this._timer);
                } else if (toValue > this.value) {
                    this.value += gap;
                } else {
                    this.value -= gap;
                }

                this.value = Math.min(100, Math.max(0, this.value));
                this.drawCircle(this.value);

                if (this.value === 100) {
                    this.clear();
                    this.$emit('done');
                    callback && callback();
                }

                DEBUG && console.log(toValue, this.value, 'animation');
            }, 1000 / 60);
        },

        drawCircle (value = 0) {
            const borderWidth = 3;
            const ctx = this.ctx || wx.createCanvasContext('canvas');
            const w = parseInt((156 / 750 * windowWidth) / 2);
            const h = parseInt((156 / 750 * windowWidth) / 2);

            ctx.arc(w, h, w - borderWidth, 0 * Math.PI, 2 * Math.PI);
            ctx.setStrokeStyle('#dadada');
            ctx.setLineWidth(borderWidth);
            ctx.setLineCap('round');
            ctx.stroke();

            value = value * (2 / 100);

            ctx.beginPath();
            ctx.arc(w, h, w - borderWidth, 1.5 * Math.PI, (1.5 + value) * Math.PI);
            ctx.setStrokeStyle('red');
            ctx.setLineWidth(borderWidth);
            ctx.setLineCap('round');
            ctx.stroke();
            ctx.draw();
        },

        emitHidden () {
            this.$emit('update:visible', false);
        },

        clear () {
            clearInterval(this._timer);
            clearInterval(this._timer2);
        }
    },
    mounted () {
        const watchVisible = v => {
            this.value = 0;

            if (v) {
                this.ctx = wx.createCanvasContext('canvas');

                this.drawCircle(0);
                this.auto && this.start();
            } else {
                this.clear();
            }
        };

        this.visible && watchVisible();
        this.$watch('visible', watchVisible);
    },
    beforeDestory () {
        this.clear();
    }
};
</script>
<style lang="less">
@circle-width: 156rpx;
@circle-border-width: 6rpx;
.c-process-loading {
    background-color: rgba(0,0,0,0.86);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    z-index: 999;
    justify-content: center;
    align-items: flex-start;
    will-change: transform;
    -webkit-align-items: center
}

.c-process-loading__box {
    width: 280rpx;
    height: 332rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8rpx;
    opacity: 0.9;
    text-align: center;
    line-height: 1;
 }

.c-process-loading__icon {
    width: @circle-width;
    height: @circle-width;
    margin: 30rpx auto;
    position: relative;
}

.c-process-loading__text {
    font-size: 26rpx;
    color: #333;
}

.c-process-loading__close {
    color: #999;
    font-size: 24rpx;
    padding: 40rpx 0 20rpx;
}

.c-process-loading__image {
    width: 82rpx;
    height: 102rpx;
    position: relative;
    z-index: 2;
}
</style>