<template>
  <view class="health-panel card">
    <view class="section-title">
      <view>
        <text class="eyebrow">今日健康记录</text>
        <text class="title-main">记录{{ petName }}今天的身体状态</text>
      </view>
      <button class="text-button" type="button" @click="openManage">记录管理</button>
    </view>

    <view v-if="!submitted" class="health-grid">
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">食</text><text>喂食</text></view>
        <label class="soft-input"><input v-model="localRecord.feeding" type="number" /><text>勺</text></label>
      </view>
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">水</text><text>饮水</text></view>
        <view class="tags">
          <button v-for="item in waterOptions" :key="item" :class="{ selected: localRecord.water === item }" @click="localRecord.water = item">{{ item }}</button>
        </view>
      </view>
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">走</text><text>遛弯</text></view>
        <label class="soft-input"><input v-model="localRecord.walk" type="number" /><text>公里</text></label>
      </view>
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">重</text><text>体重</text></view>
        <label class="soft-input"><input v-model="localRecord.weight" type="number" /><text>kg</text></label>
      </view>
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">便</text><text>排便</text></view>
        <view class="tags wrap">
          <button v-for="item in stoolOptions" :key="item" :class="{ selected: localRecord.stool === item }" @click="localRecord.stool = item">{{ item }}</button>
        </view>
      </view>
      <view class="health-card">
        <view class="health-title"><text class="icon-badge">神</text><text>精神状态</text></view>
        <view class="tags">
          <button v-for="item in moodOptions" :key="item" :class="{ selected: localRecord.mood === item }" @click="localRecord.mood = item">{{ item }}</button>
        </view>
      </view>
    </view>

    <view v-else class="record-submitted-card">
      <text>今日记录已提交</text>
      <text>如需检查或修改，请进入记录管理。</text>
    </view>

    <button v-if="!submitted" class="primary-button" type="button" @click="saveRecord">提交今日记录</button>
  </view>
</template>

<script>
export default {
  name: "HealthRecordEditor",
  props: {
    record: {
      type: Object,
      required: true,
    },
    petName: {
      type: String,
      default: "豆包",
    },
  },
  data() {
    return {
      localRecord: { ...this.record },
      waterOptions: ["少", "正常", "多"],
      stoolOptions: ["正常", "偏软", "腹泻", "便秘"],
      moodOptions: ["正常", "活跃", "低迷"],
      submitted: false,
    };
  },
  watch: {
    record: {
      deep: true,
      handler(value) {
        this.localRecord = { ...value };
        this.submitted = false;
      },
    },
    petName() {
      this.submitted = false;
    },
  },
  methods: {
    openManage() {
      uni.navigateTo({
        url: "/pages/records/manage",
      });
    },
    saveRecord() {
      this.submitted = true;
      uni.showToast({
        title: "今日健康记录已保存",
        icon: "none",
      });
    },
  },
};
</script>

<style scoped>
.health-panel {
  padding: 34rpx;
}

.text-button {
  color: #e99024;
  font-size: 28rpx;
  font-weight: 600;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin: 32rpx 0 36rpx;
}

.health-card {
  display: flex;
  min-height: 230rpx;
  flex-direction: column;
  justify-content: flex-start;
  gap: 28rpx;
  border-radius: 40rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0)), #fff9f0;
  padding: 26rpx;
}

.record-submitted-card {
  display: grid;
  gap: 10rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, rgba(126, 217, 87, 0.18), rgba(255, 250, 243, 0.98));
  padding: 30rpx;
  margin: 32rpx 0 0;
}

.record-submitted-card text:first-child {
  color: #49aa2e;
  font-size: 32rpx;
  font-weight: 700;
}

.record-submitted-card text:last-child {
  color: #8b8176;
  font-size: 26rpx;
}

.health-title {
  display: flex;
  align-items: center;
  gap: 18rpx;
  color: #2c2925;
  font-size: 30rpx;
  font-weight: 600;
}

.soft-input {
  display: flex;
  align-items: center;
  width: min(100%, 360rpx);
  min-height: 72rpx;
  overflow: hidden;
  border-radius: 999rpx;
  border: 2rpx solid #f1dfc8;
  background: rgba(255, 255, 255, 0.92);
  padding: 6rpx 8rpx 6rpx 24rpx;
  box-shadow: 0 8rpx 22rpx rgba(167, 114, 45, 0.08);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.soft-input:focus-within {
  border-color: #ffb84d;
  box-shadow: 0 0 0 6rpx rgba(255, 184, 77, 0.14), 0 10rpx 24rpx rgba(167, 114, 45, 0.1);
}

.soft-input input,
.soft-input uni-input {
  flex: 1;
  width: 0;
  height: 58rpx;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #2c2925;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 58rpx;
}

.soft-input :deep(.uni-input-wrapper),
.soft-input :deep(.uni-input-input) {
  height: 58rpx;
  border: 0 !important;
  outline: 0;
  background: transparent;
  color: #2c2925;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 58rpx;
}

.soft-input text {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-width: 76rpx;
  margin-left: 14rpx;
  border-radius: 999rpx;
  background: #fff4e4;
  color: #8b8176;
  padding: 0 18rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14rpx;
}

.tags.wrap {
  flex-wrap: wrap;
}

.tags button {
  border-radius: 999rpx;
  background: #ffffff;
  color: #8b8176;
  padding: 12rpx 18rpx;
  font-size: 24rpx;
}

.tags button.selected {
  background: #ecfae6;
  color: #49aa2e;
}
</style>
