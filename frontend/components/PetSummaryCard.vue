<template>
  <view class="pet-strip card">
    <view class="pet-card-main">
      <view class="pet-profile">
        <image class="pet-avatar" :src="pet.avatar" mode="aspectFill" />
        <view>
          <text class="pet-name">{{ pet.name }}</text>
          <text class="pet-desc">{{ pet.desc }}</text>
        </view>
      </view>
    </view>
    <view class="pet-growth-row">
      <view><text>已陪伴</text><text>{{ pet.days }}天</text></view>
      <view><text>健康值</text><text>{{ pet.healthScore }}%</text></view>
      <view><text>今日任务</text><text>{{ pet.taskProgress }}</text></view>
    </view>
    <scroll-view class="pet-switcher" scroll-x>
      <button v-for="item in pets" :key="item.name" type="button" :class="{ active: activePet === item.name }" @click="selectPet(item)">
        <image :src="item.avatar" mode="aspectFill" />
        <text>{{ item.name }}</text>
      </button>
      <button class="add-pet-button" type="button" @click="showAddPet">
        <text class="plus-mark">+</text>
        <text>新增</text>
      </button>
    </scroll-view>
    <button class="bell" type="button">铃</button>
    <view v-if="showAddForm" class="pet-modal-mask" @click="closeAddPet">
      <view class="pet-modal" @click.stop>
        <view class="modal-title">
          <view>
            <text class="eyebrow">宠物管理</text>
            <text class="modal-heading">新增宠物</text>
          </view>
          <button type="button" @click="closeAddPet">×</button>
        </view>
        <view class="pet-form">
          <view class="photo-upload" @click="choosePetPhoto">
            <image v-if="form.avatar" :src="form.avatar" mode="aspectFill" />
            <template v-else><text>+</text><text>上传照片</text></template>
          </view>
          <label><text>宠物名称</text><input v-model="form.name" placeholder="例如：小橘" /></label>
          <label><text>品种</text><input v-model="form.breed" placeholder="例如：橘猫" /></label>
          <label><text>年龄</text><input v-model.number="form.age" type="number" /></label>
          <label><text>性别</text><picker :range="genderOptions" @change="changeGender"><text>{{ form.gender }}</text></picker></label>
        </view>
        <button class="save-button" type="button" @click="saveAddPet">保存展示</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "PetSummaryCard",
  data() {
    return {
      showAddForm: false,
      genderOptions: ["公", "母", "未知"],
      form: { name: "", breed: "", age: 1, gender: "公", avatar: "" },
    };
  },
  props: {
    pet: {
      type: Object,
      required: true,
    },
    pets: {
      type: Array,
      default: () => [],
    },
    activePet: {
      type: String,
      default: "",
    },
  },
  methods: {
    selectPet(item) {
      this.$emit("select", item.name);
    },
    showAddPet() {
      this.showAddForm = true;
    },
    closeAddPet() {
      this.showAddForm = false;
    },
    choosePetPhoto() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: ({ tempFilePaths }) => { this.form.avatar = tempFilePaths[0] || ""; },
      });
    },
    changeGender(event) {
      this.form.gender = this.genderOptions[Number(event.detail.value)] || "未知";
    },
    saveAddPet() {
      const name = this.form.name.trim();
      const breed = this.form.breed.trim();
      if (!name || !breed) {
        uni.showToast({ title: "请填写宠物名称和品种", icon: "none" });
        return;
      }
      if (this.pets.some((pet) => pet.name === name)) {
        uni.showToast({ title: "宠物名称已存在", icon: "none" });
        return;
      }
      this.$emit("add", { ...this.form, name, breed, age: Number(this.form.age) || 0 });
      this.showAddForm = false;
      this.form = { name: "", breed: "", age: 1, gender: "公", avatar: "" };
      uni.showToast({
        title: `${name}已加入宠物列表`,
        icon: "none",
      });
    },
  },
};
</script>

