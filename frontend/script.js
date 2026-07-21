document.querySelectorAll("input, select, textarea").forEach((control) => {
  control.classList.add("native-control");
  if (control.matches('[type="checkbox"], [type="radio"]')) control.classList.add("native-toggle");
});
document.querySelectorAll("label").forEach((label) => label.classList.add("native-label"));

const navButtons = document.querySelectorAll(".bottom-nav button");
const pages = document.querySelectorAll(".page");
const modal = document.querySelector("#task-modal");
const petModal = document.querySelector("#pet-modal");
const toast = document.querySelector("#app-toast");
let previousPageId = "mine-page";
let activeBreedCategory = "dog";
let activeRecordPetId = "";
let activePetId = "";
let activeHealthPetId = "";
let activeEditingTaskId = "";
let toastTimer;
const submittedHealthPetIds = new Set();
let draggedPetId = "";
let pointerPetSort = null;
let suppressPetSelection = false;
let homeCarouselKey = "__add__";
let petProfileOrder = [];

const petProfiles = Object.create(null);

const PET_STORAGE_KEY = "pet-health-assistant.pet-profiles.v2";
const PET_ORDER_STORAGE_KEY = "pet-health-assistant.pet-order.v2";
const LEGACY_PET_STORAGE_KEY = "pet-health-assistant.pet-profiles.v1";
const LEGACY_PET_ORDER_STORAGE_KEY = "pet-health-assistant.pet-order.v1";
const TASK_STORAGE_KEY = "pet-health-assistant.tasks.v2";
const HEALTH_STORAGE_KEY = "pet-health-assistant.health-records.v2";
const PET_ACCESS_TOKEN_KEY = "petHealthAccessToken";
let pendingPetAvatar = "";

function createLocalId(prefix) {
  const token = globalThis.crypto?.randomUUID?.() || Date.now() + "-" + Math.random().toString(16).slice(2);
  return prefix + "-" + token;
}

function syncPetProfileOrder(preferredOrder = petProfileOrder) {
  const availableIds = Object.keys(petProfiles);
  const validPreferredIds = Array.isArray(preferredOrder)
    ? preferredOrder.filter((petId, index) => petProfiles[petId] && preferredOrder.indexOf(petId) === index)
    : [];
  petProfileOrder = [
    ...validPreferredIds,
    ...availableIds.filter((petId) => !validPreferredIds.includes(petId)),
  ];
}

function getPetIds() {
  syncPetProfileOrder();
  return [...petProfileOrder];
}

function migrateStoredPetEntries(stored) {
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return new Map();
  const migrated = new Map();
  Object.entries(stored).forEach(([legacyKey, rawPet]) => {
    if (!rawPet || typeof rawPet !== "object" || !rawPet.name) return;
    const petId = String(rawPet.id || (legacyKey.startsWith("pet-") ? legacyKey : createLocalId("pet")));
    migrated.set(legacyKey, { ...rawPet, id: petId });
  });
  return migrated;
}

