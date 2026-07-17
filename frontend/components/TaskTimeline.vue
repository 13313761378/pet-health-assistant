<template>
  <view class="card task-card">
    <view class="section-title">
      <view>
        <text class="eyebrow">任务</text>
        <text class="title-main">{{ title }}</text>
      </view>
      <button v-if="showAdd" class="small-button" type="button" @click="openTask">新增任务</button>
    </view>
    <view class="timeline-list">
      <view v-for="task in orderedTasks" :key="task.name" class="timeline-item" :class="{ done: task.done }">
        <button class="task-open" type="button" @click="openTask">
          <text class="time">{{ task.time }}</text>
          <view>
            <view class="task-name-row"><text class="pet-badge" :class="badgeClass(task)">{{ task.petName || "宠物" }}</text><text class="name">{{ task.name }}</text></view>
            <text class="note">{{ task.note }}</text>
          </view>
        </button>
        <button class="task-complete" type="button" @click="completeTask(task)">
          <text v-if="task.done">✓</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "TaskTimeline",
  emits: ["complete"],
  props: {
    title: {
      type: String,
      default: "今日任务列表",
    },
    tasks: {
      type: Array,
      required: true,
    },
    showAdd: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    orderedTasks() {
      return [...this.tasks].sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done);
        if (a.done && b.done) return a.time.localeCompare(b.time);
        return 0;
      });
    },
  },
  methods: {
    completeTask(task) {
      if (task.done) return;
      this.$emit("complete", task.id);
    },
    openTask() {
      uni.navigateTo({
        url: "/pages/tasks/edit",
      });
    },
    badgeClass(task) {
      if (task.scope === "shared") return "shared";
      return { 豆包: "doubao", 奶糖: "naitang", 团子: "tuanzi" }[task.petName] || "shared";
    },
  },
};
</script>

<style scoped>
.task-card {
  padding: 40rpx;
}

.timeline-list {
  display: grid;
  gap: 24rpx;
  margin-top: 32rpx;
}

.timeline-item {
  display: grid;
  grid-template-columns: 1fr 72rpx;
  align-items: center;
  gap: 20rpx;
  width: 100%;
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 24rpx;
  text-align: left;
}

.task-open {
  display: grid;
  grid-template-columns: 140rpx 1fr;
  align-items: center;
  gap: 24rpx;
  background: transparent;
  padding: 0;
  text-align: left;
}

.time {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 32rpx;
  background: #ffffff;
  color: #e99024;
  font-weight: 600;
}

.timeline-item.done .time {
  background: #ecfae6;
  color: #49aa2e;
}

.name {
  color: #2c2925;
  font-size: 30rpx;
  font-weight: 600;
}

.task-name-row { display: flex; align-items: center; gap: 12rpx; min-width: 0; }
.pet-badge { flex: 0 0 auto; border-radius: 999rpx; padding: 8rpx 14rpx; font-size: 20rpx; font-weight: 700; }
.pet-badge.doubao { background: #fff0d8; color: #d87913; }.pet-badge.naitang { background: #eef0ff; color: #7167c7; }.pet-badge.tuanzi { background: #e8f7e4; color: #489c37; }.pet-badge.shared { background: #f2ece5; color: #746658; }

.note {
  display: block;
  margin-top: 8rpx;
  color: #8b8176;
  font-size: 26rpx;
}

.task-complete {
  display: grid;
  place-items: center;
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid rgba(233, 144, 36, 0.36);
  border-radius: 50%;
  background: #ffffff;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 800;
}

.timeline-item.done .task-complete {
  border-color: #7ed957;
  background: #7ed957;
  color: #ffffff;
}
</style>
