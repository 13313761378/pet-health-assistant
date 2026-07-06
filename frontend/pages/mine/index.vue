<template>
  <view class="page-shell">
    <view class="card profile-card" @click="openAccount">
      <image class="avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80" mode="aspectFill" />
      <view>
        <text class="eyebrow">账号信息</text>
        <text class="name">小鱼</text>
        <text class="desc">已陪伴豆包 <text>286天</text></text>
      </view>
      <button class="notify" type="button" @click.stop="openMessages">
        <text>铃</text>
        <text>3</text>
      </button>
    </view>

    <view class="card stats-card">
      <view><text>累计记录</text><text>128次</text></view>
      <view><text>完成任务</text><text>532次</text></view>
      <view><text>健康均分</text><text>91</text></view>
    </view>

    <view class="card family-card" @click="openFamily">
      <view class="section-title">
        <view>
          <text class="eyebrow">家庭组</text>
          <text class="title-main">温暖小家</text>
        </view>
        <button class="small-button" type="button" @click.stop="openFamily">加入家庭</button>
      </view>
      <view class="family-overview">
        <view class="family-avatar-stack">
          <image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" mode="aspectFill" />
          <image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" mode="aspectFill" />
          <text>+2</text>
        </view>
        <view>
          <text>4 位成员共同照顾豆包</text>
          <text>今日任务已同步给家庭成员</text>
        </view>
      </view>
    </view>

    <view class="system-action-list">
      <button type="button" @click="openSettings">
        <text class="action-icon">设</text>
        <text>系统设置</text>
      </button>
      <button type="button" @click="openHelp">
        <text class="action-icon">?</text>
        <text>帮助</text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    openAccount() {
      uni.navigateTo({
        url: "/pages/account/index",
      });
    },
    openMessages() {
      uni.navigateTo({
        url: "/pages/messages/index",
      });
    },
    openFamily() {
      uni.navigateTo({
        url: "/pages/family/index",
      });
    },
    openSettings() {
      uni.navigateTo({
        url: "/pages/settings/index",
      });
    },
    openHelp() {
      uni.navigateTo({
        url: "/pages/help/index",
      });
    },
  },
};
</script>

<style scoped>
.profile-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, #fff5e6 0%, #ffffff 100%);
}

.avatar {
  width: 172rpx;
  height: 172rpx;
  border: 10rpx solid #ffffff;
  border-radius: 52rpx;
}

.name {
  display: block;
  margin-top: 8rpx;
  color: #2c2925;
  font-size: 56rpx;
  font-weight: 700;
}

.desc {
  display: block;
  margin-top: 10rpx;
  color: #8b8176;
  font-size: 28rpx;
}

.desc text {
  color: #e99024;
  font-weight: 700;
}

.notify {
  position: absolute;
  top: 36rpx;
  right: 36rpx;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #e99024;
}

.notify text:first-child {
  font-size: 28rpx;
}

.notify text:last-child {
  position: absolute;
  top: -6rpx;
  right: -4rpx;
  min-width: 36rpx;
  height: 36rpx;
  border: 4rpx solid #ffffff;
  border-radius: 999rpx;
  background: #ff5d4d;
  color: #ffffff;
  font-size: 20rpx;
  line-height: 32rpx;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  padding: 40rpx;
  text-align: center;
}

.stats-card view {
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx 16rpx;
}

.stats-card text:first-child {
  display: block;
  color: #8b8176;
  font-size: 24rpx;
}

.stats-card text:last-child {
  display: block;
  margin-top: 12rpx;
  color: #e99024;
  font-size: 44rpx;
  font-weight: 700;
}

.family-card {
  display: grid;
  gap: 32rpx;
  padding: 40rpx;
}

.family-overview {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 28rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  padding: 28rpx;
}

.family-avatar-stack {
  display: flex;
  align-items: center;
  min-width: 188rpx;
}

.family-avatar-stack image,
.family-avatar-stack text {
  width: 84rpx;
  height: 84rpx;
  border: 6rpx solid #ffffff;
  border-radius: 50%;
  margin-right: -24rpx;
}

.family-avatar-stack text {
  display: grid;
  place-items: center;
  background: #fff5e6;
  color: #e99024;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 72rpx;
  text-align: center;
}

.family-overview view:last-child text:first-child {
  display: block;
  color: #2c2925;
  font-size: 30rpx;
  font-weight: 600;
}

.family-overview view:last-child text:last-child {
  display: block;
  margin-top: 10rpx;
  color: #8b8176;
  font-size: 24rpx;
}

.system-action-list {
  display: grid;
  gap: 20rpx;
}

.system-action-list button {
  display: grid;
  grid-template-columns: 84rpx 1fr;
  align-items: center;
  gap: 24rpx;
  min-height: 124rpx;
  border-radius: 36rpx;
  background: #fffaf3;
  color: #2c2925;
  padding: 20rpx 28rpx;
  text-align: left;
}

.action-icon {
  display: grid;
  place-items: center;
  width: 84rpx;
  height: 84rpx;
  border-radius: 28rpx;
  background: #ffffff;
  color: #e99024;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 84rpx;
  text-align: center;
}

.system-action-list button > text:nth-child(2) {
  color: #2c2925;
  font-size: 30rpx;
  font-weight: 600;
}

</style>
