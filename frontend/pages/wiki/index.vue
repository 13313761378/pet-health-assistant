<template>
  <view class="page-shell">
    <view class="page-title">
      <text class="eyebrow">宠物知识库</text>
      <text>百科</text>
    </view>

    <view class="card scan-card" @click="openScan">
      <view class="scan-icon">
        <text></text>
      </view>
      <view>
        <text class="eyebrow">AI 品种识别</text>
        <text class="title">拍照识别宠物品种</text>
        <text class="desc">支持拍照或从图库选择照片，结果先做静态占位。</text>
      </view>
      <button class="primary-button" @click.stop="openScan">拍照识别</button>
    </view>

    <view class="card category-card">
      <view class="section-title">
        <view>
          <text class="eyebrow">宠物百科</text>
          <text class="title-main">{{ activeCategoryData.title }}</text>
        </view>
      </view>

      <view class="category-grid">
        <button type="button" :class="{ active: activeCategory === 'dog' }" @click="switchCategory('dog')">
          <image class="breed-icon" src="/static/icons/dog-head.svg" mode="aspectFit" />
          <view>
            <text>狗类</text>
            <text>金毛、柯基、边牧等</text>
          </view>
        </button>
        <button type="button" :class="{ active: activeCategory === 'cat' }" @click="switchCategory('cat')">
          <image class="breed-icon" src="/static/icons/cat-head.svg" mode="aspectFit" />
          <view>
            <text>猫类</text>
            <text>英短、布偶、暹罗等</text>
          </view>
        </button>
      </view>

      <view class="breed-list">
        <BreedCard v-for="(breed, index) in activeCategoryData.breeds" :key="breed.name" :breed="breed" @tap="openDetail(index)" />
      </view>
    </view>
  </view>
</template>

<script>
import { breedData } from "@/common/mock.js";
import BreedCard from "@/components/BreedCard.vue";

export default {
  components: {
    BreedCard,
  },
  data() {
    return {
      activeCategory: "dog",
      breedData,
    };
  },
  computed: {
    activeCategoryData() {
      return this.breedData[this.activeCategory];
    },
  },
  methods: {
    switchCategory(category) {
      this.activeCategory = category;
    },
    openDetail(index) {
      uni.navigateTo({
        url: `/pages/wiki/detail?category=${this.activeCategory}&index=${index}`,
      });
    },
    openScan() {
      uni.navigateTo({
        url: "/pages/wiki/scan",
      });
    },
  },
};
</script>

<style scoped>
.scan-card {
  display: grid;
  grid-template-columns: 104rpx 1fr auto;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fff5e6 100%);
}

.scan-icon {
  position: relative;
  width: 104rpx;
  height: 104rpx;
  border-radius: 36rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 22rpx rgba(167, 114, 45, 0.1);
}

.scan-icon::before {
  content: "";
  position: absolute;
  left: 26rpx;
  top: 34rpx;
  width: 52rpx;
  height: 38rpx;
  border: 5rpx solid #e99024;
  border-radius: 12rpx;
}

.scan-icon::after {
  content: "";
  position: absolute;
  left: 42rpx;
  top: 45rpx;
  width: 20rpx;
  height: 20rpx;
  border: 5rpx solid #e99024;
  border-radius: 50%;
}

.scan-card .primary-button {
  width: auto;
  min-width: 150rpx;
  padding: 0 24rpx;
  white-space: nowrap;
}

.title {
  display: block;
  color: #2c2925;
  font-size: 34rpx;
  font-weight: 600;
}

.desc {
  display: block;
  margin-top: 12rpx;
  color: #8b8176;
  font-size: 26rpx;
  line-height: 1.5;
}

.category-card {
  padding: 40rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: 32rpx;
}

.category-grid button {
  display: grid;
  grid-template-columns: 76rpx 1fr;
  align-items: center;
  gap: 20rpx;
  min-height: 156rpx;
  border-radius: 44rpx;
  background: #fffaf3;
  padding: 26rpx;
  text-align: left;
}

.category-grid button.active {
  background: linear-gradient(135deg, rgba(255, 184, 77, 0.22), rgba(255, 245, 230, 0.98));
  box-shadow: inset 0 0 0 2rpx rgba(255, 184, 77, 0.34);
}

.breed-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(167, 114, 45, 0.1);
}

.category-grid view text:first-child {
  display: block;
  color: #2c2925;
  font-size: 32rpx;
  font-weight: 700;
}

.category-grid view text:last-child {
  display: block;
  margin-top: 8rpx;
  color: #8b8176;
  font-size: 24rpx;
  line-height: 1.5;
}

.breed-list {
  display: grid;
  gap: 24rpx;
  margin-top: 32rpx;
}
</style>
