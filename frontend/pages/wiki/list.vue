<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">宠物百科</text>
        <text class="title">{{ categoryData.title }}</text>
      </view>
    </view>

    <view class="card list-card">
      <BreedCard v-for="(breed, index) in categoryData.breeds" :key="breed.name" :breed="breed" @tap="openDetail(index)" />
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
      category: "dog",
    };
  },
  computed: {
    categoryData() {
      return breedData[this.category] || breedData.dog;
    },
  },
  onLoad(options) {
    this.category = options.category || "dog";
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    openDetail(index) {
      uni.navigateTo({
        url: `/pages/wiki/detail?category=${this.category}&index=${index}`,
      });
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

.list-card {
  display: grid;
  gap: 24rpx;
  padding: 32rpx;
}
</style>
