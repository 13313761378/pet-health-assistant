<template>
  <view class="card score-card">
    <view class="score-main">
      <view>
        <text class="eyebrow">健康值</text>
        <text class="score-text">{{ score }}%</text>
        <text class="score-desc">趋势稳定，运动和饮食节奏较好。</text>
      </view>
      <view class="score-circle">{{ score }}</view>
    </view>
    <view class="line-chart">
      <view v-for="height in trend" :key="height" :style="{ height: height + '%' }"></view>
    </view>
    <view class="suggestion">健康建议：继续保持每日遛弯，若排便或精神状态连续异常，建议及时咨询医生。</view>
  </view>
</template>

<script>
export default {
  name: "HealthScoreCard",
  props: {
    score: {
      type: Number,
      default: 92,
    },
  },
  data() {
    return {
      trend: [42, 56, 52, 68, 64, 80, 88],
    };
  },
};
</script>

<style scoped>
.score-card {
  padding: 40rpx;
}

.score-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.score-text {
  display: block;
  margin-top: 8rpx;
  color: #e99024;
  font-size: 76rpx;
  font-weight: 700;
}

.score-desc {
  display: block;
  margin-top: 8rpx;
  color: #8b8176;
  font-size: 26rpx;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 172rpx;
  height: 172rpx;
  border-radius: 50%;
  background:
    radial-gradient(circle, #ffffff 0 56%, transparent 57%),
    conic-gradient(#7ed957 92%, #e8f4e2 0);
  color: #49aa2e;
  font-size: 48rpx;
  font-weight: 700;
}

.line-chart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-items: end;
  gap: 20rpx;
  height: 288rpx;
  margin: 40rpx 0 28rpx;
  border-radius: 36rpx;
  background: linear-gradient(180deg, #fffaf3, #ffffff);
  padding: 32rpx 28rpx 0;
}

.line-chart view {
  border-radius: 999rpx 999rpx 0 0;
  background: linear-gradient(180deg, #ffb84d, #7ed957);
}

.suggestion {
  border-radius: 36rpx;
  background: #fff5e6;
  color: #7a5b28;
  padding: 26rpx;
  line-height: 1.6;
}
</style>
