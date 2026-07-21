<template>
  <view class="pet-carousel-shell">
    <swiper
      class="pet-carousel"
      :current="carouselIndex"
      next-margin="250rpx"
      :duration="320"
      @change="onSwiperChange"
    >
      <swiper-item v-for="item in pets" :key="item.id">
        <view class="carousel-item">
          <view class="pet-slide card" :class="{ active: activePetId === item.id }">
            <view class="pet-profile">
              <image class="pet-avatar" :src="item.avatar" mode="aspectFill" />
              <view class="pet-copy">
                <text class="pet-name">{{ item.name }}</text>
                <text class="pet-desc">{{ item.desc }}</text>
              </view>
            </view>

            <view class="pet-growth-row">
              <view>
                <text>已陪伴</text>
                <text>{{ item.days }}天</text>
              </view>
              <view>
                <text>健康值</text>
                <text>{{ item.healthScore }}%</text>
              </view>
              <view>
                <text>今日任务</text>
                <text>{{ item.taskProgress }}</text>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>

      <swiper-item>
        <view class="carousel-item">
          <button class="add-slide card" type="button" @click="showAddPet">
            <text class="add-icon">+</text>
            <text class="add-title">新增宠物</text>
            <text class="add-desc">完善新伙伴的基础档案</text>
          </button>
        </view>
      </swiper-item>
    </swiper>

    <view class="carousel-footer">
      <view class="carousel-dots">
        <text
          v-for="(_, index) in pets.length + 1"
          :key="index"
          :class="{ active: carouselIndex === index }"
        ></text>
      </view>
      <text class="carousel-count">{{ Math.min(carouselIndex + 1, pets.length + 1) }}/{{ pets.length + 1 }}</text>
    </view>

    <button class="bell" type="button" aria-label="消息提醒">铃</button>

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
          <label>
            <text>性别</text>
            <picker :range="genderOptions" @change="changeGender">
              <view class="picker-value">{{ form.gender }}</view>
            </picker>
          </label>
        </view>
        <button class="save-button" type="button" @click="saveAddPet">保存展示</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "PetSummaryCard",
  emits: ["select", "add"],
  props: {
    pet: {
      type: Object,
      required: true,
    },
    pets: {
      type: Array,
      default: () => [],
    },
    activePetId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      carouselIndex: 0,
      showAddForm: false,
      genderOptions: ["公", "母", "未知"],
      form: { name: "", breed: "", age: 1, gender: "公", avatar: "" },
    };
  },
  watch: {
    activePetId: {
      immediate: true,
      handler(petId) {
        const index = this.pets.findIndex((item) => item.id === petId);
        if (index >= 0) this.carouselIndex = index;
      },
    },
  },
  methods: {
    onSwiperChange(event) {
      const index = Number(event.detail.current) || 0;
      this.carouselIndex = index;
      if (index < this.pets.length) this.$emit("select", this.pets[index].id);
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
        success: ({ tempFilePaths }) => {
          this.form.avatar = tempFilePaths[0] || "";
        },
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
      if (this.pets.some((item) => item.id === petId)) {
        uni.showToast({ title: "宠物名称已存在", icon: "none" });
        return;
      }
      this.$emit("add", { ...this.form, name, breed, age: Number(this.form.age) || 0 });
      this.showAddForm = false;
      this.form = { name: "", breed: "", age: 1, gender: "公", avatar: "" };
      uni.showToast({ title: name + "已加入宠物列表", icon: "none" });
    },
  },
};
</script>

<style scoped>
.pet-carousel-shell {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 4rpx 0 8rpx;
}

.pet-carousel {
  width: 100%;
  height: 500rpx;
}

.carousel-item {
  height: 100%;
  padding-right: 20rpx;
}

.pet-slide,
.add-slide {
  width: 100%;
  height: 100%;
}

