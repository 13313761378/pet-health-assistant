import { reactive } from "vue";

const PETS_KEY = "pet-health-assistant.pets.v2";
const TASKS_KEY = "pet-health-assistant.tasks.v2";
const HEALTH_KEY = "pet-health-assistant.health-records.v2";
const clone = (value) => JSON.parse(JSON.stringify(value));
const blankRecord = () => ({ feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" });
const emptyPet = { id: "", name: "", desc: "", avatar: "", days: 0, healthScore: 0, healthLabel: "待记录", taskProgress: "0/0", healthRecord: blankRecord() };

function createId(prefix) {
  return prefix + "-" + (globalThis.crypto?.randomUUID?.() || Date.now() + "-" + Math.random().toString(16).slice(2));
}

function loadArray(key) {
  try {
    const stored = uni.getStorageSync(key);
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn(error);
    return [];
  }
}

function loadObject(key) {
  try {
    const stored = uni.getStorageSync(key);
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch (error) {
    console.warn(error);
    return {};
  }
}

const initialPets = loadArray(PETS_KEY).map((pet) => ({ ...pet, id: String(pet.id || createId("pet")), healthRecord: pet.healthRecord || blankRecord() }));
const firstPetId = initialPets[0]?.id || "";

export const appState = reactive({
  pets: initialPets,
  profilePetId: firstPetId,
  healthPetId: firstPetId,
  submittedHealthPetIds: [],
  tasks: loadArray(TASKS_KEY),
  healthRecords: loadObject(HEALTH_KEY),
});

function persistAll() {
  try {
    uni.setStorageSync(PETS_KEY, clone(appState.pets));
    uni.setStorageSync(TASKS_KEY, clone(appState.tasks));
    uni.setStorageSync(HEALTH_KEY, clone(appState.healthRecords));
  } catch (error) {
    console.warn(error);
  }
}

export function findPet(petId) {
  return appState.pets.find((pet) => pet.id === petId) || emptyPet;
}

export function selectProfilePet(petId) {
  if (appState.pets.some((pet) => pet.id === petId)) appState.profilePetId = petId;
}

export function selectHealthPet(petId) {
  if (appState.pets.some((pet) => pet.id === petId)) appState.healthPetId = petId;
}

export function addPet(pet) {
  const profile = {
    ...pet,
    id: String(pet.id || createId("pet")),
    avatar: pet.avatar || "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=640&q=82",
    desc: pet.breed + " · " + pet.age + "岁 · " + pet.gender,
    days: Number(pet.days || 0),
    healthScore: 100,
    taskProgress: "0/0",
    healthRecord: blankRecord(),
  };
  appState.pets.push(profile);
  appState.profilePetId = profile.id;
  appState.healthPetId ||= profile.id;
  persistAll();
  return profile;
}

export function deletePet(petId) {
  const index = appState.pets.findIndex((pet) => pet.id === petId);
  if (index < 0) return false;
  appState.pets.splice(index, 1);
  appState.tasks = appState.tasks.filter((task) => !(task.petIds || []).includes(petId));
  delete appState.healthRecords[petId];
  appState.submittedHealthPetIds = appState.submittedHealthPetIds.filter((id) => id !== petId);
  const nextPetId = appState.pets[0]?.id || "";
  if (appState.profilePetId === petId) appState.profilePetId = nextPetId;
  if (appState.healthPetId === petId) appState.healthPetId = nextPetId;
  persistAll();
  return true;
}

export function saveHealthRecord(petId, record) {
  const pet = findPet(petId);
  if (!pet.id) return { nextPetId: null, nextPetName: null, allCompleted: false };
  pet.healthRecord = { ...record };
  const today = new Date().toISOString().slice(0, 10);
  appState.healthRecords[petId] ||= {};
  appState.healthRecords[petId][today] = { ...record };
  if (!appState.submittedHealthPetIds.includes(petId)) appState.submittedHealthPetIds.push(petId);

  const startIndex = appState.pets.findIndex((item) => item.id === petId);
  let nextPet = null;
  for (let offset = 1; offset < appState.pets.length; offset += 1) {
    const candidate = appState.pets[(startIndex + offset) % appState.pets.length];
    if (!appState.submittedHealthPetIds.includes(candidate.id)) {
      nextPet = candidate;
      break;
    }
  }
  if (nextPet) appState.healthPetId = nextPet.id;
  persistAll();
  return {
    nextPetId: nextPet?.id || null,
    nextPetName: nextPet?.name || null,
    allCompleted: appState.submittedHealthPetIds.length === appState.pets.length,
  };
}

export function completeTask(taskId) {
  const task = appState.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.done = !task.done;
  persistAll();
}