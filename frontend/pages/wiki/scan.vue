<template>
  <view class="scan-page">
    <view class="scan-header">
      <button type="button" class="back-button" @click="goBack">返回</button>
      <view>
        <text class="eyebrow">AI 品种识别</text>
        <text class="title">拍照识别</text>
      </view>
    </view>

    <view class="camera-shell">
      <camera class="camera-preview" :device-position="devicePosition" flash="off" mode="normal">
        <cover-view class="focus focus-tl"></cover-view>
        <cover-view class="focus focus-tr"></cover-view>
        <cover-view class="focus focus-bl"></cover-view>
        <cover-view class="focus focus-br"></cover-view>
        <cover-view class="camera-copy">
          <cover-view class="camera-title">摄像头视角</cover-view>
          <cover-view class="camera-desc">将宠物脸部置于取景框中</cover-view>
        </cover-view>
      </camera>

      <view class="result-card">
        <text>识别结果占位</text>
        <text>可能是：柯基犬</text>
      </view>

      <view class="camera-controls">
        <button type="button" class="tool-button" @click="switchCamera">
          <text class="tool-icon rotate-icon"></text>
          <text>翻转</text>
        </button>
        <button type="button" class="shutter-button" @click="takePhoto">
          <text></text>
        </button>
        <button type="button" class="tool-button" @click="chooseFromAlbum">
          <text class="tool-icon gallery-icon"></text>
          <text>图库</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      devicePosition: "back",
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    switchCamera() {
      this.devicePosition = this.devicePosition === "back" ? "front" : "back";
    },
    takePhoto() {
      uni.showToast({
        title: "已拍照，识别中",
        icon: "none",
      });
    },
    chooseFromAlbum() {
      uni.showToast({
        title: "选择图库照片",
        icon: "none",
      });
    },
  },
};
</script>

<style scoped>
.scan-page {
  min-height: 100vh;
  background: #1f1d1a;
  padding: 28rpx;
  color: #ffffff;
}

.scan-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 18rpx 0 26rpx;
}

.back-button {
  min-width: 112rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 26rpx;
}

.eyebrow {
  display: block;
  color: rgba(255, 255, 255, 0.58);
  font-size: 22rpx;
}

.title {
  display: block;
  margin-top: 6rpx;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
}

.camera-shell {
  display: grid;
  gap: 24rpx;
}

.camera-preview {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 860rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, rgba(255, 245, 230, 0.13), rgba(126, 217, 87, 0.12)), #34302b;
}

.focus {
  position: absolute;
  width: 64rpx;
  height: 64rpx;
  border-color: #ffb84d;
}

.focus-tl {
  top: 48rpx;
  left: 48rpx;
  border-top: 6rpx solid;
  border-left: 6rpx solid;
  border-radius: 18rpx 0 0 0;
}

.focus-tr {
  top: 48rpx;
  right: 48rpx;
  border-top: 6rpx solid;
  border-right: 6rpx solid;
  border-radius: 0 18rpx 0 0;
}

.focus-bl {
  left: 48rpx;
  bottom: 48rpx;
  border-bottom: 6rpx solid;
  border-left: 6rpx solid;
  border-radius: 0 0 0 18rpx;
}

.focus-br {
  right: 48rpx;
  bottom: 48rpx;
  border-right: 6rpx solid;
  border-bottom: 6rpx solid;
  border-radius: 0 0 18rpx 0;
}

.camera-copy {
  position: absolute;
  left: 0;
  right: 0;
  top: 360rpx;
  text-align: center;
}

.camera-title {
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 700;
}

.camera-desc {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
}

.result-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.1);
  padding: 24rpx 28rpx;
}

.result-card text:first-child {
  color: rgba(255, 255, 255, 0.64);
  font-size: 24rpx;
}

.result-card text:last-child {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}

.camera-controls {
  display: grid;
  grid-template-columns: 1fr 172rpx 1fr;
  align-items: end;
  gap: 32rpx;
  padding: 10rpx 12rpx 18rpx;
}

.tool-button {
  display: grid;
  justify-items: center;
  gap: 12rpx;
  background: transparent;
  color: rgba(255, 255, 255, 0.84);
  font-size: 24rpx;
}

.tool-icon {
  position: relative;
  display: block;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.rotate-icon::before {
  content: "";
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  width: 38rpx;
  height: 38rpx;
  border: 5rpx solid #ffffff;
  border-right-color: transparent;
  border-radius: 50%;
}

.gallery-icon::before {
  content: "";
  position: absolute;
  left: 22rpx;
  top: 26rpx;
  width: 44rpx;
  height: 36rpx;
  border: 5rpx solid #ffffff;
  border-radius: 8rpx;
}

.shutter-button {
  display: grid;
  place-items: center;
  width: 156rpx;
  height: 156rpx;
  justify-self: center;
  border: 8rpx solid rgba(255, 255, 255, 0.88);
  border-radius: 50%;
  background: transparent;
}

.shutter-button text {
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  background: #ffffff;
}
</style>
