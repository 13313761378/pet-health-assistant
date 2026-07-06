<template>
  <view class="page-shell">
    <view class="sub-header">
      <button type="button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">账号信息</text>
        <text class="title">个人资料</text>
      </view>
    </view>

    <view class="card account-card">
      <view class="avatar-edit">
        <image class="avatar" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80" mode="aspectFill" />
        <view>
          <text>小鱼</text>
          <text>可以修改头像、昵称和联系方式</text>
        </view>
        <button class="small-button" type="button" @click="changeAvatar">修改头像</button>
      </view>

      <label class="field">
        <text>昵称</text>
        <input v-model="form.nickname" />
      </label>
      <label class="field">
        <text>账号 ID</text>
        <input v-model="form.accountId" />
      </label>
      <label class="field">
        <text>手机号</text>
        <input v-model="form.phone" />
      </label>

      <button class="primary-button" type="button" @click="save">保存账号信息</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        nickname: "小鱼",
        accountId: "pet_2026_001",
        phone: "138****2026",
      },
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    changeAvatar() {
      uni.showToast({ title: "已打开头像选择", icon: "none" });
    },
    save() {
      uni.showToast({ title: "账号信息已保存", icon: "none" });
    },
  },
};
</script>

<style scoped>
.sub-header { display: flex; align-items: center; gap: 24rpx; }
.sub-header button { border-radius: 999rpx; background: #fff5e6; color: #e99024; padding: 18rpx 28rpx; }
.title { display: block; color: #2c2925; font-size: 44rpx; font-weight: 700; }
.account-card { display: grid; gap: 28rpx; padding: 40rpx; }
.avatar-edit { display: grid; grid-template-columns: 144rpx 1fr auto; align-items: center; gap: 24rpx; border-radius: 44rpx; background: #fffaf3; padding: 28rpx; }
.avatar { width: 144rpx; height: 144rpx; border: 8rpx solid #ffffff; border-radius: 44rpx; }
.avatar-edit view text:first-child { display: block; color: #2c2925; font-size: 36rpx; font-weight: 700; }
.avatar-edit view text:last-child { display: block; margin-top: 8rpx; color: #8b8176; font-size: 24rpx; line-height: 1.45; }
.field { display: grid; gap: 14rpx; }
.field text { color: #8b8176; font-size: 26rpx; font-weight: 600; }
.field input { border: 2rpx solid #eadfce; border-radius: 32rpx; background: #fffdf8; color: #2c2925; padding: 26rpx 30rpx; font-size: 30rpx; }
</style>
