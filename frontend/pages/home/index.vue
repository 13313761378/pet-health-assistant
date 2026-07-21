<template>
  <view class="page-shell">
    <PetSummaryCard :pet="profilePet" :pets="state.pets" :active-pet-id="state.profilePetId" @select="selectProfile" @add="createPet" />
    <HealthRecordFlow
      v-if="state.pets.length"
      :pets="state.pets"
      :active-pet-id="state.healthPetId"
      :record="healthPet.healthRecord"
      :submitted-pet-ids="state.submittedHealthPetIds"
      @select-pet="selectHealth"
      @submit="submitHealth"
    />
    <TaskTimeline title="今日任务列表" :tasks="state.tasks" :pets="state.pets" @complete="finishTask" />
  </view>
</template>

<script>
import { addPet, appState, completeTask, findPet, saveHealthRecord, selectHealthPet, selectProfilePet } from "@/common/store.js";
import PetSummaryCard from "@/components/PetSummaryCard.vue";
import HealthRecordFlow from "@/components/HealthRecordFlow.vue";
import TaskTimeline from "@/components/TaskTimeline.vue";

export default {
  components: {
    PetSummaryCard,
    HealthRecordFlow,
    TaskTimeline,
  },
  data() {
    return {
      state: appState,
    };
  },
  computed: {
    profilePet() {
      return findPet(this.state.profilePetId);
    },
    healthPet() {
      return findPet(this.state.healthPetId);
    },
  },
  methods: {
    selectProfile(petId) {
      selectProfilePet(petId);
    },
    selectHealth(petId) {
      selectHealthPet(petId);
    },
    createPet(pet) {
      addPet(pet);
    },
    submitHealth(payload) {
      const result = saveHealthRecord(payload.petId, payload.record);
      const title = result.allCompleted ? "所有宠物今日记录已完成" : payload.petName + "已保存，正在记录" + (result.nextPetName || "");
      uni.showToast({ title, icon: "none" });
    },
    finishTask(taskId) {
      completeTask(taskId);
      uni.showToast({ title: "任务状态已更新", icon: "none" });
    },
  },
};
</script>