.pet-slide {
  display: grid;
  align-content: space-between;
  gap: 28rpx;
  overflow: hidden;
  border-radius: 44rpx;
  padding: 42rpx 32rpx 32rpx;
  background:
    radial-gradient(circle at 84% 12%, rgba(126, 217, 87, 0.14), transparent 34%),
    linear-gradient(145deg, #fff3df 0%, #fffdf8 58%, #f1faec 100%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.pet-slide.active {
  border-color: rgba(255, 184, 77, 0.7);
  box-shadow: 0 18rpx 42rpx rgba(167, 114, 45, 0.16);
}

.pet-profile {
  display: flex;
  align-items: center;
  gap: 24rpx;
  min-width: 0;
}

.pet-avatar {
  width: 144rpx;
  height: 144rpx;
  flex: 0 0 144rpx;
  border: 8rpx solid #ffffff;
  border-radius: 44rpx;
  background: #f4eadc;
  box-shadow: 0 10rpx 22rpx rgba(167, 114, 45, 0.14);
}

.pet-copy {
  min-width: 0;
}

.pet-name {
  display: block;
  overflow: hidden;
  color: #2c2925;
  font-size: 52rpx;
  font-weight: 750;
  line-height: 1.08;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pet-desc {
  display: block;
  overflow: hidden;
  margin-top: 12rpx;
  color: #8b8176;
  font-size: 25rpx;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pet-growth-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.pet-growth-row view {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 142rpx;
  border: 2rpx solid rgba(238, 225, 208, 0.8);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.8);
  padding: 22rpx 8rpx;
  text-align: center;
}

.pet-growth-row text:first-child {
  color: #8b8176;
  font-size: 21rpx;
  white-space: nowrap;
}

.pet-growth-row text:last-child {
  overflow: hidden;
  max-width: 100%;
  margin-top: 13rpx;
  color: #e99024;
  font-size: 34rpx;
  font-weight: 750;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-slide {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 18rpx;
  border: 2rpx dashed rgba(233, 144, 36, 0.5) !important;
  border-radius: 44rpx;
  background:
    radial-gradient(circle at 72% 22%, rgba(126, 217, 87, 0.16), transparent 32%),
    linear-gradient(145deg, #fff8ed, #ffffff);
  color: #e99024;
  text-align: center;
}

.add-slide::after {
  border: 0;
}

.add-icon {
  display: grid;
  place-items: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffc563, #ed982d);
  color: #ffffff;
  font-size: 58rpx;
  font-weight: 400;
  box-shadow: 0 14rpx 28rpx rgba(233, 144, 36, 0.24);
}

.add-title {
  color: #2c2925;
  font-size: 32rpx;
  font-weight: 700;
}

.add-desc {
  color: #9a8f83;
  font-size: 22rpx;
}

.carousel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 18rpx 0;
}

.carousel-dots {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.carousel-dots text {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #dfd5c9;
  transition: width 0.2s ease, background 0.2s ease;
}

.carousel-dots text.active {
  width: 42rpx;
  background: #ffb84d;
}

.carousel-count {
  color: #9a8f83;
  font-size: 22rpx;
}

.bell {
  position: absolute;
  top: 20rpx;
  right: 238rpx;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 62rpx;
  height: 62rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #e99024;
  font-size: 22rpx;
  box-shadow: 0 8rpx 18rpx rgba(167, 114, 45, 0.12);
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
  max-width: 760rpx;
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
  overflow: hidden;
  border: 2rpx dashed rgba(233, 144, 36, 0.38);
  border-radius: 40rpx;
  background: #fffaf3;
  color: #e99024;
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

.pet-form input,
.picker-value {
  min-height: 76rpx;
  border-radius: 28rpx;
  background: #fffdf8;
  color: #2c2925;
  padding: 22rpx 24rpx;
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

@media (max-width: 700px) {
  .pet-carousel {
    height: 470rpx;
  }

  .pet-slide {
    padding: 34rpx 24rpx 26rpx;
  }

  .pet-avatar {
    width: 124rpx;
    height: 124rpx;
    flex-basis: 124rpx;
  }

  .pet-name {
    font-size: 44rpx;
  }

  .pet-growth-row view {
    min-height: 126rpx;
  }
}
</style>
