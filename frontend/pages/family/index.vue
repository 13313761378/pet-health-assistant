<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">家庭组</text>
        <text class="title">温暖小家</text>
      </view>
    </view>

    <view class="card list-card">
      <view class="row"><text>家庭成员</text><text>小鱼、阿辰、妈妈、爸爸</text></view>
      <view class="row"><text>家庭邀请码</text><text>FAMILY-2026</text></view>

      <view class="member-list">
        <view>
          <image src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" mode="aspectFill" />
          <view><text>小鱼</text></view>
          <text>我</text>
        </view>
        <view>
          <image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" mode="aspectFill" />
          <view><text>阿辰</text></view>
          <text>成员</text>
        </view>
        <view>
          <text class="member-placeholder">妈</text>
          <view><text>妈妈</text></view>
          <text>成员</text>
        </view>
        <view>
          <text class="member-placeholder">爸</text>
          <view><text>爸爸</text></view>
          <text>成员</text>
        </view>
      </view>

      <view class="family-action-panel">
        <text>申请加入他人家庭</text>
        <text>输入对方提供的邀请码，提交加入申请。</text>
        <input v-model="inviteCode" />
        <button class="primary-button" type="button" @click="applyJoin">提交申请</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inviteCode: "FAMILY-2026",
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    applyJoin() {
      uni.showToast({ title: "加入家庭申请已提交", icon: "none" });
    },
  },
};
</script>

<style scoped>
.sub-header { display: flex; align-items: center; gap: 24rpx; }
.sub-header button { border-radius: 999rpx; background: #fff5e6; color: #e99024; padding: 18rpx 28rpx; }
.title { display: block; color: #2c2925; font-size: 44rpx; font-weight: 700; }
.list-card { display: grid; gap: 24rpx; padding: 40rpx; }
.row { display: flex; justify-content: space-between; gap: 24rpx; border-radius: 32rpx; background: #fffaf3; padding: 28rpx; }
.row text:first-child { color: #8b8176; }
.row text:last-child { color: #2c2925; font-weight: 700; }
.member-list { display: grid; gap: 20rpx; }
.member-list > view { display: grid; grid-template-columns: 88rpx 1fr auto; align-items: center; gap: 24rpx; border-radius: 36rpx; background: #fffaf3; padding: 24rpx; }
.member-list image,
.member-placeholder { width: 88rpx; height: 88rpx; border-radius: 50%; }
.member-placeholder { display: grid; place-items: center; background: #fff5e6; color: #e99024; font-size: 28rpx; font-weight: 700; line-height: 88rpx; text-align: center; }
.member-list view view text:first-child { display: block; color: #2c2925; font-size: 30rpx; font-weight: 700; }
.member-list > view > text:last-child { border-radius: 999rpx; background: #ffffff; color: #e99024; padding: 10rpx 18rpx; font-size: 24rpx; }
.family-action-panel { display: grid; gap: 18rpx; border-radius: 36rpx; background: #fffaf3; padding: 28rpx; }
.family-action-panel text:first-child { color: #2c2925; font-size: 30rpx; font-weight: 700; }
.family-action-panel text:nth-child(2) { color: #8b8176; font-size: 26rpx; line-height: 1.5; }
.family-action-panel input { border-radius: 28rpx; background: #fffdf8; color: #2c2925; padding: 24rpx; }
</style>