function restorePetProfiles() {
  try {
    const currentStored = JSON.parse(localStorage.getItem(PET_STORAGE_KEY) || "null");
    const legacyStored = currentStored ? null : JSON.parse(localStorage.getItem(LEGACY_PET_STORAGE_KEY) || "null");
    const migrated = migrateStoredPetEntries(currentStored || legacyStored);
    migrated.forEach((pet) => {
      pet.record ||= { feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" };
      petProfiles[pet.id] = pet;
    });

    const currentOrder = JSON.parse(localStorage.getItem(PET_ORDER_STORAGE_KEY) || "null");
    const legacyOrder = currentOrder ? null : JSON.parse(localStorage.getItem(LEGACY_PET_ORDER_STORAGE_KEY) || "null");
    const migratedOrder = (currentOrder || legacyOrder || []).map((key) => {
      if (petProfiles[key]) return key;
      return migrated.get(key)?.id;
    }).filter(Boolean);
    syncPetProfileOrder(migratedOrder);

    if (!currentStored && legacyStored) {
      persistPetProfiles();
      localStorage.removeItem(LEGACY_PET_STORAGE_KEY);
      localStorage.removeItem(LEGACY_PET_ORDER_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("无法读取本地宠物资料，将从空列表开始", error);
    syncPetProfileOrder();
  }
}

function findPetIdByName(name) {
  return getPetIds().find((petId) => petProfiles[petId]?.name === name) || "";
}
function persistPetProfiles() {
  try {
    syncPetProfileOrder();
    localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(petProfiles));
    localStorage.setItem(PET_ORDER_STORAGE_KEY, JSON.stringify(petProfileOrder));
  } catch (error) {
    console.error("保存宠物资料失败", error);
    throw new Error("照片或宠物资料占用空间过大，请更换较小的照片");
  }
}

function getPetAccessToken() {
  return localStorage.getItem(PET_ACCESS_TOKEN_KEY) || "";
}

async function requestPetApi(path, options = {}) {
  const token = getPetAccessToken();
  if (!token) return null;
  const response = await fetch(`/api/pets${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "宠物资料同步失败");
  }
  return response.status === 204 ? null : response.json();
}

restorePetProfiles();
if (!petProfiles[activePetId]) activePetId = getPetIds()[0] || "";
if (!petProfiles[activeRecordPetId]) activeRecordPetId = activePetId;
if (!petProfiles[activeHealthPetId]) activeHealthPetId = activePetId;
homeCarouselKey = activePetId || "__add__";

const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const initialRecordDate = new Date();
initialRecordDate.setHours(0, 0, 0, 0);

function getWeekStart(date) {
  const monday = new Date(date);
  const offsetFromMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offsetFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

let weekStartDate = getWeekStart(initialRecordDate);
let selectedRecordDate = new Date(initialRecordDate);
let lastKnownRecordTodayKey = formatLocalDateKey(initialRecordDate);

function restoreJsonStore(storageKey, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    return stored && typeof stored === "object" ? stored : fallback;
  } catch (error) {
    console.warn("无法读取本地数据：" + storageKey, error);
    return fallback;
  }
}

const dailyRecordData = restoreJsonStore(HEALTH_STORAGE_KEY, Object.create(null));
const restoredTasks = restoreJsonStore(TASK_STORAGE_KEY, []);
let taskData = Array.isArray(restoredTasks) ? restoredTasks : [];

function persistTasks() {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(taskData));
}

function persistHealthRecords() {
  localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(dailyRecordData));
}
const breedData = {
  dog: {
    title: "狗类百科",
    breeds: [
      {
        name: "金毛寻回犬",
        desc: "温顺友好，适合家庭陪伴，运动量较高。",
        image: "assets/breeds/golden-retriever.jpg",
        intro: "金毛寻回犬性格温和、亲人，对家庭成员非常友好，适合有稳定陪伴和户外活动时间的家庭。",
        info: {
          基本信息: "中大型犬 / 温顺 / 适合家庭",
          饭量: "较大，建议定时定量",
          寿命: "10-12年",
          掉毛: "较多",
          体味: "中等",
          性格: "温顺、亲人、友好",
          运动量: "较高，需要每日运动",
          领养建议: "适合有时间陪伴和户外活动条件的家庭",
        },
      },
      {
        name: "拉布拉多",
        desc: "亲人稳定，学习能力强，适合陪伴和训练。",
        image: "assets/breeds/labrador-retriever.jpg",
        intro: "拉布拉多活泼友善，适应力强，喜欢与人互动，需要稳定运动和饮食管理。",
        info: {
          基本信息: "中大型犬 / 友好 / 易训练",
          饭量: "较大，注意避免过量",
          寿命: "10-12年",
          掉毛: "中等偏多",
          体味: "中等",
          性格: "亲人、稳定、聪明",
          运动量: "较高，需要规律消耗精力",
          领养建议: "适合愿意训练并能保证运动量的家庭",
        },
      },
      {
        name: "柯基犬",
        desc: "活泼机警，腿短身长，需要关注体重。",
        image: "assets/breeds/corgi.jpg",
        intro: "柯基犬性格活泼亲人，体型小但精力充沛，日常需关注腰椎和体重管理。",
        info: {
          基本信息: "小型犬 / 易胖 / 腿短身长",
          饭量: "中等，需控制热量",
          寿命: "12-15年",
          掉毛: "较多",
          体味: "较轻",
          性格: "活泼、机警、亲人",
          运动量: "中等，需要每日散步",
          领养建议: "避免频繁上下楼，关注腰椎压力",
        },
      },
      {
        name: "边境牧羊犬",
        desc: "聪明敏捷，精力旺盛，需要大量互动。",
        image: "assets/breeds/border-collie.jpg",
        intro: "边境牧羊犬学习能力强，运动和脑力需求都高，适合有训练经验的家庭。",
        info: {
          基本信息: "中型犬 / 高智商 / 高精力",
          饭量: "中等偏大，随运动量调整",
          寿命: "12-15年",
          掉毛: "中等",
          体味: "较轻",
          性格: "聪明、敏捷、专注",
          运动量: "很高，需要训练和游戏",
          领养建议: "适合能提供大量陪伴和训练的家庭",
        },
      },
      {
        name: "泰迪",
        desc: "体型小巧，亲人活泼，适合城市家庭。",
        image: "assets/breeds/toy-poodle.jpg",
        intro: "泰迪体型小、适应性强，喜欢陪伴，需要规律梳毛和情绪陪伴。",
        info: {
          基本信息: "小型犬 / 适合公寓 / 需美容",
          饭量: "较小，建议少量定时",
          寿命: "12-16年",
          掉毛: "较少",
          体味: "较轻",
          性格: "亲人、活泼、敏感",
          运动量: "中等，短时多次活动",
          领养建议: "适合愿意定期护理毛发的家庭",
        },
      },
      {
        name: "柴犬",
        desc: "独立机敏，爱干净，有鲜明个性。",
        image: "assets/breeds/shiba-inu.jpg",
        intro: "柴犬独立、警觉，日常较爱干净，但训练需要耐心和一致性。",
        info: {
          基本信息: "中小型犬 / 独立 / 爱干净",
          饭量: "中等，注意体重",
          寿命: "12-15年",
          掉毛: "换毛期较多",
          体味: "较轻",
          性格: "独立、机敏、有主见",
          运动量: "中等偏高",
          领养建议: "适合有耐心并能稳定训练的家庭",
        },
      },
    ],
  },
  cat: {
    title: "猫类百科",
    breeds: [
      {
        name: "英国短毛猫",
        desc: "性格稳定，圆润安静，适合室内陪伴。",
        image: "assets/breeds/british-shorthair.jpg",
        intro: "英国短毛猫性格温和稳定，适合室内饲养，日常需注意体重和毛发护理。",
        info: {
          基本信息: "中型猫 / 圆润 / 室内友好",
          饭量: "中等，需控制体重",
          寿命: "12-16年",
          掉毛: "中等",
          体味: "较轻",
          性格: "安静、稳定、亲人",
          运动量: "中等偏低",
          领养建议: "适合喜欢安静陪伴的家庭",
        },
      },
      {
        name: "美国短毛猫",
        desc: "活泼健康，适应力强，亲人不粘人。",
        image: "assets/breeds/american-shorthair.jpg",
        intro: "美国短毛猫体质较好，活泼但不过分粘人，适合多数家庭环境。",
        info: {
          基本信息: "中型猫 / 适应力强 / 体质好",
          饭量: "中等，建议规律喂养",
          寿命: "13-17年",
          掉毛: "中等",
          体味: "较轻",
          性格: "活泼、独立、友好",
          运动量: "中等",
          领养建议: "适合希望互动又保留空间感的家庭",
        },
      },
      {
        name: "布偶猫",
        desc: "温柔亲人，外形优雅，需要毛发护理。",
        image: "assets/breeds/ragdoll.jpg",
        intro: "布偶猫性格温顺，喜欢陪伴，毛发较长，需要定期梳理和清洁。",
        info: {
          基本信息: "大型猫 / 长毛 / 温顺",
          饭量: "中等偏大",
          寿命: "12-15年",
          掉毛: "较多",
          体味: "较轻",
          性格: "温柔、亲人、安静",
          运动量: "中等偏低",
          领养建议: "适合能定期梳毛并耐心陪伴的家庭",
        },
      },
      {
        name: "暹罗猫",
        desc: "聪明外向，表达欲强，喜欢互动。",
        image: "assets/breeds/siamese.jpg",
        intro: "暹罗猫聪明活泼，喜欢和主人交流，需要较多互动和陪伴。",
        info: {
          基本信息: "中型猫 / 短毛 / 高互动",
          饭量: "中等",
          寿命: "12-16年",
          掉毛: "较少",
          体味: "较轻",
          性格: "聪明、外向、粘人",
          运动量: "中等偏高",
          领养建议: "适合愿意经常互动的家庭",
        },
      },
      {
        name: "缅因猫",
        desc: "体型较大，温和沉稳，需要空间。",
        image: "assets/breeds/maine-coon.jpg",
        intro: "缅因猫体型大但性格温和，毛发较长，需要较大的生活空间和护理时间。",
        info: {
          基本信息: "大型猫 / 长毛 / 温和",
          饭量: "较大，按体重管理",
          寿命: "12-15年",
          掉毛: "较多",
          体味: "较轻",
          性格: "沉稳、友好、耐心",
          运动量: "中等",
          领养建议: "适合空间充足并能定期护理的家庭",
        },
      },
      {
        name: "无毛猫",
        desc: "亲人粘人，皮肤护理需求较高。",
        image: "assets/breeds/sphynx.jpg",
        intro: "无毛猫亲人且需要保暖，皮肤油脂护理和环境温度管理很重要。",
        info: {
          基本信息: "中型猫 / 无毛 / 需保暖",
          饭量: "中等偏大，代谢较高",
          寿命: "12-15年",
          掉毛: "几乎无",
          体味: "需定期清洁皮肤",
          性格: "亲人、粘人、活泼",
          运动量: "中等",
          领养建议: "适合能细致护理皮肤和温度的家庭",
        },
      },
    ],
  },
};

const breedFilterMeta = {
  dog: {
    "金毛寻回犬": { primary: "大型犬", personality: ["温顺", "黏人"], difficulty: "一般", shedding: "多", exercise: "高", environment: "需要较大空间" },
    "拉布拉多": { primary: "大型犬", personality: ["温顺", "活泼", "黏人"], difficulty: "新手友好", shedding: "多", exercise: "高", environment: "需要较大空间" },
    "柯基犬": { primary: "小型犬", personality: ["活泼", "黏人"], difficulty: "一般", shedding: "多", exercise: "中等", environment: "公寓适合" },
    "边境牧羊犬": { primary: "中型犬", personality: ["活泼", "独立"], difficulty: "较高", shedding: "中等", exercise: "高", environment: "需要较大空间" },
    "泰迪": { primary: "小型犬", personality: ["活泼", "黏人"], difficulty: "新手友好", shedding: "少", exercise: "中等", environment: "公寓适合" },
    "柴犬": { primary: "中型犬", personality: ["独立", "活泼"], difficulty: "较高", shedding: "多", exercise: "中等", environment: "公寓适合" },
  },
  cat: {
    "英国短毛猫": { primary: "短毛猫", personality: ["温顺", "独立"], difficulty: "新手友好", shedding: "中等", exercise: "低", environment: "公寓适合" },
    "美国短毛猫": { primary: "短毛猫", personality: ["活泼", "独立"], difficulty: "新手友好", shedding: "中等", exercise: "中等", environment: "公寓适合" },
    "布偶猫": { primary: "长毛猫", personality: ["温顺", "黏人"], difficulty: "一般", shedding: "多", exercise: "低", environment: "公寓适合" },
    "暹罗猫": { primary: "短毛猫", personality: ["活泼", "黏人"], difficulty: "一般", shedding: "少", exercise: "中等", environment: "公寓适合" },
    "缅因猫": { primary: "长毛猫", personality: ["温顺", "独立"], difficulty: "较高", shedding: "多", exercise: "中等", environment: "需要较大空间" },
    "无毛猫": { primary: "无毛猫", personality: ["活泼", "黏人"], difficulty: "较高", shedding: "少", exercise: "中等", environment: "公寓适合" },
  },
};

const breedFilterOptions = {
  dog: ["全部", "小型犬", "中型犬", "大型犬", "巨型犬"],
  cat: ["全部", "短毛猫", "长毛猫", "卷毛猫", "无毛猫"],
};
const commonBreedFilters = [
  { key: "personality", label: "性格", values: ["全部", "温顺", "活泼", "独立", "黏人"] },
  { key: "difficulty", label: "饲养难度", values: ["全部", "新手友好", "一般", "较高"] },
  { key: "shedding", label: "掉毛程度", values: ["全部", "少", "中等", "多"] },
  { key: "exercise", label: "运动需求", values: ["全部", "低", "中等", "高"] },
  { key: "environment", label: "居住环境", values: ["全部", "公寓适合", "需要较大空间"] },
];
let breedFilterState = createDefaultBreedFilters();
let breedFilterExpanded = false;
let wikiSearchQuery = "";

function createDefaultBreedFilters() {
  return { primary: "全部", personality: "全部", difficulty: "全部", shedding: "全部", exercise: "全部", environment: "全部" };
}

function getFilteredBreeds(category) {
  return breedData[category].breeds
    .map((breed, index) => ({ breed, index, meta: breedFilterMeta[category][breed.name] }))
    .filter(({ breed, meta }) => {
      const matchesFilters = !meta || Object.entries(breedFilterState).every(([key, value]) => {
        if (value === "全部") return true;
        return Array.isArray(meta[key]) ? meta[key].includes(value) : meta[key] === value;
      });
      const searchText = `${breed.name} ${breed.desc}`.toLowerCase();
      return matchesFilters && (!wikiSearchQuery || searchText.includes(wikiSearchQuery));
    });
}

function renderHomeFilters(category) {
  const container = document.querySelector("#wiki-breed-filters");
  if (!container) return;
  const groups = [
    { key: "primary", label: category === "dog" ? "体型分类" : "毛发分类", values: breedFilterOptions[category] },
    ...commonBreedFilters,
  ];
  container.classList.toggle("expanded", breedFilterExpanded);
  container.innerHTML = `<div class="breed-filter-body">${groups.map((group) => `<div class="breed-filter-row"><span>${group.label}</span><div>${group.values.map((value) => `<button class="${breedFilterState[group.key] === value ? "active" : ""}" type="button" data-filter-key="${group.key}" data-filter-value="${value}">${value}</button>`).join("")}</div></div>`).join("")}</div>`;
}

function renderBreedFilters(containerId, category, resultCount) {
  const container = document.querySelector(`#${containerId}`);
  if (!container) return;
  const activeCount = Object.values(breedFilterState).filter((value) => value !== "全部").length;
  const groups = [
    { key: "primary", label: category === "dog" ? "体型分类" : "毛发分类", values: breedFilterOptions[category] },
    ...commonBreedFilters,
  ];
  container.classList.toggle("expanded", breedFilterExpanded);
  container.innerHTML = `
    <div class="breed-filter-head">
      <div><strong>筛选品种</strong><span>${activeCount ? `已选择 ${activeCount} 个条件` : "需要时可展开筛选"}</span></div>
      <div class="breed-filter-actions"><em>${resultCount} 个结果</em><button type="button" data-toggle-breed-filters aria-expanded="${breedFilterExpanded}">${breedFilterExpanded ? "收起" : "展开筛选"}<i>⌄</i></button></div>
    </div>
    <div class="breed-filter-body">
      ${groups.map((group) => `<div class="breed-filter-row"><span>${group.label}</span><div>${group.values.map((value) => `<button class="${breedFilterState[group.key] === value ? "active" : ""}" type="button" data-filter-key="${group.key}" data-filter-value="${value}">${value}</button>`).join("")}</div></div>`).join("")}
    </div>`;
}

function renderBreedCards(targetId, category) {
  const matches = getFilteredBreeds(category);
  const isHome = targetId === "wiki-inline-breed-list";
  if (isHome) {
    renderHomeFilters(category);
    document.querySelector("#wiki-result-count").textContent = `${matches.length} 个品种`;
  } else {
    renderBreedFilters("breed-list-filters", category, matches.length);
  }
  const target = document.querySelector(`#${targetId}`);
  const displayedMatches = isHome ? matches.slice(0, 6) : matches;
  target.innerHTML = matches.length
    ? displayedMatches.map(({ breed, index, meta }) => `<button class="breed-list-card ${isHome ? "wiki-home-breed-card" : ""}" type="button" data-breed-index="${index}"><img class="wiki-breed-image" src="${breed.image}" alt="${breed.name}" loading="lazy" />${isHome ? '<i class="wiki-breed-arrow">→</i>' : ""}<div><small>${meta?.environment || "适合家庭"} · ${meta?.exercise || "中等"}运动</small><strong>${breed.name}</strong><span>${breed.desc}</span></div></button>`).join("")
    : `<div class="breed-filter-empty"><strong>没有找到匹配品种</strong><span>可以减少筛选条件后再试</span><button type="button" data-reset-breed-filters>重置筛选</button></div>`;
}
function showWikiView(viewId) {
  document
    .querySelectorAll("#wiki-page .wiki-view")
    .forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${viewId}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("active");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("active");
  }, 1800);
}

function showPage(pageId, navTarget) {
  pages.forEach((page) => page.classList.remove("active"));
  navButtons.forEach((item) => item.classList.remove("active"));
  document.querySelector(`#${pageId}`).classList.add("active");
  if (navTarget) {
    document.querySelector(`.bottom-nav button[data-target="${navTarget}"]`)?.classList.add("active");
  }
  if (pageId === "record-manage-page") renderRecordManagement();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setSegmentedValue(selector, value) {
  const group = document.querySelector(selector);
  if (!group) return;
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("selected", button.textContent.trim() === value);
  });
}

