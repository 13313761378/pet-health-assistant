<template>
  <view class="page-shell">
    <PetSummaryCard :pet="currentPet" :pets="pets" :active-pet="selectedPetName" @select="selectPet" />
    <HealthRecordEditor :record="currentHealthRecord" :pet-name="currentPet.name" />
    <TaskTimeline :tasks="tasks" />
  </view>
</template>

<script>
import { healthRecord, pets, tasks } from "@/common/mock.js";
import PetSummaryCard from "@/components/PetSummaryCard.vue";
import HealthRecordEditor from "@/components/HealthRecordEditor.vue";
import TaskTimeline from "@/components/TaskTimeline.vue";

export default {
  components: {
    PetSummaryCard,
    HealthRecordEditor,
    TaskTimeline,
  },
  data() {
    return {
      pets,
      selectedPetName: pets[0].name,
      healthRecord,
      tasks,
    };
  },
  computed: {
    currentPet() {
      return this.pets.find((item) => item.name === this.selectedPetName) || this.pets[0];
    },
    currentHealthRecord() {
      return this.currentPet.healthRecord || this.healthRecord;
    },
  },
  methods: {
    selectPet(name) {
      this.selectedPetName = name;
    },
  },
};
</script>