<style scoped>
.pet-strip {
  position: relative;
  display: grid;
  gap: 40rpx;
  min-height: 620rpx;
  padding: 56rpx 40rpx 36rpx;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(255, 184, 77, 0.2), rgba(126, 217, 87, 0.13)),
    #ffffff;
}

.pet-card-main {
  display: grid;
  min-width: 0;
  padding-right: 0;
}

.pet-profile {
  display: flex;
  align-items: center;
  gap: 34rpx;
  min-width: 0;
  padding: 0 12rpx;
}

.pet-avatar {
  width: 208rpx;
  height: 208rpx;
  flex: 0 0 208rpx;
  border: 12rpx solid #ffffff;
  border-radius: 64rpx;
  box-shadow: 0 10rpx 22rpx rgba(167, 114, 45, 0.16);
}

.pet-name {
  display: block;
  color: #2c2925;
  font-size: 80rpx;
  font-weight: 700;
  line-height: 1.08;
}

.pet-desc {
  display: block;
  margin-top: 16rpx;
  color: #8b8176;
  font-size: 40rpx;
}

.pet-growth-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24rpx;
}

.pet-growth-row view {
  min-height: 192rpx;
  border-radius: 44rpx;
  background: rgba(255, 255, 255, 0.74);
  padding: 40rpx 16rpx 32rpx;
  text-align: center;
  box-shadow: inset 0 0 0 2rpx rgba(240, 229, 215, 0.68);
}

.pet-growth-row text:first-child {
  display: block;
  color: #8b8176;
  font-size: 32rpx;
}

.pet-growth-row text:last-child {
  display: block;
  margin-top: 24rpx;
  color: #e99024;
  font-size: 56rpx;
  font-weight: 700;
}

.pet-switcher {
  width: 100%;
  white-space: nowrap;
}

.pet-switcher button {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  margin-right: 14rpx;
  border-radius: 999rpx;
  background: #fffaf3;
  color: #8b8176;
  padding: 10rpx 18rpx 10rpx 10rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.pet-switcher button.active {
  background: #ffffff;
  color: #e99024;
  box-shadow: inset 0 0 0 2rpx rgba(255, 184, 77, 0.42);
}

.pet-switcher .add-pet-button {
  background: #fff5e6;
  color: #e99024;
}

.plus-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #e99024;
  font-size: 36rpx;
  font-weight: 700;
}

.pet-switcher image {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
}

.bell {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #e99024;
  font-size: 28rpx;
  box-shadow: 0 10rpx 22rpx rgba(167, 114, 45, 0.12);
}

.pet-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(44, 41, 37, 0.34);
  padding: 32rpx;
}

.pet-modal {
  width: 100%;
  border-radius: 48rpx;
  background: #ffffff;
  padding: 40rpx;
}

.modal-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-heading {
  display: block;
  color: #2c2925;
  font-size: 44rpx;
  font-weight: 700;
}

.modal-title button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #fff5e6;
  color: #e99024;
  font-size: 36rpx;
}

.pet-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24rpx;
  margin: 32rpx 0;
}

.photo-upload {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  gap: 12rpx;
  min-height: 220rpx;
  border: 2rpx dashed rgba(233, 144, 36, 0.38);
  border-radius: 40rpx;
  background: #fffaf3;
  color: #e99024;
  overflow: hidden;
}

.photo-upload image {
  width: 100%;
  height: 260rpx;
}

.photo-upload text:first-child {
  display: grid;
  place-items: center;
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #ffffff;
  font-size: 56rpx;
  font-weight: 700;
}

.photo-upload text:last-child,
.pet-form label text {
  color: #8b8176;
  font-size: 26rpx;
}

.pet-form label {
  display: grid;
  gap: 14rpx;
}

.pet-form input {
  border-radius: 28rpx;
  background: #fffdf8;
  color: #2c2925;
  padding: 24rpx;
  font-size: 28rpx;
}

.save-button {
  width: 100%;
  border-radius: 32rpx;
  background: #ffb84d;
  color: #ffffff;
  padding: 26rpx;
  font-size: 32rpx;
  font-weight: 700;
}
</style>
