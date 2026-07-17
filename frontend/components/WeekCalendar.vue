<template>
  <view class="card calendar-card">
    <view class="week-header">
      <button type="button" @click="changeWeek(-7)">上一周</button>
      <text>{{ selectedTitle }}</text>
      <button type="button" @click="changeWeek(7)">下一周</button>
    </view>
    <view class="calendar-row">
      <button v-for="day in currentDays" :key="day.date" :class="{ selected: selectedDate === day.date }" @click="selectDate(day.date)">
        <text>{{ day.label }}</text>
        <text>{{ day.day }}</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: "WeekCalendar",
  props: {
    days: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const formatKey = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${date.getFullYear()}-${month}-${day}`;
    };
    return {
      weekStart,
      selectedDate: formatKey(today),
      lastTodayKey: formatKey(today),
      todayTimer: null,
    };
  },
  computed: {
    currentDays() {
      const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
      return labels.map((label, index) => {
        const date = new Date(this.weekStart);
        date.setDate(this.weekStart.getDate() + index);
        return {
          label,
          day: date.getDate(),
          date: this.formatKey(date),
        };
      });
    },
    selectedTitle() {
      return this.formatFullDate(this.parseDate(this.selectedDate));
    },
  },
  mounted() {
    this.todayTimer = setInterval(this.syncToToday, 60 * 1000);
  },
  beforeUnmount() {
    clearInterval(this.todayTimer);
  },
  methods: {
    syncToToday() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayKey = this.formatKey(today);
      if (todayKey === this.lastTodayKey) return;
      this.lastTodayKey = todayKey;
      this.selectedDate = todayKey;
      this.weekStart = new Date(today);
      this.weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
      this.$emit("change", todayKey);
    },
    changeWeek(offset) {
      this.weekStart.setDate(this.weekStart.getDate() + offset);
      this.weekStart = new Date(this.weekStart);
      this.selectedDate = this.formatKey(this.weekStart);
      this.$emit("change", this.selectedDate);
    },
    selectDate(date) {
      this.selectedDate = date;
      this.$emit("change", date);
    },
    formatKey(date) {
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${date.getFullYear()}-${month}-${day}`;
    },
    parseDate(key) {
      const [year, month, day] = key.split("-").map(Number);
      return new Date(year, month - 1, day);
    },
    formatFullDate(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
  },
};
</script>

<style scoped>
.calendar-card {
  padding: 40rpx;
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.week-header button {
  border-radius: 999rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 18rpx 24rpx;
  font-weight: 600;
}

.week-header text {
  color: #2c2925;
  font-weight: 600;
}

.calendar-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12rpx;
}

.calendar-row button {
  display: grid;
  gap: 12rpx;
  min-height: 132rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  color: #8b8176;
  padding: 18rpx 8rpx;
  font-size: 24rpx;
}

.calendar-row button text:last-child {
  color: #2c2925;
  font-size: 38rpx;
  font-weight: 600;
}

.calendar-row button.selected {
  background: #ffb84d;
  color: #ffffff;
}

.calendar-row button.selected text {
  color: #ffffff;
}
</style>
