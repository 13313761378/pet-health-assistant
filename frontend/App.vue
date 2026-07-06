<script>
export default {
  onLaunch() {},
};
</script>

<style>
page {
  min-height: 100%;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 184, 77, 0.22), transparent 30%),
    linear-gradient(180deg, #fffaf4 0%, #fafafa 70%);
  color: #2c2925;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
button,
uni-button,
input,
textarea {
  box-sizing: border-box;
}

button,
uni-button,
.uni-button,
uni-button button,
.uni-button button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  padding: 0;
  border: 0 !important;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.2;
  text-align: inherit;
}

button::after,
uni-button::after,
.uni-button::after,
uni-button button::after,
.uni-button button::after {
  border: 0 !important;
  display: none;
}

.page-shell {
  padding: 24rpx 24rpx 188rpx;
}

.eyebrow {
  color: #e99024;
  font-size: 24rpx;
  font-weight: 600;
}

.page-title {
  padding: 16rpx 8rpx 4rpx;
}

.page-title text:last-child {
  display: block;
  margin-top: 8rpx;
  color: #2c2925;
  font-size: 56rpx;
  font-weight: 700;
}

.card {
  border: 2rpx solid rgba(240, 229, 215, 0.8);
  border-radius: 48rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 44rpx rgba(167, 114, 45, 0.12);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.section-title .title-main {
  display: block;
  margin-top: 8rpx;
  color: #2c2925;
  font-size: 40rpx;
  font-weight: 600;
}

.primary-button {
  width: 100%;
  border-radius: 32rpx;
  background: #ffb84d;
  color: #ffffff;
  padding: 26rpx 32rpx;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 10rpx 24rpx rgba(255, 184, 77, 0.26);
}

.small-button {
  border-radius: 32rpx;
  background: #fff5e6;
  color: #e99024;
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  border-radius: 24rpx;
  background: #ffffff;
  color: #e99024;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 18rpx rgba(167, 114, 45, 0.08);
}
</style>
