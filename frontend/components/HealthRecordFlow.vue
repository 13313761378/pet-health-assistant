<template>
  <view class="health-panel card">
    <view class="section-title">
      <view><text class="eyebrow">今日健康记录</text><text class="title-main">记录{{ activePetName }}今天的身体状态</text></view>
      <button class="text-button" type="button" @click="openManage">记录管理</button>
    </view>
    <view class="record-flow">
      <view class="flow-heading"><text>今日记录 {{ completedCount }}/{{ pets.length }}</text><text>{{ flowHint }}</text></view>
      <view v-if="isSinglePet" class="single-pet-state"><text>●</text><text>当前宠物：{{ activePetName }} · 今天尚未提交健康记录</text></view>
      <scroll-view v-else class="pet-tabs" :class="petTabLayout" scroll-x enable-flex>
        <button v-for="pet in pets" :key="pet.id" type="button" :class="{ current: pet.id === activePetId && !allCompleted, completed: isCompleted(pet.id) }" @click="$emit('select-pet', pet.id)">
          <text class="tab-marker">{{ markerFor(pet.id) }}</text><text>{{ pet.name }}</text>
        </button>
      </scroll-view>
      <view class="flow-route"><text>{{ routeCurrent }}</text><text>{{ routeHint }}</text></view>
    </view>
    <view v-if="!allCompleted" class="health-grid">
      <view class="health-card"><view class="health-title"><text class="icon-badge">食</text><text>喂食</text></view><label class="soft-input"><input v-model.number="localRecord.feeding" type="number" /><text>勺</text></label></view>
      <view class="health-card"><view class="health-title"><text class="icon-badge">水</text><text>饮水</text></view><view class="tags"><button v-for="item in waterOptions" :key="item" :class="{ selected: localRecord.water === item }" @click="localRecord.water = item">{{ item }}</button></view></view>
      <view class="health-card"><view class="health-title"><text class="icon-badge">走</text><text>遛弯</text></view><label class="soft-input"><input v-model.number="localRecord.walk" type="number" /><text>公里</text></label></view>
      <view class="health-card"><view class="health-title"><text class="icon-badge">重</text><text>体重</text></view><label class="soft-input"><input v-model.number="localRecord.weight" type="number" /><text>kg</text></label></view>
      <view class="health-card"><view class="health-title"><text class="icon-badge">便</text><text>排便</text></view><view class="tags"><button v-for="item in stoolOptions" :key="item" :class="{ selected: localRecord.stool === item }" @click="localRecord.stool = item">{{ item }}</button></view></view>
      <view class="health-card"><view class="health-title"><text class="icon-badge">神</text><text>精神状态</text></view><view class="tags"><button v-for="item in moodOptions" :key="item" :class="{ selected: localRecord.mood === item }" @click="localRecord.mood = item">{{ item }}</button></view></view>
    </view>
    <view v-else class="complete-card">
      <text class="complete-mark">✓</text><text class="complete-title">今日健康记录已全部完成</text><text class="complete-desc">所有宠物的身体状态均已保存。</text>
      <view class="complete-pets"><text v-for="pet in pets" :key="pet.id">✓ {{ pet.name }} · 已记录</text></view>
      <button class="small-button" type="button" @click="openManage">查看或修改今日记录</button>
    </view>
    <button v-if="!allCompleted" class="primary-button submit-button" type="button" @click="submitRecord">{{ submitLabel }}</button>
  </view>
</template>

<script>
export default {
  name: "HealthRecordFlow",
  emits: ["select-pet", "submit"],
  props: {
    pets: { type: Array, default: () => [] },
    activePetId: { type: String, default: "" },
    record: { type: Object, required: true },
    submittedPetIds: { type: Array, default: () => [] },
  },
  data() {
    return {
      localRecord: { ...this.record },
      waterOptions: ["少", "正常", "多"],
      stoolOptions: ["正常", "偏软", "腹泻", "便秘"],
      moodOptions: ["正常", "活跃", "低迷"],
    };
  },
  computed: {
    activePet() { return this.pets.find((pet) => pet.id === this.activePetId) || { id: "", name: "" }; },
    activePetName() { return this.activePet.name; },
    completedCount() { return this.submittedPetIds.length; },
    allCompleted() { return this.pets.length > 0 && this.completedCount === this.pets.length; },
    isSinglePet() { return this.pets.length === 1; },
    petTabLayout() { return this.pets.length > 4 ? "tabs-overflow" : "tabs-count-" + Math.max(1, this.pets.length); },
    routeCurrent() { return this.allCompleted ? "今日记录已全部完成" : this.isSinglePet ? "唯一宠物，无需切换" : "当前：" + this.activePetName; },
    flowHint() { return this.isSinglePet ? "记录" + this.activePetName + "今天的身体状态" : "提交后自动进入下一只宠物"; },
    nextPet() {
      const index = this.pets.findIndex((pet) => pet.id === this.activePetId);
      for (let offset = 1; offset < this.pets.length; offset += 1) {
        const pet = this.pets[(index + offset) % this.pets.length];
        if (!this.isCompleted(pet.id)) return pet;
      }
      return null;
    },
    routeHint() { return this.allCompleted ? this.completedCount + "/" + this.pets.length + " 已记录" : this.isSinglePet ? "完成后结束今日记录" : this.nextPet ? "下一只：" + this.nextPet.name : "最后一只记录"; },
    submitLabel() { if (!this.nextPet) return "保存并完成今日记录"; return (this.isCompleted(this.activePetId) ? "更新并记录下一只" : "保存并记录下一只") + "：" + this.nextPet.name; },
  },
  watch: { record: { deep: true, immediate: true, handler(value) { this.localRecord = { ...value }; } } },
  methods: {
    isCompleted(petId) { return this.submittedPetIds.includes(petId); },
    markerFor(petId) { if (this.isCompleted(petId)) return "✓"; return petId === this.activePetId ? "●" : "○"; },
    submitRecord() { this.$emit("submit", { petId: this.activePetId, petName: this.activePetName, record: { ...this.localRecord } }); },
    openManage() { uni.navigateTo({ url: "/pages/records/manage" }); },
  },
};
</script>

