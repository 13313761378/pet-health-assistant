<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">任务</text>
        <text class="title">新增 / 编辑任务</text>
      </view>
    </view>

    <view class="card task-form-card">
      <label><text>任务名称</text><input value="傍晚遛弯" /></label>
      <label><text>选择宠物</text><input value="" placeholder="请选择宠物" /></label>
      <label><text>提醒时间</text><input value="18:30" /></label>
      <label><text>重复规则</text><input value="每日重复" /></label>
      <label><text>投送成员</text><input value="小鱼、阿辰" /></label>
      <label class="full"><text>备注</text><textarea value="注意避开高温路面，回家后补水。"></textarea></label>
      <button class="primary-button full" type="button" @click="save">保存展示</button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
    save() {
      uni.showToast({ title: "任务已保存", icon: "none" });
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

.task-form-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  padding: 40rpx;
}

.task-form-card label {
  display: grid;
  gap: 14rpx;
}

.task-form-card text {
  color: #8b8176;
  font-size: 26rpx;
}

.task-form-card input,
.task-form-card textarea {
  border-radius: 28rpx;
  background: #fffdf8;
  color: #2c2925;
  padding: 24rpx;
}

.full {
  grid-column: 1 / -1;
}
</style>
