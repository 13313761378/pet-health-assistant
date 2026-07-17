import { reactive } from "vue";
import { pets as petSeeds } from "@/common/mock.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

function loadStoredPets() {
  try {
    const stored = uni.getStorageSync("pet-health-assistant.pets.v1");
    return Array.isArray(stored) && stored.length ? stored : clone(petSeeds);
  } catch (error) {
    console.warn(error);
    return clone(petSeeds);
  }
}

const initialPets = loadStoredPets();

export const appState = reactive({
  pets: initialPets,
  profilePetName: initialPets[0]?.name || "",
  healthPetName: initialPets[0]?.name || "",
  submittedHealthPets: [],
  tasks: [
    { id: "task-1", petName: "豆包", scope: "pet", name: "早餐后补充益生菌", time: "08:30", note: "拌入半包，已完成", done: true },
    { id: "task-2", petName: "奶糖", scope: "pet", name: "日常梳毛", time: "10:00", note: "换毛期增加梳理频率，待完成", done: false },
    { id: "task-3", petName: "豆包", scope: "pet", name: "傍晚遛弯", time: "18:30", note: "避开高温路面，待完成", done: false },
    { id: "task-4", petName: "团子", scope: "pet", name: "晚间喂食", time: "19:00", note: "湿粮 1 份，少量补充饮水，待完成", done: false },
    { id: "task-5", petName: "共同任务", scope: "shared", name: "清洗食盆与水碗", time: "20:00", note: "全部宠物共用区域，待完成", done: false },
    { id: "task-6", petName: "奶糖", scope: "pet", name: "清洁耳朵", time: "21:00", note: "使用温和护理液，待完成", done: false },
  ],
});

export function findPet(name) {
  return appState.pets.find((pet) => pet.name === name) || appState.pets[0];
}

export function selectProfilePet(name) {
  if (appState.pets.some((pet) => pet.name === name)) appState.profilePetName = name;
}

export function selectHealthPet(name) {
  if (appState.pets.some((pet) => pet.name === name)) appState.healthPetName = name;
}

export function addPet(pet) {
  const profile = {
    ...pet,
    avatar: pet.avatar || "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=640&q=82",
    desc: `${pet.breed} · ${pet.age}岁 · ${pet.gender}`,
    days: 0,
    healthScore: 100,
    taskProgress: "0/0",
    healthRecord: { feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" },
  };
  appState.pets.push(profile);
  appState.profilePetName = profile.name;
  try { uni.setStorageSync("pet-health-assistant.pets.v1", clone(appState.pets)); } catch (error) { console.warn(error); }
  return profile;
}

export function saveHealthRecord(petName, record) {
  const pet = findPet(petName);
  if (!pet) return { nextPetName: null, allCompleted: false };
  pet.healthRecord = { ...record };
  if (!appState.submittedHealthPets.includes(petName)) appState.submittedHealthPets.push(petName);

  const startIndex = appState.pets.findIndex((item) => item.name === petName);
  let nextPetName = null;
  for (let offset = 1; offset < appState.pets.length; offset += 1) {
    const candidate = appState.pets[(startIndex + offset) % appState.pets.length];
    if (!appState.submittedHealthPets.includes(candidate.name)) {
      nextPetName = candidate.name;
      break;
    }
  }
  if (nextPetName) appState.healthPetName = nextPetName;
  return {
    nextPetName,
    allCompleted: appState.submittedHealthPets.length === appState.pets.length,
  };
}

export function completeTask(taskId) {
  const task = appState.tasks.find((item) => item.id === taskId);
  if (!task || task.done) return;
  task.done = true;
  task.note = task.note.includes("待完成") ? task.note.replace("待完成", "已完成") : `${task.note}，已完成`;
}