function parseRecordNumber(value) {
  return Number.parseFloat(String(value ?? "0")) || 0;
}

function renderManagedRecord(record, dateKey) {
  document.querySelector("#record-manage-page").dataset.recordDate = dateKey || "";
  document.querySelector("#manage-date-label").textContent = dateKey ? formatFullDate(parseLocalDateKey(dateKey)) : "暂无记录";
  document.querySelector("#manage-feeding").value = parseRecordNumber(record?.feeding);
  document.querySelector("#manage-walk").value = parseRecordNumber(record?.walk);
  document.querySelector("#manage-weight").value = parseRecordNumber(record?.weight);
  setSegmentedValue("#manage-water", record?.water || "正常");
  setSegmentedValue("#manage-stool", record?.stool || "正常");
  setSegmentedValue("#manage-mood", record?.mood || "正常");
}

function renderRecordManagement(selectedDateKey) {
  const records = dailyRecordData[activeRecordPetId] || Object.create(null);
  const entries = Object.entries(records).sort(([firstDate], [secondDate]) => secondDate.localeCompare(firstDate));
  const historyList = document.querySelector("#record-manage-page .history-list");
  historyList.innerHTML = entries.map(([dateKey, record]) =>
    '<button class="history-item" type="button" data-record-date="' + escapePetMarkup(dateKey) + '">' +
    '<time>' + escapePetMarkup(formatFullDate(parseLocalDateKey(dateKey))) + '</time><span>喂食 ' +
    escapePetMarkup(record.feeding) + ' · 遛弯 ' + escapePetMarkup(record.walk) + '</span></button>'
  ).join("");
  const targetDateKey = selectedDateKey && records[selectedDateKey] ? selectedDateKey : entries[0]?.[0] || "";
  historyList.querySelector('[data-record-date="' + CSS.escape(targetDateKey) + '"]')?.classList.add("active");
  renderManagedRecord(records[targetDateKey], targetDateKey);
}

function saveManagedRecord() {
  const pet = petProfiles[activeRecordPetId];
  const dateKey = document.querySelector("#record-manage-page").dataset.recordDate;
  if (!pet || !dateKey) { showToast("当前没有可修改的宠物记录"); return; }
  const record = {
    feeding: Number(document.querySelector("#manage-feeding").value || 0) + " 勺",
    walk: Number(document.querySelector("#manage-walk").value || 0) + " 公里",
    weight: Number(document.querySelector("#manage-weight").value || 0) + " kg",
    water: document.querySelector("#manage-water .selected")?.textContent.trim() || "正常",
    stool: document.querySelector("#manage-stool .selected")?.textContent.trim() || "正常",
    mood: document.querySelector("#manage-mood .selected")?.textContent.trim() || "正常",
  };
  dailyRecordData[pet.id] ||= Object.create(null);
  dailyRecordData[pet.id][dateKey] = record;
  if (dateKey === formatLocalDateKey(new Date())) {
    pet.record = {
      feeding: parseRecordNumber(record.feeding),
      walk: parseRecordNumber(record.walk),
      weight: parseRecordNumber(record.weight),
      water: record.water,
      stool: record.stool,
      mood: record.mood,
    };
    persistPetProfiles();
  }
  persistHealthRecords();
  renderRecordManagement(dateKey);
  renderDailyRecord();
  showToast("当天记录修改已保存");
}
function formatFullDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatLocalDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseLocalDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function renderWeekCalendar() {
  const title = document.querySelector("#week-range-title");
  title.textContent = formatFullDate(selectedRecordDate);
  document.querySelectorAll("#records-page .calendar-row button").forEach((button, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    button.dataset.date = formatLocalDateKey(date);
    button.querySelector("span").textContent = weekLabels[index];
    button.querySelector("strong").textContent = String(date.getDate());
    button.classList.toggle("selected", date.toDateString() === selectedRecordDate.toDateString());
  });
  renderDailyRecord();
}

