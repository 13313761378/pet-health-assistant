<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">消息中心</text>
        <text class="title">通知</text>
      </view>
    </view>

    <view class="card message-card">
      <view v-for="message in messages" :key="message.title" class="message-item">
        <text class="icon-badge">{{ message.icon }}</text>
        <view>
          <text>{{ message.type }}</text>
          <text>{{ message.title }}</text>
        </view>
        <text>{{ message.status }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { messages } from "@/common/mock.js";

export default {
  data() {
    return {
      messages,
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
  },
};
</script>

<style scoped>
.sub-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 8rpx 4rpx;
}

.sub-header button {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 20rpx 28rpx;
  font-weight: 600;
}

.title {
  display: block;
  margin-top: 8rpx;
  color: #2c2925;
  font-size: 56rpx;
  font-weight: 700;
}

.message-card {
  display: grid;
  gap: 24rpx;
  padding: 40rpx;
}

.message-item {
  display: grid;
  grid-template-columns: 84rpx 1fr auto;
  align-items: center;
  gap: 24rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx;
}

.message-item view text:first-child {
  display: block;
  color: #8b8176;
  font-size: 24rpx;
}

.message-item view text:last-child {
  display: block;
  margin-top: 8rpx;
  color: #2c2925;
  font-size: 28rpx;
  font-weight: 600;
}

.message-item > text:last-child {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 14rpx 18rpx;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
