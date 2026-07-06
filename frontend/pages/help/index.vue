<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">帮助中心</text>
        <text class="title">帮助</text>
      </view>
    </view>

    <view class="card list-card">
      <view class="row"><text>常见问题</text><text>如何记录健康数据？</text></view>
      <view class="row"><text>反馈建议</text><text>告诉我们想优化的功能</text></view>
      <button class="primary-button" type="button" @click="feedback">提交反馈</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
    feedback() {
      uni.showToast({ title: "反馈入口已打开", icon: "none" });
    },
  },
};
</script>

<style scoped>
.sub-header { display: flex; align-items: center; gap: 24rpx; }
.sub-header button { border-radius: 999rpx; background: #fff5e6; color: #e99024; padding: 18rpx 28rpx; }
.title { display: block; color: #2c2925; font-size: 44rpx; font-weight: 700; }
.list-card { display: grid; gap: 20rpx; padding: 40rpx; }
.row { display: grid; gap: 10rpx; border-radius: 32rpx; background: #fffaf3; padding: 28rpx; }
.row text:first-child { color: #8b8176; }
.row text:last-child { color: #2c2925; font-weight: 700; }
</style>