function syncRecordCalendarToToday(force = false) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDateKey(today);
  if (!force && todayKey === lastKnownRecordTodayKey) return;
  lastKnownRecordTodayKey = todayKey;
  selectedRecordDate = today;
  weekStartDate = getWeekStart(today);
  renderWeekCalendar();
}
function formatShortDate(date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function getRecordForActivePet(key) {
  if (!activeRecordPetId) return null;
  return dailyRecordData[activeRecordPetId]?.[key] || null;
}
function updateRecordsPet(petName) {
  const pet = petProfiles[petName];
  const avatar = document.querySelector("#records-pet-avatar");
  if (!pet) {
    activeRecordPetId = "";
    avatar.hidden = true;
    avatar.removeAttribute("src");
    avatar.alt = "";
    document.querySelector("#records-pet-name").textContent = "暂无宠物";
    document.querySelector("#records-pet-desc").textContent = "请先在首页新增宠物";
    document.querySelector("#records-pet-score").textContent = "--";
    document.querySelector("#record-score-value").textContent = "--";
    document.querySelector("#record-score-circle").textContent = "0";
    document.querySelector("#record-score-copy").textContent = "新增宠物后即可查看健康档案。";
    document.querySelector("#record-status").textContent = "无宠物";
    document.querySelector("#record-metric-list")?.replaceChildren();
    return;
  }
  activeRecordPetId = petName;
  avatar.hidden = false;
  avatar.src = pet.avatar;
  avatar.alt = `${pet.name}照片`;
  document.querySelector("#records-pet-name").textContent = pet.name;
  document.querySelector("#records-pet-desc").textContent = pet.desc;
  document.querySelector("#records-pet-score").textContent = `${pet.score}%`;
  document.querySelector("#record-score-value").textContent = `${pet.score}%`;
  document.querySelector("#record-score-circle").textContent = pet.score;
  document.querySelector("#record-score-copy").textContent = pet.score >= 90
    ? "状态优秀，继续保持当前饮食和运动节奏。"
    : "整体状态良好，建议持续关注饮水与每日活动量。";
  renderDailyRecord();
  renderRecordTasks();
}

function renderDailyRecord() {
  const key = formatLocalDateKey(selectedRecordDate);
  const record = getRecordForActivePet(key);  const card = document.querySelector("#records-page .record-layout .content-card");
  const list = document.querySelector("#record-metric-list");
  document.querySelector("#record-date-label").textContent = formatShortDate(selectedRecordDate);
  document.querySelector("#record-status").textContent = record ? "已填写" : "无记录";
  card.classList.toggle("no-record", !record);
  if (!record) {
    list.replaceChildren();
    return;
  }
  const metrics = [
    ["体重", record.weight],
    ["喂食", record.feeding],
    ["饮水", record.water],
    ["遛弯", record.walk],
    ["排便", record.stool],
    ["精神状态", record.mood],
  ];
  list.innerHTML = metrics.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderBreedList(category, resetFilters = true) {
  activeBreedCategory = category;
  if (resetFilters) { breedFilterState = createDefaultBreedFilters(); breedFilterExpanded = false; }
  document.querySelector("#breed-list-title").textContent = breedData[category].title;
  renderBreedCards("breed-list", category);
  showWikiView("breed-list-view");
}

function renderInlineBreedList(category, resetFilters = true) {
  activeBreedCategory = category;
  if (resetFilters) {
    breedFilterState = createDefaultBreedFilters();
    breedFilterExpanded = false;
    wikiSearchQuery = "";
    document.querySelector("#wiki-search-input").value = "";
    document.querySelectorAll("[data-quick-filter]").forEach((button) => button.classList.toggle("active", button.dataset.quickFilter === "all"));
  }
  document.querySelector("#wiki-category-title").textContent = breedData[category].title;
  document.querySelectorAll(".wiki-category-grid button").forEach((button) => button.classList.toggle("active", button.dataset.category === category));
  renderBreedCards("wiki-inline-breed-list", category);
}

document.querySelector("#wiki-page").addEventListener("click", (event) => {
  const homeFilterButton = event.target.closest("[data-toggle-home-filters]");
  if (homeFilterButton) {
    breedFilterExpanded = !breedFilterExpanded;
    homeFilterButton.setAttribute("aria-expanded", String(breedFilterExpanded));
    renderBreedCards("wiki-inline-breed-list", activeBreedCategory);
    return;
  }
  const quickFilterButton = event.target.closest("[data-quick-filter]");
  if (quickFilterButton) {
    const quickFilter = quickFilterButton.dataset.quickFilter;
    breedFilterState = createDefaultBreedFilters();
    const quickFilterMap = {
      apartment: ["environment", "公寓适合"],
      beginner: ["difficulty", "新手友好"],
      "low-shedding": ["shedding", "少"],
      "low-exercise": ["exercise", "低"],
    };
    if (quickFilterMap[quickFilter]) {
      const [key, value] = quickFilterMap[quickFilter];
      breedFilterState[key] = value;
    }
    document.querySelectorAll("[data-quick-filter]").forEach((button) => button.classList.toggle("active", button === quickFilterButton));
    renderBreedCards("wiki-inline-breed-list", activeBreedCategory);
    return;
  }
  if (event.target.closest("[data-open-breed-list]")) {
    renderBreedList(activeBreedCategory, false);
    return;
  }
  const toggleButton = event.target.closest("[data-toggle-breed-filters]");
  if (toggleButton) {
    breedFilterExpanded = !breedFilterExpanded;
    renderBreedCards(toggleButton.closest("#breed-list-filters") ? "breed-list" : "wiki-inline-breed-list", activeBreedCategory);
    return;
  }
  const filterButton = event.target.closest("[data-filter-key]");
  if (filterButton) {
    breedFilterState[filterButton.dataset.filterKey] = filterButton.dataset.filterValue;
    renderBreedCards(filterButton.closest("#breed-list-filters") ? "breed-list" : "wiki-inline-breed-list", activeBreedCategory);
    return;
  }
  if (event.target.closest("[data-reset-breed-filters]")) {
    breedFilterState = createDefaultBreedFilters();
    renderBreedCards(event.target.closest("#breed-list-view") ? "breed-list" : "wiki-inline-breed-list", activeBreedCategory);
  }
});
function renderBreedDetail(index) {
  const breed = breedData[activeBreedCategory].breeds[index];
  const categoryLabel = activeBreedCategory === "dog" ? "犬类" : "猫类";
  const basicTags = breed.info.基本信息.split("/").map((tag) => tag.trim());
  const personalityTags = breed.info.性格.split("、").slice(0, 2);
  const detailIcons = ["◈", "◒", "⌛", "≈", "✦", "♡", "↗", "⌂"];
  document.querySelector("#breed-detail-title").textContent = breed.name;
  document.querySelector("#breed-detail-name").textContent = breed.name;
  document.querySelector("#breed-detail-intro").textContent = breed.intro;
  document.querySelector("#breed-detail-category").textContent = categoryLabel;
  const image = document.querySelector("#breed-detail-image");
  image.src = breed.image;
  image.alt = `${breed.name}封面图`;
  document.querySelector("#breed-detail-photo-frame").style.setProperty("--breed-detail-image", `url("${breed.image}")`);
  document.querySelector("#breed-detail-tags").innerHTML = [...basicTags, ...personalityTags]
    .map((tag) => `<span>${tag}</span>`)
    .join("");
  document.querySelector("#breed-detail-highlights").innerHTML = [
    ["平均寿命", breed.info.寿命],
    ["运动需求", breed.info.运动量.split("，")[0]],
    ["掉毛程度", breed.info.掉毛],
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("");
  document.querySelector("#breed-detail-grid").innerHTML = Object.entries(breed.info)
    .map(([label, value], itemIndex) => `<div><i>${detailIcons[itemIndex] || "•"}</i><p><span>${label}</span><strong>${value}</strong></p></div>`)
    .join("");
  document.querySelector("#breed-care-list").innerHTML = [
    ["餐食管理", breed.info.饭量, "01"],
    ["活动安排", breed.info.运动量, "02"],
    ["清洁护理", `掉毛${breed.info.掉毛}，${breed.info.体味}`, "03"],
  ].map(([title, copy, number]) => `<div><b>${number}</b><p><strong>${title}</strong><span>${copy}</span></p></div>`).join("");
  document.querySelector("#breed-adoption-copy").textContent = breed.info.领养建议;
  showWikiView("breed-detail-view");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    navButtons.forEach((item) => item.classList.remove("active"));
    pages.forEach((page) => page.classList.remove("active"));

    button.classList.add("active");
    document.querySelector(`#${button.dataset.target}`).classList.add("active");
    if (button.dataset.target === "wiki-page") {
      showWikiView("wiki-home-view");
      renderInlineBreedList("dog");
    }
    if (button.dataset.target === "records-page") syncRecordCalendarToToday(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

function renderTaskPetOptions() {
  const picker = document.querySelector("#task-modal .pet-picker");
  if (!picker) return;
  const petOptions = getPetIds().map((petId) => {
    const pet = petProfiles[petId];
    return '<label class="pet-option"><input type="checkbox" data-pet-id="' + escapePetMarkup(pet.id) + '" />' +
      '<img src="' + escapePetMarkup(pet.avatar) + '" alt="' + escapePetMarkup(pet.name) + '" /><span>' + escapePetMarkup(pet.name) + '</span></label>';
  }).join("");
  picker.innerHTML = '<legend>选择宠物，可多选</legend>' + petOptions +
    '<label class="pet-option shared-task-option"><input id="task-shared-option" type="checkbox" />' +
    '<i class="task-scope-icon">⌂</i><span>共同任务</span></label>';
}

function renderRecordTasks() {
  const list = document.querySelector("#records-page .records-task-list");
  if (!list) return;
  const tasks = taskData.filter((task) => task.shared || task.petIds?.includes(activeRecordPetId));
  list.innerHTML = tasks.map((task) =>
    '<button class="timeline-item ' + (task.done ? "done" : "") + ' open-task-modal" type="button" data-task-id="' + escapePetMarkup(task.id) + '">' +
    '<time>' + escapePetMarkup(task.time || "待定") + '</time><span><strong>' + escapePetMarkup(task.title) +
    '</strong><small>' + escapePetMarkup(task.note || (task.done ? "已完成" : "待完成")) + '</small></span></button>'
  ).join("");
}
function renderHomeTasks() {
  const taskList = document.querySelector("#home-page .home-task-list");
  if (!taskList) return;
  const sortedTasks = [...taskData].sort((firstTask, secondTask) => {
    const completionOrder = Number(firstTask.done) - Number(secondTask.done);
    return completionOrder || String(firstTask.time || "").localeCompare(String(secondTask.time || ""));
  });
  const taskMarkup = sortedTasks.map((task) => {
    const assignedPets = (task.petIds || []).map((petId) => petProfiles[petId]).filter(Boolean);
    const scopeLabel = task.shared ? "共同任务" : assignedPets.map((pet) => pet.name).join("、") || "未分配";
    const note = (task.note || "宠物照护事项") + "，" + (task.done ? "已完成" : "待完成");
    return '<article class="timeline-item ' + (task.done ? "done" : "") + '" data-task-id="' + escapePetMarkup(task.id) + '">' +
      '<button class="task-open open-task-modal" type="button"><time>' + escapePetMarkup(task.time || "待定") + '</time>' +
      '<div class="home-task-copy"><span class="home-task-pet-badge ' + (task.shared ? "shared" : "") + '">' + escapePetMarkup(scopeLabel) + '</span>' +
      '<strong>' + escapePetMarkup(task.title) + '</strong><small>' + escapePetMarkup(note) + '</small></div></button>' +
      '<button class="task-complete" type="button" aria-label="' + escapePetMarkup(task.title) + (task.done ? "已完成，点击恢复为未完成" : "未完成，点击标记完成") + '">' +
      (task.done ? "✓" : "") + '</button></article>';
  }).join("");
  taskList.innerHTML = taskMarkup +
    '<button class="timeline-item home-task-add open-task-modal" type="button"><span class="task-add-icon">＋</span><strong class="task-add-label">新增任务</strong></button>';
}

function openTaskEditor(button) {
  const isFamilyTask = button.dataset.taskContext === "family";
  const taskId = button.closest("[data-task-id]")?.dataset.taskId || "";
  const task = taskData.find((item) => item.id === taskId) || null;
  activeEditingTaskId = isFamilyTask ? "" : task?.id || "";
  modal.dataset.taskContext = isFamilyTask ? "family" : "standard";
  document.querySelector("#task-modal-title").textContent = isFamilyTask ? "新增家庭协作任务" : task ? "编辑任务" : "新增任务";
  document.querySelector("#task-modal .eyebrow").textContent = isFamilyTask ? "家庭协作" : "任务";
  document.querySelector("#task-name-input").value = task?.title || "";
  document.querySelector("#task-time-input").value = task?.time || "18:30";
  document.querySelector("#task-repeat-select").value = task?.repeat || "仅一次";
  document.querySelector("#task-note-input").value = task?.note || "";
  renderTaskPetOptions();
  document.querySelectorAll("#task-modal [data-pet-id]").forEach((input) => {
    input.checked = Boolean(task?.petIds?.includes(input.dataset.petId));
    input.closest(".pet-option")?.classList.toggle("selected", input.checked);
  });
  const sharedInput = document.querySelector("#task-shared-option");
  if (sharedInput) {
    sharedInput.checked = Boolean(task?.shared);
    sharedInput.closest(".pet-option")?.classList.toggle("selected", sharedInput.checked);
  }
  document.querySelector("#task-delete-button").hidden = !task;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function saveStandardTask() {
  const title = document.querySelector("#task-name-input").value.trim();
  const petIds = [...document.querySelectorAll("#task-modal [data-pet-id]:checked")].map((input) => input.dataset.petId);
  const shared = Boolean(document.querySelector("#task-shared-option")?.checked);
  if (!title) { showToast("请输入任务名称"); return false; }
  if (!shared && petIds.length === 0) { showToast("请选择至少一只宠物或共同任务"); return false; }
  const task = activeEditingTaskId ? taskData.find((item) => item.id === activeEditingTaskId) : null;
  const values = {
    title,
    petIds,
    shared,
    time: document.querySelector("#task-time-input").value || "",
    repeat: document.querySelector("#task-repeat-select").value,
    note: document.querySelector("#task-note-input").value.trim(),
    memberIds: [...document.querySelectorAll("#task-modal .member-option input:checked")].map((input) => input.value),
  };
  if (task) Object.assign(task, values);
  else taskData.push({ id: createLocalId("task"), done: false, ...values });
  persistTasks();
  renderHomeTasks();
  renderAllPetControls();
  activeEditingTaskId = "";
  return true;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".open-task-modal");
  if (button) openTaskEditor(button);
});

document.querySelector("#task-delete-button").addEventListener("click", () => {
  const task = taskData.find((item) => item.id === activeEditingTaskId);
  if (!task) return;
  taskData = taskData.filter((item) => item.id !== task.id);
  persistTasks();
  renderHomeTasks();
  renderAllPetControls();
  activeEditingTaskId = "";
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  showToast(task.title + "已删除");
});

document.querySelectorAll(".toast-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.id === "task-save-button" && modal.dataset.taskContext === "standard") {
      if (!saveStandardTask()) return;
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      showToast("任务已保存");
      return;
    }
    if (button.closest("#task-modal") && modal.dataset.taskContext === "family") {
      const taskName = document.querySelector("#task-name-input").value.trim() || "新的家庭任务";
      const taskTime = document.querySelector("#task-time-input").value || "待设置";
      const safeTaskName = taskName.replace(/[<>"']/g, "");
      document.querySelector("#family-task-list").insertAdjacentHTML("beforeend",
        '<article class="family-task-item pending" data-family-task="' + safeTaskName + '"><span class="family-task-icon">📌</span>' +
        '<div><strong>' + safeTaskName + '</strong><small>计划 ' + taskTime + ' · 家庭协作任务</small></div><em>待分配</em>' +
        '<button class="family-task-status-button" type="button" data-complete-family-task><span>○</span>确认完成</button></article>');
      updateFamilyTaskProgress();
      modal.dataset.taskContext = "standard";
    }
    showToast(button.dataset.toast || "已保存");
  });
});
document.querySelectorAll(".page-link").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (event.target.closest(".notification-button")) return;
    event.stopPropagation();
    const currentPage = document.querySelector(".page.active")?.id || "home-page";
    button.dataset.from = currentPage;
    showPage(button.dataset.page);
  });
});

