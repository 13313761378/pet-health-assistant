<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">今日健康记录</text>
        <text class="title">记录管理</text>
      </view>
    </view>

    <view class="card manage-card">
      <view class="section-title">
        <view>
          <text class="eyebrow">{{ activeRecord.label }}</text>
          <text class="title-main">可修改已提交记录</text>
        </view>
        <text class="status">已提交</text>
      </view>

      <view class="manage-grid">
        <label class="field">
          <text>喂食</text>
          <view class="soft-input"><input v-model="activeRecord.feeding" type="number" /><text>勺</text></view>
        </label>
        <view class="field">
          <text>饮水</text>
          <view class="tags">
            <button v-for="item in waterOptions" :key="item" :class="{ selected: activeRecord.water === item }" @click="activeRecord.water = item">{{ item }}</button>
          </view>
        </view>
        <label class="field">
          <text>遛弯</text>
          <view class="soft-input"><input v-model="activeRecord.walk" type="number" /><text>公里</text></view>
        </label>
        <label class="field">
          <text>体重</text>
          <view class="soft-input"><input v-model="activeRecord.weight" type="number" /><text>kg</text></view>
        </label>
        <view class="field full">
          <text>排便</text>
          <view class="tags wrap">
            <button v-for="item in stoolOptions" :key="item" :class="{ selected: activeRecord.stool === item }" @click="activeRecord.stool = item">{{ item }}</button>
          </view>
        </view>
        <view class="field full">
          <text>精神状态</text>
          <view class="tags">
            <button v-for="item in moodOptions" :key="item" :class="{ selected: activeRecord.mood === item }" @click="activeRecord.mood = item">{{ item }}</button>
          </view>
        </view>
      </view>

      <button class="primary-button" type="button" @click="save">保存修改</button>
    </view>

    <view class="card history-card">
      <view class="section-title">
        <view>
          <text class="eyebrow">历史记录</text>
          <text class="title-main">查看已提交记录</text>
        </view>
      </view>
      <button v-for="item in histories" :key="item.key" class="history-item" :class="{ active: activeHistory === item.key }" type="button" @click="selectHistory(item.key)">
        <text>{{ item.date }}</text>
        <text>{{ item.summary }}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeHistory: "today",
      records: {
        today: { label: "今日数据", feeding: 2, water: "正常", walk: 3.2, weight: 10.8, stool: "正常", mood: "活跃" },
        yesterday: { label: "昨天数据", feeding: 2, water: "正常", walk: 2.4, weight: 10.9, stool: "偏软", mood: "正常" },
        "0605": { label: "06-05 数据", feeding: 3, water: "多", walk: 2.8, weight: 10.8, stool: "正常", mood: "低迷" },
      },
      waterOptions: ["少", "正常", "多"],
      stoolOptions: ["正常", "偏软", "腹泻", "便秘"],
      moodOptions: ["正常", "活跃", "低迷"],
      histories: [
        { key: "today", date: "今天", summary: "喂食 2 勺 · 遛弯 3.2km · 健康值 92%" },
        { key: "yesterday", date: "昨天", summary: "喂食 2 勺 · 遛弯 2.4km · 健康值 89%" },
        { key: "0605", date: "06-05", summary: "喂食 3 勺 · 遛弯 2.8km · 健康值 90%" },
      ],
    };
  },
  computed: {
    activeRecord() {
      return this.records[this.activeHistory];
    },
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    save() {
      uni.showToast({ title: "当天记录修改已保存", icon: "none" });
    },
    selectHistory(key) {
      this.activeHistory = key;
      const item = this.histories.find((history) => history.key === key);
      uni.showToast({ title: `正在查看 ${item?.date || "历史"} 记录`, icon: "none" });
    },
  },
};
</script>

<style scoped>
.sub-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.sub-header button {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 18rpx 28rpx;
}

.title {
  display: block;
  color: #2c2925;
  font-size: 44rpx;
  font-weight: 700;
}

.manage-card,
.history-card {
  display: grid;
  gap: 28rpx;
  padding: 40rpx;
}

.status {
  border-radius: 999rpx;
  background: #ecfae6;
  color: #49aa2e;
  padding: 12rpx 18rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.manage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
}

.field {
  display: grid;
  gap: 18rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx;
}

.field.full {
  grid-column: 1 / -1;
}

.field > text {
  color: #2c2925;
  font-size: 28rpx;
  font-weight: 600;
}

.soft-input {
  display: flex;
  align-items: center;
  gap: 14rpx;
  width: fit-content;
  border-radius: 999rpx;
  background: #ffffff;
  padding: 10rpx 18rpx 10rpx 10rpx;
}

.soft-input input {
  width: 120rpx;
  border-radius: 999rpx;
  background: #fff7ec;
  color: #2c2925;
  font-size: 34rpx;
  font-weight: 600;
  text-align: center;
}

.soft-input text {
  color: #8b8176;
  font-size: 26rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
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

.history-item {
  display: grid;
  gap: 10rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  color: #2c2925;
  padding: 28rpx;
  text-align: left;
}

.history-item.active {
  background: linear-gradient(135deg, rgba(255, 184, 77, 0.2), rgba(255, 250, 243, 0.98));
  box-shadow: inset 0 0 0 2rpx rgba(255, 184, 77, 0.42);
}

.history-item text:first-child {
  color: #e99024;
  font-weight: 700;
}

.history-item text:last-child {
  color: #8b8176;
  font-size: 24rpx;
}
</style>
