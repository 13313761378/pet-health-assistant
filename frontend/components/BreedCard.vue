<template>
  <button class="breed-card" type="button" @click="$emit('tap')">
    <image :src="breed.image" :alt="breed.name" mode="aspectFill" />
    <view>
      <text class="name">{{ breed.name }}</text>
      <text class="desc">{{ breed.desc }}</text>
    </view>
  </button>
</template>

<script>
export default {
  name: "BreedCard",
  props: {
    breed: {
      type: Object,
      required: true,
    },
  },
  emits: ["tap"],
};
</script>

<style scoped>
.breed-card {
  overflow: hidden;
  display: grid;
  grid-template-columns: 256rpx 1fr;
  gap: 28rpx;
  align-items: center;
  width: 100%;
  border-radius: 40rpx;
  background: #fffaf3;
  padding: 20rpx;
  text-align: left;
}

.breed-card image {
  width: 256rpx;
  height: 208rpx;
  border-radius: 36rpx;
}

.name {
  display: block;
  color: #2c2925;
  font-size: 32rpx;
  font-weight: 600;
}

.desc {
  display: block;
  margin-top: 12rpx;
  color: #8b8176;
  font-size: 26rpx;
  line-height: 1.45;
}
</style>