document.querySelectorAll(".page-back").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.back || "home-page";
    const navTarget = target === "home-page" || target === "mine-page" || target === "records-page" || target === "wiki-page" ? target : undefined;
    showPage(target, navTarget);
  });
});

function removeOrphanedPetTasks() {
  const availablePetIds = new Set(getPetIds());
  const beforeCount = taskData.length;
  taskData = taskData.filter((task) => task.shared || (task.petIds || []).every((petId) => availablePetIds.has(petId)));
  const removedTaskCount = beforeCount - taskData.length;
  if (removedTaskCount) {
    persistTasks();
    renderHomeTasks();
  }
  return removedTaskCount;
}

function sortHomeTasksByCompletion() {
  renderHomeTasks();
}

document.querySelector("#home-page .home-task-list").addEventListener("click", (event) => {
  const button = event.target.closest(".task-complete");
  if (!button) return;
  const taskId = button.closest("[data-task-id]")?.dataset.taskId;
  const task = taskData.find((item) => item.id === taskId);
  if (!task) return;
  task.done = !task.done;
  persistTasks();
  renderHomeTasks();
  renderAllPetControls();
  const assignedNames = (task.petIds || []).map((petId) => petProfiles[petId]?.name).filter(Boolean).join("、");
  showToast((task.shared ? "共同" : assignedNames || "宠物") + (task.done ? "任务已完成" : "任务已恢复为未完成"));
});
renderHomeTasks();
document.querySelectorAll(".close-modal").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  });
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
});