<style scoped>
.health-panel { padding: 34rpx; }.text-button { color: #e99024; font-size: 28rpx; font-weight: 600; }
.record-flow { display: grid; gap: 20rpx; border: 2rpx solid #f0d9bb; border-radius: 36rpx; background: #fffaf3; padding: 24rpx; margin-top: 28rpx; }
.flow-heading { display: grid; gap: 6rpx; }.flow-heading text:first-child { color: #2c2925; font-size: 28rpx; font-weight: 700; }.flow-heading text:last-child { color: #8b8176; font-size: 22rpx; }
.pet-tabs { display: flex; gap: 14rpx; width: 100%; padding: 4rpx 4rpx 12rpx; white-space: nowrap; }
.pet-tabs button { display: flex; flex: 1 0 0; align-items: center; justify-content: center; gap: 12rpx; min-width: 0; min-height: 76rpx; border-radius: 26rpx; background: #f4ece2; color: #8b8176; font-size: 24rpx; font-weight: 600; box-shadow: inset 0 0 0 2rpx rgba(224,206,184,.52); }
.pet-tabs.tabs-count-1 button { flex: 0 0 300rpx; }
.pet-tabs.tabs-count-4 button { min-width: 154rpx; }
.pet-tabs.tabs-overflow button { flex: 0 0 220rpx; }
.pet-tabs button.current { background: #fff; color: #e99024; box-shadow: 0 8rpx 24rpx rgba(167,114,45,.14), inset 0 0 0 2rpx rgba(242,164,69,.3); }.pet-tabs button.completed { background: #eef9e9; color: #49aa2e; }
.tab-marker { display: flex; align-items: center; justify-content: center; width: 40rpx; height: 40rpx; border-radius: 50%; background: rgba(255,255,255,.8); }.pet-tabs button.current .tab-marker { background: #ffb84d; color: #fff; }.pet-tabs button.completed .tab-marker { background: #7ed957; color: #fff; }
.single-pet-state { display: flex; align-items: center; gap: 18rpx; min-height: 68rpx; color: #8b8176; font-size: 22rpx; }.single-pet-state text:first-child { display: flex; align-items: center; justify-content: center; width: 44rpx; height: 44rpx; flex: 0 0 44rpx; border-radius: 50%; background: #ffb84d; color: #fff; font-size: 20rpx; }
.flow-route { display: flex; justify-content: space-between; color: #8b8176; font-size: 22rpx; }.flow-route text:last-child { color: #e99024; font-weight: 600; }
.health-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24rpx; margin: 28rpx 0 32rpx; }.health-card { display: flex; min-height: 210rpx; flex-direction: column; gap: 26rpx; border-radius: 36rpx; background: #fff9f0; padding: 24rpx; }
.health-title { display: flex; align-items: center; gap: 16rpx; color: #2c2925; font-size: 28rpx; font-weight: 600; }.soft-input { display: flex; align-items: center; min-height: 68rpx; border: 2rpx solid #f1dfc8; border-radius: 999rpx; background: #fff; padding: 6rpx 8rpx 6rpx 22rpx; }.soft-input input { flex: 1; min-width: 0; height: 54rpx; color: #2c2925; font-size: 30rpx; font-weight: 700; }.soft-input text { border-radius: 999rpx; background: #fff4e4; color: #8b8176; padding: 14rpx 18rpx; font-size: 22rpx; }
.tags { display: flex; flex-wrap: wrap; gap: 12rpx; }.tags button { border-radius: 999rpx; background: #fff; color: #8b8176; padding: 12rpx 18rpx; font-size: 23rpx; }.tags button.selected { background: #ecfae6; color: #49aa2e; box-shadow: inset 0 0 0 2rpx rgba(126,217,87,.3); }
.submit-button { margin-top: 4rpx; }.complete-card { display: grid; justify-items: center; gap: 12rpx; border-radius: 36rpx; background: #f1faed; padding: 32rpx; margin-top: 28rpx; }.complete-mark { display: flex; align-items: center; justify-content: center; width: 80rpx; height: 80rpx; border-radius: 50%; background: #7ed957; color: #fff; font-size: 40rpx; font-weight: 800; }.complete-title { color: #49aa2e; font-size: 30rpx; font-weight: 700; }.complete-desc { color: #8b8176; font-size: 24rpx; }.complete-pets { display: grid; grid-template-columns: repeat(3,1fr); gap: 12rpx; width: 100%; margin: 10rpx 0; }.complete-pets text { border-radius: 24rpx; background: #fff; color: #49aa2e; padding: 18rpx; text-align: center; font-size: 22rpx; }
</style>
