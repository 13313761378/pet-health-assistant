<template>
  <view class="page-shell">
    <view class="page-title">
      <text class="eyebrow">健康档案</text>
      <text>记录</text>
    </view>

    <WeekCalendar :days="weekDays" @change="selectedDate = $event" />

    <view class="record-layout">
      <view class="card record-card">
        <view class="section-title">
          <view>
            <text class="eyebrow">{{ selectedDateLabel }}</text>
            <text class="title-main">健康记录</text>
          </view>
          <text class="status-pill">{{ currentRecord ? "已填写" : "无记录" }}</text>
        </view>
        <view v-if="currentRecord" class="metric-list">
          <view v-for="item in metrics" :key="item.label">
            <text>{{ item.label }}</text>
            <text>{{ item.value }}</text>
          </view>
        </view>
        <view v-else class="empty-record">当日无记录</view>
      </view>

      <HealthScoreCard :score="pet.healthScore" />
    </view>

    <TaskTimeline title="当天任务列表" :tasks="recordTasks" :show-add="false" />
  </view>
</template>

<script>
import { pet, tasks, weekDays } from "@/common/mock.js";
import WeekCalendar from "@/components/WeekCalendar.vue";
import HealthScoreCard from "@/components/HealthScoreCard.vue";
import TaskTimeline from "@/components/TaskTimeline.vue";

export default {
  components: {
    WeekCalendar,
    HealthScoreCard,
    TaskTimeline,
  },
  data() {
    return {
      pet,
      weekDays,
      selectedDate: "2026-06-04",
      dailyRecords: {
        "2026-06-04": { weight: "10.8 kg", feeding: "2 勺", water: "正常", walk: "3.2 公里", stool: "正常", mood: "活跃" },
        "2026-06-05": { weight: "10.8 kg", feeding: "3 勺", water: "多", walk: "2.8 公里", stool: "正常", mood: "低迷" },
        "2026-06-06": { weight: "10.9 kg", feeding: "2 勺", water: "正常", walk: "2.4 公里", stool: "偏软", mood: "正常" },
      },
      recordTasks: [
        { ...tasks[0], name: "梳毛", time: "10:00", note: "换毛期增加频率" },
        { ...tasks[1], name: "晚间喂食", time: "19:30", note: "少量多餐" },
      ],
    };
  },
  computed: {
    currentRecord() {
      return this.dailyRecords[this.selectedDate];
    },
    selectedDateLabel() {
      const [year, month, day] = this.selectedDate.split("-").map(Number);
      return `${month} 月 ${day} 日`;
    },
    metrics() {
      if (!this.currentRecord) return [];
      return [
        { label: "体重", value: this.currentRecord.weight },
        { label: "喂食", value: this.currentRecord.feeding },
        { label: "饮水", value: this.currentRecord.water },
        { label: "遛弯", value: this.currentRecord.walk },
        { label: "排便", value: this.currentRecord.stool },
        { label: "精神状态", value: this.currentRecord.mood },
      ];
    },
  },
};
</script>

<style scoped>
.record-layout {
  display: grid;
  gap: 32rpx;
}

.record-card {
  padding: 40rpx;
}

.status-pill {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.metric-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin-top: 32rpx;
}

.metric-list view {
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx;
}

.metric-list text:first-child {
  display: block;
  color: #8b8176;
  font-size: 24rpx;
}

.metric-list text:last-child {
  display: block;
  margin-top: 12rpx;
  color: #2c2925;
  font-size: 30rpx;
  font-weight: 600;
}

.empty-record {
  border-radius: 36rpx;
  background: #fffaf3;
  color: #8b8176;
  margin-top: 32rpx;
  padding: 56rpx 24rpx;
  text-align: center;
  font-weight: 600;
}
</style>