document.querySelectorAll(".segmented button, .category-tabs button, .mini-segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement
      .querySelectorAll("button")
      .forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

document.querySelectorAll(".pet-option input, .member-option input").forEach((input) => {
  input.addEventListener("change", () => {
    const option = input.closest(".pet-option, .member-option");
    option?.classList.toggle("selected", input.checked);
  });
});

function normalizePetProfile(pet) {
  if (!pet) return null;
  pet.id ||= createLocalId("pet");
  if (pet.breed === undefined) {
    const [breed = "", ageLabel = "", gender = ""] = String(pet.desc || "").split(" · ");
    pet.breed = breed;
    pet.age = Math.max(0, Number.parseInt(ageLabel, 10) || 0);
    pet.gender = gender || "未知";
  }
  pet.birthDate ||= "";
  pet.hobbies ||= "";
  pet.record ||= { feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" };
  return pet;
}
function escapePetMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderMinePetManagement() {
  const list = document.querySelector("#mine-pet-list");
  const count = document.querySelector("#mine-pet-count");
  if (!list || !count) return;
  const pets = getPetIds().map((petId) => petProfiles[petId]).filter(Boolean);
  count.textContent = pets.length + " 只";
  const longestCompanionship = pets.reduce((days, pet) => Math.max(days, Number(pet.days) || 0), 0);
  const companionDays = document.querySelector("#mine-pet-days");
  if (companionDays) companionDays.textContent = longestCompanionship + "天";

  if (!pets.length) {
    list.innerHTML = '<div class="mine-pet-empty"><span>♡</span><strong>还没有宠物档案</strong><small>新增宠物后，可在这里统一查看和管理资料</small></div>';
    return;
  }

  list.innerHTML = pets.map((pet) =>
    '<article class="mine-pet-item">' +
      '<img src="' + escapePetMarkup(pet.avatar) + '" alt="' + escapePetMarkup(pet.name) + '照片" />' +
      '<div class="mine-pet-item-copy"><strong>' + escapePetMarkup(pet.name) + '</strong><span>' + escapePetMarkup(pet.desc) + '</span>' +
      '<small>已陪伴 ' + Number(pet.days || 0) + ' 天 · 健康值 ' + Number(pet.score || 0) + '%</small></div>' +
      '<button class="mine-pet-open" type="button" data-mine-pet-id="' + escapePetMarkup(pet.id) + '" aria-label="查看或编辑' + escapePetMarkup(pet.name) + '的资料">查看 / 编辑 <i>›</i></button>' +
    '</article>'
  ).join("");
}
function renderAllPetControls() {
  const pets = getPetIds().map((petId) => normalizePetProfile(petProfiles[petId])).filter(Boolean);
  const homeSwitcher = document.querySelector(".pet-switcher");
  const recordsSwitcher = document.querySelector(".records-pet-switcher");
  const healthSwitcher = document.querySelector("#health-flow-pets");
  if (!homeSwitcher || !recordsSwitcher || !healthSwitcher) return;

  const fallbackPetId = pets[0]?.id || "";
  if (!petProfiles[activePetId]) activePetId = fallbackPetId;
  if (!petProfiles[activeRecordPetId]) activeRecordPetId = fallbackPetId;
  if (!petProfiles[activeHealthPetId]) activeHealthPetId = fallbackPetId;
  if (homeCarouselKey !== "__add__" && !petProfiles[homeCarouselKey]) homeCarouselKey = activePetId || "__add__";
  document.querySelector("#home-page .health-panel")?.toggleAttribute("hidden", pets.length === 0);

  pets.forEach((pet) => {
    const relatedTasks = taskData.filter((task) => task.petIds?.includes(pet.id));
    pet.taskProgress = relatedTasks.filter((task) => task.done).length + "/" + relatedTasks.length;
  });

  healthSwitcher.dataset.count = String(pets.length);
  healthSwitcher.dataset.overflow = String(pets.length > 4);
  healthSwitcher.closest(".health-record-flow")?.classList.toggle("single-pet", pets.length === 1);

  const petCards = pets.map((pet) =>
    '<button class="pet-carousel-card ' + (pet.id === activePetId ? "active" : "") + '" type="button" data-pet="' + escapePetMarkup(pet.id) + '" aria-label="查看' + escapePetMarkup(pet.name) + '的宠物信息">' +
      '<span class="pet-carousel-profile"><img src="' + escapePetMarkup(pet.avatar) + '" alt="' + escapePetMarkup(pet.name) + '" />' +
      '<span class="pet-carousel-copy"><strong>' + escapePetMarkup(pet.name) + '</strong><small>' + escapePetMarkup(pet.desc) + '</small></span></span>' +
      '<span class="pet-carousel-stats"><span><small>已陪伴</small><strong>' + pet.days + '天</strong></span>' +
      '<span><small>健康值</small><strong>' + pet.score + '%</strong></span>' +
      '<span><small>今日任务</small><strong>' + escapePetMarkup(pet.taskProgress) + '</strong></span></span></button>'
  ).join("");
  const pagination = pets.length
    ? '<span class="pet-carousel-pagination" aria-label="宠物卡片分页">' +
      pets.map((pet) => '<button class="pet-carousel-dot" type="button" data-carousel-key="' + escapePetMarkup(pet.id) + '" aria-label="查看' + escapePetMarkup(pet.name) + '"></button>').join("") +
      '<button class="pet-carousel-dot" type="button" data-carousel-key="__add__" aria-label="查看新增宠物卡片"></button></span>'
    : "";
  homeSwitcher.innerHTML = petCards + pagination +
    '<button class="add-pet-button pet-carousel-card pet-carousel-add" type="button" data-carousel-key="__add__" aria-label="新增宠物">' +
    '<span class="plus-mark">+</span><strong>新增宠物</strong><small>完善新伙伴的基础档案</small></button>';

  updateHomePetCarouselLayout();

  recordsSwitcher.innerHTML = pets.map((pet) =>
    '<button class="' + (pet.id === activeRecordPetId ? "active" : "") + '" type="button" data-record-pet="' + escapePetMarkup(pet.id) + '">' +
    '<img src="' + escapePetMarkup(pet.avatar) + '" alt="" /><span>' + escapePetMarkup(pet.name) + '</span><small>' + pet.score + '%</small></button>'
  ).join("");

  healthSwitcher.innerHTML = pets.map((pet, index) =>
    (index ? '<span class="health-flow-line"></span>' : "") +
    '<button class="health-flow-pet" type="button" data-health-pet="' + escapePetMarkup(pet.id) + '" aria-label="切换为' + escapePetMarkup(pet.name) + '的健康记录">' +
    '<i>○</i><b>' + escapePetMarkup(pet.name) + '</b></button>'
  ).join("");

  renderTaskPetOptions();
  renderHomeTasks();
  renderMinePetManagement();
  updateRecordsPet(activeRecordPetId);
}
function clearPetDropIndicators() {
  document.querySelectorAll(".pet-switcher [data-pet]").forEach((button) => {
    button.classList.remove("dragging", "drop-before", "drop-after");
    delete button.dataset.dropPosition;
    button.style.removeProperty("--drag-x");
    button.style.removeProperty("--drag-y");
  });
}

function markPetDropTarget(button, placeAfter) {
  document.querySelectorAll(".pet-switcher [data-pet]").forEach((item) => item.classList.remove("drop-before", "drop-after"));
  if (!button || button.dataset.pet === draggedPetId) return;
  button.classList.add(placeAfter ? "drop-after" : "drop-before");
  button.dataset.dropPosition = placeAfter ? "after" : "before";
}

function reorderPetProfiles(sourceName, targetName, placeAfter = false) {
  const names = getPetIds();
  if (!sourceName || !targetName || sourceName === targetName || !petProfiles[sourceName] || !petProfiles[targetName]) return false;
  const reorderedNames = names.filter((name) => name !== sourceName);
  let targetIndex = reorderedNames.indexOf(targetName);
  if (placeAfter) targetIndex += 1;
  reorderedNames.splice(targetIndex, 0, sourceName);
  petProfileOrder = reorderedNames;
  persistPetProfiles();
  renderAllPetControls();
  renderHealthRecordFlow();
  showToast("宠物顺序已保存");
  return true;
}

function petApiPayload(pet) {
  const birthYear = Math.max(1980, new Date().getFullYear() - Number(pet.age || 0));
  return {
    name: pet.name,
    species: pet.species || "OTHER",
    breed: pet.breed || "",
    gender: pet.genderCode || "UNKNOWN",
    birthDate: pet.birthDate || `${birthYear}-01-01`,
    weight: pet.record?.weight > 0 ? pet.record.weight : null,
    avatarUrl: pet.avatar?.startsWith("data:") ? null : pet.avatar,
    hobbies: pet.hobbies || "",
  };
}

function defaultPetAvatar(species) {
  return species === "CAT"
    ? "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=640&q=82"
    : "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=640&q=82";
}

async function createPetFromForm(event) {
  event.preventDefault();
  const name = document.querySelector("#pet-create-name").value.trim();
  const species = document.querySelector("#pet-create-species").value;
  const breed = document.querySelector("#pet-create-breed").value.trim();
  const age = Number(document.querySelector("#pet-create-age").value);
  const genderCode = document.querySelector("#pet-create-gender").value;
  const gender = { MALE: "公", FEMALE: "母", UNKNOWN: "未知" }[genderCode];
  const days = Number(document.querySelector("#pet-create-days").value);
  const birthDate = document.querySelector("#pet-create-birth").value || String(Math.max(1980, new Date().getFullYear() - age)) + "-01-01";
  const hobbies = document.querySelector("#pet-create-hobbies").value.trim();
  if (!name) { showToast("请输入宠物名称"); return; }
  if (!breed) { showToast("请输入宠物品种"); return; }
  if (!Number.isInteger(age) || age < 0 || age > 40) { showToast("请输入0到40岁的整数年龄"); return; }
  if (!Number.isInteger(days) || days < 0 || days > 36500) { showToast("请输入0到36500天的整数陪伴天数"); return; }
  if (birthDate > new Date().toISOString().slice(0, 10)) { showToast("出生日期不能晚于今天"); return; }
  if (findPetIdByName(name)) { showToast("宠物名称已存在"); return; }

  const pet = {
    id: createLocalId("pet"),
    name, species, breed, age, gender, genderCode,
    desc: breed + " · " + age + "岁 · " + gender,
    avatar: pendingPetAvatar || defaultPetAvatar(species),
    birthDate,
    days,
    score: 100,
    healthLabel: "待记录",
    taskProgress: "0/0",
    hobbies,
    record: { feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" },
  };
  const submitButton = document.querySelector("#pet-create-submit");
  submitButton.disabled = true;
  submitButton.textContent = "正在保存…";
  try {
    const serverPet = await requestPetApi("", { method: "POST", body: JSON.stringify(petApiPayload(pet)) });
    if (serverPet?.id != null) pet.id = String(serverPet.id);
    petProfiles[pet.id] = pet;
    petProfileOrder.push(pet.id);
    persistPetProfiles();
    activePetId = pet.id;
    activeRecordPetId ||= pet.id;
    activeHealthPetId ||= pet.id;
    renderAllPetControls();
    selectHomePet(pet.id);
    renderHealthRecordFlow();
    closePetCreateModal();
    showToast(name + "已加入宠物列表");
  } catch (error) {
    showToast(error.message || "宠物保存失败");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "保存宠物";
  }
}
function openPetCreateModal() {
  petModal.classList.add("active");
  petModal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => document.querySelector("#pet-create-name")?.focus(), 0);
}

function closePetCreateModal() {
  petModal.classList.remove("active");
  petModal.setAttribute("aria-hidden", "true");
  document.querySelector("#pet-create-form").reset();
  document.querySelector("#pet-create-age").value = 1;
  pendingPetAvatar = "";
  const preview = document.querySelector("#pet-photo-preview");
  preview.src = "";
  preview.hidden = true;
  document.querySelector("#pet-photo-preview-wrap").classList.remove("has-preview");
}

function setPetDetailEditing(editing) {
  const card = document.querySelector(".pet-info-card");
  card.classList.toggle("editing", editing);
  if (editing) document.querySelector("#pet-detail-name-input").focus();
}

function renderPetDetail() {
  const pet = normalizePetProfile(petProfiles[activePetId]);
  if (!pet) return;
  const avatar = document.querySelector("#pet-detail-avatar");
  avatar.src = pet.avatar;
  avatar.alt = `${pet.name}照片`;
  document.querySelector("#pet-detail-name-title").textContent = pet.name;
  document.querySelector("#pet-detail-desc").textContent = pet.desc;
  document.querySelector("#pet-detail-score").textContent = `${pet.score}%`;
  document.querySelector("#pet-detail-days-stat").textContent = `${pet.days}天`;
  document.querySelector("#pet-detail-task-stat").textContent = pet.taskProgress;
  document.querySelector("#pet-detail-health-stat").textContent = pet.healthLabel;

  document.querySelector("#pet-detail-name-value").textContent = pet.name;
  document.querySelector("#pet-detail-breed-value").textContent = pet.breed;
  document.querySelector("#pet-detail-gender-value").textContent = pet.gender;
  document.querySelector("#pet-detail-age-value").textContent = pet.age;
  document.querySelector("#pet-detail-days-value").textContent = pet.days;
  document.querySelector("#pet-detail-days-edit-value").textContent = pet.days;
  document.querySelector("#pet-detail-birth-value").textContent = formatPetBirthDate(pet.birthDate);
  document.querySelector("#pet-detail-hobbies-value").textContent = pet.hobbies || "未填写";

  document.querySelector("#pet-detail-name-input").value = pet.name;
  document.querySelector("#pet-detail-breed-input").value = pet.breed;
  document.querySelector("#pet-detail-age-input").value = pet.age;
  document.querySelector("#pet-detail-gender-input").value = pet.gender;
  document.querySelector("#pet-detail-birth-input").value = pet.birthDate;
  document.querySelector("#pet-detail-hobbies-input").value = pet.hobbies;
  setPetDetailEditing(false);
}

function openActivePetDetail(returnPageId = "home-page") {
  const safeReturnPageId = typeof returnPageId === "string" ? returnPageId : "home-page";
  const backButton = document.querySelector("#pet-detail-page .page-back");
  if (backButton) backButton.dataset.back = safeReturnPageId;
  renderPetDetail();
  showPage("pet-detail-page");
}
async function savePetDetail() {
  const pet = normalizePetProfile(petProfiles[activePetId]);
  if (!pet) return;
  const newName = document.querySelector("#pet-detail-name-input").value.trim();
  const breed = document.querySelector("#pet-detail-breed-input").value.trim();
  const age = Math.max(0, Number.parseInt(document.querySelector("#pet-detail-age-input").value, 10) || 0);
  const gender = document.querySelector("#pet-detail-gender-input").value;
  const birthDate = document.querySelector("#pet-detail-birth-input").value;
  const hobbies = document.querySelector("#pet-detail-hobbies-input").value.trim();
  const duplicatePetId = findPetIdByName(newName);
  if (!newName) { showToast("请输入宠物名称"); return; }
  if (!breed) { showToast("请输入宠物品种"); return; }
  if (duplicatePetId && duplicatePetId !== pet.id) { showToast("宠物名称已存在"); return; }

  const nextPet = { ...pet, name: newName, breed, age, gender, birthDate, hobbies };
  if (pet.id && getPetAccessToken()) {
    try {
      await requestPetApi("/" + pet.id, { method: "PUT", body: JSON.stringify(petApiPayload(nextPet)) });
    } catch (error) {
      showToast(error.message || "宠物信息保存失败");
      return;
    }
  }

  Object.assign(pet, nextPet, { desc: breed + " · " + age + "岁 · " + gender });
  persistPetProfiles();
  renderAllPetControls();
  updateCurrentPet(pet.id);
  if (activeHealthPetId === pet.id) updateHealthRecordPet(pet.id);
  else renderHealthRecordFlow();
  renderPetDetail();
  showToast("宠物信息已保存");
}
async function deleteActivePet() {
  const pet = petProfiles[activePetId];
  const confirmed = pet && window.confirm("确定要删除宠物“" + pet.name + "”吗？\n删除后其任务和健康记录将一并删除。");
  if (!confirmed) return;
  if (pet.id && getPetAccessToken()) {
    try {
      await requestPetApi("/" + pet.id, { method: "DELETE" });
    } catch (error) {
      showToast(error.message || "宠物删除失败");
      return;
    }
  }

  const deletedPetId = pet.id;
  const removedTaskCount = taskData.filter((task) => task.petIds?.includes(deletedPetId)).length;
  taskData = taskData.filter((task) => !task.petIds?.includes(deletedPetId));
  delete dailyRecordData[deletedPetId];
  delete petProfiles[deletedPetId];
  petProfileOrder = petProfileOrder.filter((petId) => petId !== deletedPetId);
  submittedHealthPetIds.delete(deletedPetId);

  const nextPetId = getPetIds()[0] || "";
  activePetId = nextPetId;
  activeHealthPetId = nextPetId;
  activeRecordPetId = nextPetId;
  homeCarouselKey = nextPetId || "__add__";

  persistPetProfiles();
  persistTasks();
  persistHealthRecords();
  renderAllPetControls();
  if (nextPetId) {
    updateCurrentPet(nextPetId);
    updateRecordsPet(nextPetId);
    updateHealthRecordPet(nextPetId);
  } else {
    renderHealthRecordFlow();
  }
  const returnPageId = document.querySelector("#pet-detail-page .page-back")?.dataset.back || "home-page";
  const navTarget = ["home-page", "records-page", "wiki-page", "mine-page"].includes(returnPageId) ? returnPageId : "home-page";
  showPage(returnPageId, navTarget);
  showToast(removedTaskCount ? "宠物已删除，" + removedTaskCount + "项关联任务已移除" : "宠物已删除");
}
function updateCurrentPet(petName) {
  const pet = petProfiles[petName];
  if (!pet) return false;
  activePetId = petName;
  const avatar = document.querySelector("#current-pet-avatar");
  if (avatar) {
    avatar.src = pet.avatar;
    avatar.alt = `${pet.name}照片`;
    avatar.setAttribute("aria-label", `查看${pet.name}的宠物信息`);
  }
  const summaryValues = {
    "#current-pet-name": pet.name,
    "#current-pet-desc": pet.desc,
    "#current-pet-days": `${pet.days}天`,
    "#current-pet-score": `${pet.score}%`,
    "#current-pet-health-label": pet.taskProgress,
  };
  Object.entries(summaryValues).forEach(([selector, value]) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  });
  return true;
}

function updateHealthRecordPet(petName) {
  const pet = petProfiles[petName];
  if (!pet) return;
  activeHealthPetId = petName;
  document.querySelector("#health-record-title").textContent = `${pet.name}今日健康记录`;

  document.querySelector("#home-feeding").value = pet.record.feeding;
  document.querySelector("#home-walk").value = pet.record.walk;
  document.querySelector("#home-weight").value = pet.record.weight;
  setSegmentedValue("#home-water", pet.record.water);
  setSegmentedValue("#home-stool", pet.record.stool);
  setSegmentedValue("#home-mood", pet.record.mood);
  renderHealthRecordFlow();
}

function getHealthPetIds() {
  return getPetIds();
}

function getNextPendingHealthPet(currentPetName) {
  const petNames = getHealthPetIds();
  const currentIndex = petNames.indexOf(currentPetName);
  for (let offset = 1; offset < petNames.length; offset += 1) {
    const candidate = petNames[(currentIndex + offset) % petNames.length];
    if (!submittedHealthPetIds.has(candidate)) return candidate;
  }
  return null;
}

function selectHomePet(petName) {
  homeCarouselKey = petName;
  document.querySelectorAll(".pet-switcher [data-pet]").forEach((item) => {
    item.classList.toggle("active", item.dataset.pet === petName);
  });
  updateCurrentPet(petName);
  updateHealthRecordPet(petName);
  updateHomePetCarouselLayout();
}

function updateHomePetCarouselLayout() {
  const switcher = document.querySelector(".pet-switcher");
  if (!switcher) return;
  const cards = [...switcher.querySelectorAll(".pet-carousel-card")];
  let activeIndex = cards.findIndex((card) => (card.dataset.pet || card.dataset.carouselKey) === homeCarouselKey);
  if (activeIndex < 0) {
    homeCarouselKey = activePetId;
    activeIndex = Math.max(0, cards.findIndex((card) => card.dataset.pet === activePetId));
  }

  cards.forEach((card, index) => {
    const delta = index - activeIndex;
    card.classList.remove("active", "stack-before", "stack-after", "stack-after-next", "stack-far");
    if (delta === 0) card.classList.add("active");
    else if (delta === -1) card.classList.add("stack-before");
    else if (delta === 1) card.classList.add("stack-after");
    else if (delta === 2) card.classList.add("stack-after-next");
    else card.classList.add("stack-far");
    card.tabIndex = delta === 0 ? 0 : -1;
    card.setAttribute("aria-hidden", String(Math.abs(delta) > 1));
  });

  switcher.querySelectorAll(".pet-carousel-dot[data-carousel-key]").forEach((dot) => {
    const selected = dot.dataset.carouselKey === homeCarouselKey;
    dot.classList.toggle("active", selected);
    dot.setAttribute("aria-current", selected ? "true" : "false");
  });
}

function shiftHomePet(direction) {
  const keys = [...getPetIds(), "__add__"];
  const currentIndex = Math.max(0, keys.indexOf(homeCarouselKey));
  const nextIndex = Math.min(keys.length - 1, Math.max(0, currentIndex + direction));
  if (nextIndex === currentIndex || !keys[nextIndex]) return false;
  if (keys[nextIndex] === "__add__") {
    homeCarouselKey = "__add__";
    updateHomePetCarouselLayout();
  } else {
    selectHomePet(keys[nextIndex]);
  }
  return true;
}

function renderHealthRecordFlow() {
  const petIds = getHealthPetIds();
  const todayKey = formatLocalDateKey(new Date());
  petIds.forEach((petId) => {
    if (dailyRecordData[petId]?.[todayKey]) submittedHealthPetIds.add(petId);
    else submittedHealthPetIds.delete(petId);
  });
  const completedCount = petIds.filter((petId) => submittedHealthPetIds.has(petId)).length;
  const allCompleted = petIds.length > 0 && completedCount === petIds.length;
  const healthPanel = document.querySelector(".health-panel");
  const progress = document.querySelector("#health-flow-progress");
  const flowHint = document.querySelector("#health-flow-hint");
  const submitButton = document.querySelector("#health-submit-button");
  const completeList = document.querySelector("#health-complete-list");
  const currentLabel = document.querySelector("#health-flow-current");
  const nextLabel = document.querySelector("#health-flow-next");
  const singlePetState = document.querySelector("#single-pet-flow-state");
  const recordStatus = document.querySelector("#health-record-status");
  const currentPet = petProfiles[activeHealthPetId];
  const currentPetRecorded = Boolean(activeHealthPetId && submittedHealthPetIds.has(activeHealthPetId));

  if (recordStatus) {
    recordStatus.textContent = currentPetRecorded ? "已填写" : "未填写";
    recordStatus.classList.toggle("recorded", currentPetRecorded);
    recordStatus.setAttribute("aria-label", (currentPet?.name || "当前宠物") + "今日健康记录" + (currentPetRecorded ? "已填写" : "未填写"));
  }
  if (progress) progress.textContent = "今日记录 " + completedCount + "/" + petIds.length;
  if (flowHint) flowHint.textContent = petIds.length === 1
    ? "记录" + petProfiles[petIds[0]].name + "今天的身体状态"
    : "提交后将自动进入下一只宠物";

  document.querySelectorAll("#health-flow-pets [data-health-pet]").forEach((button) => {
    const petId = button.dataset.healthPet;
    button.classList.toggle("current", petId === activeHealthPetId && !allCompleted);
    button.classList.toggle("completed", submittedHealthPetIds.has(petId));
    button.setAttribute("aria-pressed", String(petId === activeHealthPetId && !allCompleted));
    const marker = button.querySelector("i");
    if (marker) marker.textContent = submittedHealthPetIds.has(petId) ? "✓" : petId === activeHealthPetId && !allCompleted ? "●" : "○";
    button.nextElementSibling?.classList.toggle("completed", submittedHealthPetIds.has(petId));
  });

  healthPanel?.classList.remove("submitted");
  if (completeList) {
    completeList.innerHTML = petIds.map((petId) =>
      '<span class="health-complete-item"><b class="health-complete-check">✓</b>' +
      escapePetMarkup(petProfiles[petId].name) + '<em class="health-complete-status">已记录</em></span>'
    ).join("");
  }
  if (allCompleted) {
    if (currentLabel) currentLabel.textContent = "今日记录已全部完成";
    if (nextLabel) nextLabel.textContent = completedCount + "/" + petIds.length + " 已记录";
  }
  if (!submitButton || !currentPet) return;
  if (allCompleted) {
    submitButton.textContent = "更新" + currentPet.name + "的今日记录";
    return;
  }
  if (petIds.length === 1) {
    if (singlePetState) singlePetState.querySelector("span").textContent = "当前宠物：" + currentPet.name + " · 今天尚未提交健康记录";
    if (currentLabel) currentLabel.textContent = "唯一宠物，无需切换";
    if (nextLabel) nextLabel.textContent = "完成后结束今日记录";
    submitButton.textContent = "保存并完成今日记录";
    return;
  }

  const nextPetId = getNextPendingHealthPet(activeHealthPetId);
  const nextPet = petProfiles[nextPetId];
  if (currentLabel) currentLabel.textContent = "当前：" + currentPet.name;
  if (nextLabel) nextLabel.textContent = nextPet ? "下一只：" + nextPet.name : "最后一只记录";
  if (!nextPet) {
    submitButton.textContent = "保存并完成今日记录";
  } else {
    const action = submittedHealthPetIds.has(activeHealthPetId) ? "更新并记录下一只" : "保存并记录下一只";
    submitButton.textContent = action + "：" + nextPet.name;
  }
}

function saveActiveHealthRecord() {
  const pet = petProfiles[activeHealthPetId];
  if (!pet) return;
  pet.record.feeding = Number(document.querySelector("#home-feeding").value || 0);
  pet.record.walk = Number(document.querySelector("#home-walk").value || 0);
  pet.record.weight = Number(document.querySelector("#home-weight").value || 0);
  pet.record.water = document.querySelector("#home-water .selected")?.dataset.value || pet.record.water;
  pet.record.stool = document.querySelector("#home-stool .selected")?.dataset.value || pet.record.stool;
  pet.record.mood = document.querySelector("#home-mood .selected")?.dataset.value || pet.record.mood;

  const todayKey = formatLocalDateKey(new Date());
  dailyRecordData[pet.id] ||= Object.create(null);
  const wasAlreadySubmitted = Boolean(dailyRecordData[pet.id][todayKey]);
  dailyRecordData[pet.id][todayKey] = {
    weight: pet.record.weight + " kg",
    feeding: pet.record.feeding + " 勺",
    water: pet.record.water,
    walk: pet.record.walk + " 公里",
    stool: pet.record.stool,
    mood: pet.record.mood,
  };
  submittedHealthPetIds.add(pet.id);
  try {
    persistPetProfiles();
    persistHealthRecords();
  } catch (error) {
    showToast(error.message || "健康记录保存失败");
    return;
  }

  const nextPetId = getNextPendingHealthPet(pet.id);
  if (nextPetId) {
    selectHomePet(nextPetId);
    showToast(pet.name + "的记录已保存，正在记录" + petProfiles[nextPetId].name);
    return;
  }
  renderHealthRecordFlow();
  renderDailyRecord();
  showToast(wasAlreadySubmitted ? pet.name + "的今日记录已更新" : "所有宠物的今日健康记录已完成");
}
renderAllPetControls();
removeOrphanedPetTasks();
document.querySelector("#health-submit-button")?.addEventListener("click", saveActiveHealthRecord);
const healthPanelToggle = document.querySelector("#health-panel-toggle");
healthPanelToggle?.addEventListener("click", () => {
  const healthPanel = healthPanelToggle.closest(".health-panel");
  const collapsed = !healthPanel.classList.contains("collapsed");
  healthPanel.classList.toggle("collapsed", collapsed);
  healthPanelToggle.setAttribute("aria-expanded", String(!collapsed));
  healthPanelToggle.querySelector("span").textContent = collapsed ? "展开" : "收起";
  healthPanelToggle.setAttribute("aria-label", collapsed ? "展开健康记录列表" : "收起健康记录列表");
});
document.querySelector("#health-flow-pets").addEventListener("click", (event) => {
  const button = event.target.closest("[data-health-pet]");
  if (button) updateHealthRecordPet(button.dataset.healthPet);
});
updateHealthRecordPet(activeHealthPetId);

const homePetSwitcher = document.querySelector(".pet-switcher");

homePetSwitcher.addEventListener("click", (event) => {
  if (suppressPetSelection) {
    event.preventDefault();
    return;
  }
  const addButton = event.target.closest(".add-pet-button");
  if (addButton) {
    openPetCreateModal();
    return;
  }
  const dot = event.target.closest(".pet-carousel-dot[data-carousel-key]");
  if (dot) {
    if (dot.dataset.carouselKey === "__add__") {
      homeCarouselKey = "__add__";
      updateHomePetCarouselLayout();
    } else {
      selectHomePet(dot.dataset.carouselKey);
    }
    return;
  }
  const button = event.target.closest("[data-pet]");
  if (button) {
    selectHomePet(button.dataset.pet);
    openActivePetDetail("home-page");
  }
});

let petCarouselGesture = null;
homePetSwitcher.addEventListener("pointerdown", (event) => {
  const card = event.target.closest(".pet-carousel-card");
  if (event.button !== 0 || !card) return;
  petCarouselGesture = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, carouselKey: card.dataset.pet || card.dataset.carouselKey };
  homePetSwitcher.classList.add("is-dragging");
});
homePetSwitcher.addEventListener("pointerup", (event) => {
  if (!petCarouselGesture || petCarouselGesture.pointerId !== event.pointerId) return;
  const gesture = petCarouselGesture;
  const deltaX = event.clientX - gesture.startX;
  const deltaY = event.clientY - gesture.startY;
  petCarouselGesture = null;
  homePetSwitcher.classList.remove("is-dragging");
  const movement = Math.hypot(deltaX, deltaY);
  if (movement < 12) return;
  if (Math.abs(deltaX) < 42 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
  suppressPetSelection = true;
  shiftHomePet(deltaX < 0 ? 1 : -1);
  window.setTimeout(() => { suppressPetSelection = false; }, 0);
});
homePetSwitcher.addEventListener("pointercancel", () => {
  petCarouselGesture = null;
  homePetSwitcher.classList.remove("is-dragging");
});
homePetSwitcher.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  shiftHomePet(event.key === "ArrowRight" ? 1 : -1);
  homePetSwitcher.querySelector(".pet-carousel-card.active")?.focus();
});

