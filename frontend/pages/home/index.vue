<template>
  <view class="page-shell">
    <PetSummaryCard :pet="profilePet" :pets="state.pets" :active-pet="state.profilePetName" @select="selectProfile" @add="createPet" />
    <HealthRecordFlow
      :pets="state.pets"
      :active-pet-name="state.healthPetName"
      :record="healthPet.healthRecord"
      :submitted-pet-names="state.submittedHealthPets"
      @select-pet="selectHealth"
      @submit="submitHealth"
    />
    <TaskTimeline title="今日任务列表" :tasks="state.tasks" @complete="finishTask" />
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
      return findPet(this.state.profilePetName);
    },
    healthPet() {
      return findPet(this.state.healthPetName);
    },
  },
  methods: {
    selectProfile(name) {
      selectProfilePet(name);
    },
    selectHealth(name) {
      selectHealthPet(name);
    },
    createPet(pet) {
      addPet(pet);
    },
    submitHealth(payload) {
      const result = saveHealthRecord(payload.petName, payload.record);
      uni.showToast({ title: result.allCompleted ? "所有宠物今日记录已完成" : `${payload.petName}已保存，正在记录${result.nextPetName}`, icon: "none" });
    },
    finishTask(taskId) {
      completeTask(taskId);
      uni.showToast({ title: "任务已完成", icon: "none" });
    },
  },
};
</script>
