<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">系统</text>
        <text class="title">系统设置</text>
      </view>
    </view>

    <view class="card list-card">
      <label><text>接收新任务提醒</text><switch checked /></label>
      <label><text>接收家庭组邀请</text><switch checked /></label>
      <label><text>健康趋势周报</text><switch /></label>
      <button class="primary-button" type="button" @click="save">保存设置</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
    save() {
      uni.showToast({ title: "系统设置已保存", icon: "none" });
    },
  },
};
</script>

<style scoped>
.sub-header { display: flex; align-items: center; gap: 24rpx; }
.sub-header button { border-radius: 999rpx; background: #fff5e6; color: #e99024; padding: 18rpx 28rpx; }
.title { display: block; color: #2c2925; font-size: 44rpx; font-weight: 700; }
.list-card { display: grid; gap: 20rpx; padding: 40rpx; }
.list-card label { display: flex; align-items: center; justify-content: space-between; border-radius: 32rpx; background: #fffaf3; padding: 28rpx; color: #2c2925; font-weight: 600; }
</style>