document.querySelector("#mine-pet-add")?.addEventListener("click", openPetCreateModal);
document.querySelector("#mine-pet-list")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mine-pet-id]");
  if (!button || !petProfiles[button.dataset.minePetId]) return;
  activePetId = button.dataset.minePetId;
  homeCarouselKey = activePetId;
  renderAllPetControls();
  openActivePetDetail("mine-page");
});
document.querySelector(".records-pet-switcher").addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-pet]");
  if (button) {
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateRecordsPet(button.dataset.recordPet);
  }
});

document.querySelector(".open-pet-detail")?.addEventListener("click", openActivePetDetail);
document.querySelector(".open-pet-detail")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openActivePetDetail(); }
});
document.querySelector("#pet-detail-edit").addEventListener("click", () => setPetDetailEditing(true));
document.querySelector("#pet-detail-cancel").addEventListener("click", renderPetDetail);
document.querySelector("#pet-detail-save").addEventListener("click", savePetDetail);
document.querySelector("#pet-detail-delete").addEventListener("click", deleteActivePet);
document.querySelectorAll(".close-pet-modal").forEach((button) => {
  button.addEventListener("click", closePetCreateModal);
});

petModal.addEventListener("click", (event) => {
  if (event.target === petModal) closePetCreateModal();
});

