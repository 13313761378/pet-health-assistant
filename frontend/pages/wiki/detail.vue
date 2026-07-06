<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">品种详情</text>
        <text class="title">{{ breed.name }}</text>
      </view>
    </view>

    <image class="cover" :src="breed.image" mode="aspectFill" />

    <view class="card detail-card">
      <view class="section-title">
        <view>
          <text class="eyebrow">宠物介绍</text>
          <text class="title-main">{{ breed.name }}</text>
        </view>
        <text class="pill">品种百科</text>
      </view>
      <text class="intro">{{ breed.intro }}</text>
      <view class="detail-grid">
        <view v-for="item in infoList" :key="item.label">
          <text>{{ item.label }}</text>
          <text>{{ item.value }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { breedData } from "@/common/mock.js";

export default {
  data() {
    return {
      category: "dog",
      index: 0,
    };
  },
  computed: {
    breed() {
      return breedData[this.category]?.breeds[this.index] || breedData.dog.breeds[0];
    },
    infoList() {
      return Object.entries(this.breed.info).map(([label, value]) => ({ label, value }));
    },
  },
  onLoad(options) {
    this.category = options.category || "dog";
    this.index = Number(options.index || 0);
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
  font-size: 52rpx;
  font-weight: 700;
}

.cover {
  width: 100%;
  height: 520rpx;
  border-radius: 48rpx;
  box-shadow: 0 18rpx 44rpx rgba(167, 114, 45, 0.12);
}

.detail-card {
  padding: 40rpx;
}

.pill {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.intro {
  display: block;
  margin-top: 20rpx;
  color: #8b8176;
  font-size: 28rpx;
  line-height: 1.7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: 32rpx;
}

.detail-grid view {
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx;
}

.detail-grid text:first-child {
  display: block;
  color: #8b8176;
  font-size: 24rpx;
}

.detail-grid text:last-child {
  display: block;
  margin-top: 12rpx;
  color: #2c2925;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.5;
}
</style>