document.querySelector("#pet-create-form").addEventListener("submit", createPetFromForm);
document.querySelector("#pet-photo-input").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    event.target.value = "";
    showToast("照片不能超过2MB");
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    pendingPetAvatar = String(reader.result || "");
    const preview = document.querySelector("#pet-photo-preview");
    preview.src = pendingPetAvatar;
    preview.hidden = false;
    document.querySelector("#pet-photo-preview-wrap").classList.add("has-preview");
  });
  reader.readAsDataURL(file);
});

document.querySelectorAll(".calendar-row button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement
      .querySelectorAll("button")
      .forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    if (button.dataset.date) {
      selectedRecordDate = parseLocalDateKey(button.dataset.date);
      document.querySelector("#week-range-title").textContent = formatFullDate(selectedRecordDate);
      renderDailyRecord();
    }
  });
});

document.querySelector(".week-prev").addEventListener("click", () => {
  weekStartDate.setDate(weekStartDate.getDate() - 7);
  selectedRecordDate = new Date(weekStartDate);
  renderWeekCalendar();
});

document.querySelector(".week-next").addEventListener("click", () => {
  weekStartDate.setDate(weekStartDate.getDate() + 7);
  selectedRecordDate = new Date(weekStartDate);
  renderWeekCalendar();
});

document.querySelector("#record-manage-save")?.addEventListener("click", saveManagedRecord);
document.querySelector("#record-manage-page .history-list")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-date]");
  if (!button) return;
  renderRecordManagement(button.dataset.recordDate);
});
document.querySelectorAll(".notification-button, .notification-entry").forEach((button) => {
  button.addEventListener("click", () => {
    previousPageId = document.querySelector(".page.active")?.id || "mine-page";
    pages.forEach((page) => page.classList.remove("active"));
    navButtons.forEach((item) => item.classList.remove("active"));
    document.querySelector("#message-page").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.querySelector(".message-back").addEventListener("click", () => {
  pages.forEach((page) => page.classList.remove("active"));
  navButtons.forEach((item) => item.classList.remove("active"));
  document.querySelector(`#${previousPageId}`).classList.add("active");
  document.querySelector(`.bottom-nav button[data-target="${previousPageId}"]`)?.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.querySelectorAll(".wiki-category-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    renderInlineBreedList(button.dataset.category);
  });
});

document.querySelector("#wiki-search-input").addEventListener("input", (event) => {
  wikiSearchQuery = event.target.value.trim().toLowerCase();
  renderBreedCards("wiki-inline-breed-list", activeBreedCategory);
});

document.querySelector(".open-scan-camera").addEventListener("click", () => {
  showWikiView("scan-camera-view");
});

document.querySelector(".scan-back").addEventListener("click", () => {
  showWikiView("wiki-home-view");
});

document.querySelector("#wiki-inline-breed-list").addEventListener("click", (event) => {
  const card = event.target.closest(".breed-list-card");
  if (!card) return;
  renderBreedDetail(Number(card.dataset.breedIndex));
});

document.querySelector("#breed-list").addEventListener("click", (event) => {
  const card = event.target.closest(".breed-list-card");
  if (!card) return;
  renderBreedDetail(Number(card.dataset.breedIndex));
});

document.querySelector(".wiki-home-back").addEventListener("click", () => {
  showWikiView("wiki-home-view");
});

document.querySelector(".breed-list-back").addEventListener("click", () => {
  showWikiView("wiki-home-view");
});

function updateFamilyTaskProgress() {
  const tasks = [...document.querySelectorAll("#family-task-list .family-task-item")];
  const completedCount = tasks.filter((task) => task.classList.contains("completed")).length;
  const progressLabel = document.querySelector("#family-task-progress");
  const progressCircle = document.querySelector(".family-collab-progress strong");
  if (progressLabel) progressLabel.textContent = `已完成 ${completedCount}/${tasks.length}`;
  if (progressCircle) progressCircle.innerHTML = `${completedCount}<small>/${tasks.length}</small>`;
}

document.querySelector("#family-page")?.addEventListener("click", (event) => {
  const taskButton = event.target.closest("[data-complete-family-task]");
  if (taskButton) {
    const task = taskButton.closest(".family-task-item");
    if (task.classList.contains("completed")) {
      showToast(`${task.dataset.familyTask}已经记录完成，请勿重复操作`);
      return;
    }
    if (task.dataset.familyTask === "体内驱虫" && !task.dataset.confirmed) {
      task.dataset.confirmed = "pending";
      taskButton.innerHTML = "<span>!</span>再次确认用药";
      showToast("请核对药名和剂量后再次确认");
      return;
    }
    task.classList.remove("pending");
    task.classList.add("completed");
    taskButton.innerHTML = "<span>✓</span>已完成";
    task.querySelector("small").textContent = `刚刚 · 小鱼已完成`;
    task.querySelector("em").textContent = "小鱼";
    const activityList = document.querySelector("#family-activity-list");
    activityList.insertAdjacentHTML("afterbegin", `<article><i>✓</i><div><strong>小鱼完成了${task.dataset.familyTask}</strong><span>刚刚 · 宠物照护</span></div></article>`);
    updateFamilyTaskProgress();
    showToast(`${task.dataset.familyTask}已同步给家庭成员`);
    return;
  }

  const roleButton = event.target.closest("[data-family-role]");
  if (roleButton) {
    if (roleButton.classList.contains("owner")) {
      showToast("管理员拥有完整权限，如需移交请进入成员管理");
      return;
    }
    const roles = ["成员", "只读", "临时"];
    const nextRole = roles[(roles.indexOf(roleButton.textContent.trim()) + 1) % roles.length];
    roleButton.textContent = nextRole;
    roleButton.classList.toggle("readonly", nextRole === "只读");
    showToast(`成员权限已调整为${nextRole}`);
    return;
  }

  const actionButton = event.target.closest("[data-family-action]");
  if (actionButton) {
    const messages = {
      invite: "家庭邀请码 FAMILY-2026 已准备分享",
      temporary: "已打开临时照顾人邀请，可设置失效时间",
      task: "已打开家庭任务创建",
      reminder: "已打开共享提醒创建",
      activity: "已展示全部家庭动态",
    };
    showToast(messages[actionButton.dataset.familyAction] || "家庭协作功能已打开");
  }
});

renderInlineBreedList("dog");
renderWeekCalendar();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncRecordCalendarToToday();
});
setInterval(syncRecordCalendarToToday, 60 * 1000);
