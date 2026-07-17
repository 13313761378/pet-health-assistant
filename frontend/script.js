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
let activeRecordPetName = "豆包";
let activePetName = "豆包";
let activeHealthPetName = "豆包";
let toastTimer;
const submittedHealthPets = new Set();
let draggedPetName = "";
let pointerPetSort = null;
let suppressPetSelection = false;
let petProfileOrder = [];

const petProfiles = {
  豆包: {
    name: "豆包",
    desc: "柯基 · 2岁 · 公",
    avatar: "https://cdn.pixabay.com/photo/2020/03/31/19/20/dog-4988986_1280.jpg",
    days: 286,
    score: 92,
    healthLabel: "优秀",
    taskProgress: "3/4",
    record: {
      feeding: 2,
      water: "正常",
      walk: 3.2,
      weight: 10.8,
      stool: "正常",
      mood: "活跃",
    },
  },
  奶糖: {
    name: "奶糖",
    desc: "比熊 · 1岁 · 母",
    avatar: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=320&q=80",
    days: 124,
    score: 88,
    healthLabel: "良好",
    taskProgress: "2/4",
    record: {
      feeding: 1.5,
      water: "少",
      walk: 2.1,
      weight: 5.6,
      stool: "正常",
      mood: "正常",
    },
  },
  团子: {
    name: "团子",
    desc: "英短 · 3岁 · 公",
    avatar: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=320&q=80",
    days: 318,
    score: 95,
    healthLabel: "优秀",
    taskProgress: "4/4",
    record: {
      feeding: 2,
      water: "正常",
      walk: 0.6,
      weight: 4.9,
      stool: "偏软",
      mood: "低迷",
    },
  },
};

const PET_STORAGE_KEY = "pet-health-assistant.pet-profiles.v1";
const PET_ORDER_STORAGE_KEY = "pet-health-assistant.pet-order.v1";
const PET_ACCESS_TOKEN_KEY = "petHealthAccessToken";
let pendingPetAvatar = "";

function syncPetProfileOrder(preferredOrder = petProfileOrder) {
  const availableNames = Object.keys(petProfiles);
  const validPreferredNames = Array.isArray(preferredOrder)
    ? preferredOrder.filter((name, index) => petProfiles[name] && preferredOrder.indexOf(name) === index)
    : [];
  petProfileOrder = [
    ...validPreferredNames,
    ...availableNames.filter((name) => !validPreferredNames.includes(name)),
  ];
}

function getPetNames() {
  syncPetProfileOrder();
  return [...petProfileOrder];
}

function restorePetProfiles() {
  try {
    const stored = JSON.parse(localStorage.getItem(PET_STORAGE_KEY) || "null");
    if (stored && typeof stored === "object" && !Array.isArray(stored) && Object.keys(stored).length > 0) {
      Object.keys(petProfiles).forEach((name) => delete petProfiles[name]);
      Object.entries(stored).forEach(([name, pet]) => {
        if (pet && typeof pet === "object" && pet.name && pet.record) petProfiles[name] = pet;
      });
    }
    const storedOrder = JSON.parse(localStorage.getItem(PET_ORDER_STORAGE_KEY) || "null");
    syncPetProfileOrder(storedOrder);
  } catch (error) {
    console.warn("无法读取本地宠物资料，将使用默认数据", error);
    syncPetProfileOrder();
  }
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
if (!petProfiles[activePetName]) activePetName = getPetNames()[0];
if (!petProfiles[activeRecordPetName]) activeRecordPetName = activePetName;
if (!petProfiles[activeHealthPetName]) activeHealthPetName = activePetName;

const recordHistoryData = {
  today: {
    label: "今日数据",
    feeding: 2,
    water: "正常",
    walk: 3.2,
    weight: 10.8,
    stool: "正常",
    mood: "活跃",
  },
  yesterday: {
    label: "昨天数据",
    feeding: 2,
    water: "正常",
    walk: 2.4,
    weight: 10.9,
    stool: "偏软",
    mood: "正常",
  },
  "0605": {
    label: "06-05 数据",
    feeding: 3,
    water: "多",
    walk: 2.8,
    weight: 10.8,
    stool: "正常",
    mood: "低迷",
  },
};

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

const previousRecordDate = new Date(initialRecordDate);
previousRecordDate.setDate(previousRecordDate.getDate() - 1);

const dailyRecordData = {
  [formatLocalDateKey(initialRecordDate)]: {
    weight: "10.8 kg",
    feeding: "2 勺",
    water: "正常",
    walk: "3.2 公里",
    stool: "正常",
    mood: "活跃",
  },
  [formatLocalDateKey(previousRecordDate)]: {
    weight: "10.9 kg",
    feeding: "2 勺",
    water: "正常",
    walk: "2.4 公里",
    stool: "偏软",
    mood: "正常",
  },
  "2026-06-04": {
    weight: "10.8 kg",
    feeding: "2 勺",
    water: "正常",
    walk: "3.2 公里",
    stool: "正常",
    mood: "活跃",
  },
  "2026-06-05": {
    weight: "10.8 kg",
    feeding: "3 勺",
    water: "多",
    walk: "2.8 公里",
    stool: "正常",
    mood: "低迷",
  },
  "2026-06-06": {
    weight: "10.9 kg",
    feeding: "2 勺",
    water: "正常",
    walk: "2.4 公里",
    stool: "偏软",
    mood: "正常",
  },
};

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
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setSegmentedValue(selector, value) {
  const group = document.querySelector(selector);
  if (!group) return;
  group.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("selected", button.textContent.trim() === value);
  });
}

function renderManagedRecord(record) {
  document.querySelector("#manage-date-label").textContent = record.label;
  document.querySelector("#manage-feeding").value = record.feeding;
  document.querySelector("#manage-walk").value = record.walk;
  document.querySelector("#manage-weight").value = record.weight;
  setSegmentedValue("#manage-water", record.water);
  setSegmentedValue("#manage-stool", record.stool);
  setSegmentedValue("#manage-mood", record.mood);
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
  if (!dailyRecordData[todayKey]) {
    const pet = petProfiles[activeRecordPetName] || petProfiles[getPetNames()[0]];
    dailyRecordData[todayKey] = {
      weight: `${pet?.record?.weight || 0} kg`,
      feeding: `${pet?.record?.feeding || 0} 勺`,
      water: pet?.record?.water || "待记录",
      walk: `${pet?.record?.walk || 0} 公里`,
      stool: pet?.record?.stool || "待记录",
      mood: pet?.record?.mood || "待记录",
    };
  }
  renderWeekCalendar();
}

function formatShortDate(date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function getRecordForActivePet(key) {
  const datedRecord = dailyRecordData[key];
  if (!datedRecord) return null;
  if (activeRecordPetName === "豆包") return datedRecord;
  const pet = petProfiles[activeRecordPetName];
  if (!pet) return datedRecord;
  return {
    weight: `${pet.record.weight} kg`, feeding: `${pet.record.feeding} 勺`, water: pet.record.water,
    walk: `${pet.record.walk} 公里`, stool: pet.record.stool, mood: pet.record.mood,
  };
}

function updateRecordsPet(petName) {
  const pet = petProfiles[petName];
  if (!pet) return;
  activeRecordPetName = petName;
  const avatar = document.querySelector("#records-pet-avatar");
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
}

function renderDailyRecord() {
  const key = formatLocalDateKey(selectedRecordDate);
  const record = getRecordForActivePet(key);  const card = document.querySelector("#records-page .record-layout .content-card");
  const list = document.querySelector("#record-metric-list");
  document.querySelector("#record-date-label").textContent = formatShortDate(selectedRecordDate);
  document.querySelector("#record-status").textContent = record ? "已填写" : "无记录";
  card.classList.toggle("no-record", !record);
  if (!record) return;
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

document.querySelectorAll(".open-task-modal").forEach((button) => {
  button.addEventListener("click", () => {
    const isFamilyTask = button.dataset.taskContext === "family";
    modal.dataset.taskContext = isFamilyTask ? "family" : "standard";
    document.querySelector("#task-modal-title").textContent = isFamilyTask ? "新增家庭协作任务" : "新增 / 编辑任务";
    document.querySelector("#task-modal .eyebrow").textContent = isFamilyTask ? "家庭协作" : "任务";
    const taskNameInput = document.querySelector("#task-modal .task-form input");
    const saveTaskButton = document.querySelector("#task-modal .task-modal > .primary-button");
    taskNameInput.value = isFamilyTask ? "" : (taskNameInput.value || "傍晚遛弯");
    saveTaskButton.dataset.toast = isFamilyTask ? "家庭任务已创建并同步给成员" : "任务已保存";
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  });
});

document.querySelectorAll(".toast-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.closest("#task-modal") && modal.dataset.taskContext === "family") {
      const taskNameInput = document.querySelector("#task-modal .task-form input");
      const taskTimeInput = document.querySelector('#task-modal .task-form input[type="time"]');
      const taskName = taskNameInput.value.trim() || "新的家庭任务";
      const taskTime = taskTimeInput.value || "待设置";
      document.querySelector("#family-task-list").insertAdjacentHTML("beforeend", `
        <article class="family-task-item pending" data-family-task="${taskName.replace(/[<>"']/g, "")}">
          <span class="family-task-icon">📌</span>
          <div><strong>${taskName.replace(/[<>"']/g, "")}</strong><small>计划 ${taskTime} · 家庭协作任务</small></div>
          <em>待分配</em>
          <button class="family-task-status-button" type="button" data-complete-family-task><span>○</span>确认完成</button>
        </article>`);
      document.querySelector("#family-activity-list").insertAdjacentHTML("afterbegin", `<article><i>＋</i><div><strong>小鱼添加了${taskName.replace(/[<>"']/g, "")}</strong><span>刚刚 · 家庭任务</span></div></article>`);
      updateFamilyTaskProgress();
      button.dataset.toast = "家庭任务已创建并同步给成员";
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

function moveCompletedHomeTasksToBottom() {
  const taskList = document.querySelector("#home-page .home-task-list");
  if (!taskList) return;
  const completedTasks = [...taskList.querySelectorAll(".timeline-item.done")];
  completedTasks
    .sort((firstTask, secondTask) => {
      const toMinutes = (task) => {
        const [hours = 0, minutes = 0] = (task.querySelector("time")?.textContent || "0:0").trim().split(":").map(Number);
        return hours * 60 + minutes;
      };
      return toMinutes(firstTask) - toMinutes(secondTask);
    })
    .forEach((item) => taskList.appendChild(item));
}

document.querySelectorAll("#home-page .task-complete").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".timeline-item");
    if (!item || item.classList.contains("done")) return;
    item.classList.add("done");
    button.textContent = "✓";
    const note = item.querySelector("small");
    if (note) {
      note.textContent = note.textContent.replace("待完成", "已完成");
      if (!note.textContent.includes("已完成")) {
        note.textContent = `${note.textContent}，已完成`;
      }
    }
    const petName = item.dataset.taskPet || "宠物";
    moveCompletedHomeTasksToBottom();
    showToast(`${petName}任务已完成`);
  });
});
moveCompletedHomeTasksToBottom();

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

document.querySelectorAll(".pet-option input").forEach((input) => {
  input.addEventListener("change", () => {
    input.closest(".pet-option").classList.toggle("selected", input.checked);
  });
});

const petProfileExtras = {
  豆包: { birthDate: "2024-03-18", hobbies: "散步、接飞盘" },
  奶糖: { birthDate: "2025-01-12", hobbies: "玩球、晒太阳" },
  团子: { birthDate: "2023-05-06", hobbies: "逗猫棒、钻纸箱" },
};

function formatPetBirthDate(value) {
  if (!value) return "未填写";
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}
function normalizePetProfile(pet) {
  if (!pet || pet.breed !== undefined) return pet;
  const [breed = "", ageLabel = "", gender = ""] = pet.desc.split(" · ");
  pet.breed = breed;
  pet.age = Math.max(0, Number.parseInt(ageLabel, 10) || 0);
  pet.gender = gender || "公";
  const extras = petProfileExtras[pet.name] || {};
  pet.birthDate ??= extras.birthDate || "";
  pet.hobbies ??= extras.hobbies || "";
  return pet;
}

function escapePetMarkup(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderAllPetControls() {
  const pets = getPetNames().map((name) => normalizePetProfile(petProfiles[name]));
  const homeSwitcher = document.querySelector(".pet-switcher");
  const recordsSwitcher = document.querySelector(".records-pet-switcher");
  const healthSwitcher = document.querySelector("#health-flow-pets");
  if (!homeSwitcher || !recordsSwitcher || !healthSwitcher) return;

  healthSwitcher.dataset.count = String(pets.length);
  healthSwitcher.dataset.overflow = String(pets.length > 4);
  healthSwitcher.closest(".health-record-flow")?.classList.toggle("single-pet", pets.length === 1);

  homeSwitcher.innerHTML = pets.map((pet) => `
    <button class="${pet.name === activePetName ? "active" : ""}" type="button" data-pet="${escapePetMarkup(pet.name)}" title="拖动调整宠物顺序" aria-label="${escapePetMarkup(pet.name)}，按住拖动可调整顺序">
      <img src="${escapePetMarkup(pet.avatar)}" alt="${escapePetMarkup(pet.name)}" />
      <span>${escapePetMarkup(pet.name)}</span>
      <i class="pet-drag-grip" aria-hidden="true">⠿</i>
    </button>`).join("") + `
    <button class="add-pet-button" type="button"><span class="plus-mark">+</span><span>新增</span></button>`;

  recordsSwitcher.innerHTML = pets.map((pet) => `
    <button class="${pet.name === activeRecordPetName ? "active" : ""}" type="button" data-record-pet="${escapePetMarkup(pet.name)}">
      <img src="${escapePetMarkup(pet.avatar)}" alt="" /><span>${escapePetMarkup(pet.name)}</span><small>${pet.score}%</small>
    </button>`).join("");

  healthSwitcher.innerHTML = pets.map((pet, index) => `${index ? '<span class="health-flow-line"></span>' : ""}
    <button class="health-flow-pet" type="button" data-health-pet="${escapePetMarkup(pet.name)}" aria-label="切换为${escapePetMarkup(pet.name)}的健康记录">
      <i>○</i><b>${escapePetMarkup(pet.name)}</b>
    </button>`).join("");
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
  if (!button || button.dataset.pet === draggedPetName) return;
  button.classList.add(placeAfter ? "drop-after" : "drop-before");
  button.dataset.dropPosition = placeAfter ? "after" : "before";
}

function reorderPetProfiles(sourceName, targetName, placeAfter = false) {
  const names = getPetNames();
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
  if (!name) { showToast("请输入宠物名称"); return; }
  if (!breed) { showToast("请输入宠物品种"); return; }
  if (!Number.isInteger(age) || age < 0 || age > 40) { showToast("请输入0到40岁的整数年龄"); return; }
  if (petProfiles[name]) { showToast("宠物名称已存在"); return; }

  const pet = {
    name, species, breed, age, gender, genderCode,
    desc: `${breed} · ${age}岁 · ${gender}`,
    avatar: pendingPetAvatar || defaultPetAvatar(species),
    birthDate: `${Math.max(1980, new Date().getFullYear() - age)}-01-01`,
    days: 0,
    score: 100,
    healthLabel: "待记录",
    taskProgress: "0/0",
    hobbies: "",
    record: { feeding: 0, water: "正常", walk: 0, weight: 0, stool: "正常", mood: "正常" },
  };
  const submitButton = document.querySelector("#pet-create-submit");
  submitButton.disabled = true;
  submitButton.textContent = "正在保存…";
  try {
    const serverPet = await requestPetApi("", { method: "POST", body: JSON.stringify(petApiPayload(pet)) });
    if (serverPet) pet.id = serverPet.id;
    petProfiles[name] = pet;
    petProfileOrder.push(name);
    persistPetProfiles();
    activePetName = name;
    renderAllPetControls();
    selectHomePet(name);
    renderHealthRecordFlow();
    closePetCreateModal();
    showToast(`${name}已加入宠物列表`);
  } catch (error) {
    showToast(error.message || "宠物保存失败");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "保存宠物";
  }
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
  const pet = normalizePetProfile(petProfiles[activePetName]);
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

function openActivePetDetail() {
  renderPetDetail();
  showPage("pet-detail-page");
}

async function savePetDetail() {
  const pet = normalizePetProfile(petProfiles[activePetName]);
  if (!pet) return;
  const oldName = activePetName;
  const newName = document.querySelector("#pet-detail-name-input").value.trim();
  const breed = document.querySelector("#pet-detail-breed-input").value.trim();
  const age = Math.max(0, Number.parseInt(document.querySelector("#pet-detail-age-input").value, 10) || 0);
  const gender = document.querySelector("#pet-detail-gender-input").value;
  const birthDate = document.querySelector("#pet-detail-birth-input").value;
  const hobbies = document.querySelector("#pet-detail-hobbies-input").value.trim();
  if (!newName) { showToast("请输入宠物名称"); return; }
  if (!breed) { showToast("请输入宠物品种"); return; }
  if (newName !== oldName && petProfiles[newName]) { showToast("宠物名称已存在"); return; }

  const nextPet = { ...pet, name: newName, breed, age, gender, birthDate, hobbies };
  if (pet.id && getPetAccessToken()) {
    try {
      await requestPetApi(`/${pet.id}`, { method: "PUT", body: JSON.stringify(petApiPayload(nextPet)) });
    } catch (error) {
      showToast(error.message || "宠物信息保存失败");
      return;
    }
  }

  pet.name = newName;
  pet.breed = breed;
  pet.age = age;
  pet.gender = gender;
  pet.birthDate = birthDate;
  pet.hobbies = hobbies;
  pet.desc = `${breed} · ${age}岁 · ${gender}`;
  if (newName !== oldName) {
    petProfileOrder = petProfileOrder.map((name) => name === oldName ? newName : name);
    petProfiles[newName] = pet;
    delete petProfiles[oldName];
    document.querySelectorAll(`[data-pet="${oldName}"]`).forEach((button) => {
      button.dataset.pet = newName;
      const label = button.querySelector("span");
      if (label) label.textContent = newName;
    });
    document.querySelectorAll(`[data-record-pet="${oldName}"]`).forEach((button) => {
      button.dataset.recordPet = newName;
      const label = button.querySelector("span");
      if (label) label.textContent = newName;
    });
    document.querySelectorAll(`[data-health-pet="${oldName}"]`).forEach((button) => {
      button.dataset.healthPet = newName;
      button.setAttribute("aria-label", `切换为${newName}的健康记录`);
      const label = button.querySelector("b");
      if (label) label.textContent = newName;
    });
    if (submittedHealthPets.has(oldName)) {
      submittedHealthPets.delete(oldName);
      submittedHealthPets.add(newName);
    }
    if (activeHealthPetName === oldName) activeHealthPetName = newName;
  }
  activePetName = newName;
  persistPetProfiles();
  renderAllPetControls();
  updateCurrentPet(newName);
  if (activeRecordPetName === oldName) updateRecordsPet(newName);
  if (activeHealthPetName === newName) updateHealthRecordPet(newName);
  else renderHealthRecordFlow();
  renderPetDetail();
  showToast("宠物信息已保存");
}

async function deleteActivePet() {
  const names = getPetNames();
  if (names.length <= 1) { showToast("至少需要保留一只宠物"); return; }
  const pet = petProfiles[activePetName];
  const confirmed = pet && window.confirm(`确定要删除宠物“${pet.name}”吗？\n删除后相关任务和健康记录可能无法恢复。`);
  if (!confirmed) return;
  if (pet.id && getPetAccessToken()) {
    try {
      await requestPetApi(`/${pet.id}`, { method: "DELETE" });
    } catch (error) {
      showToast(error.message || "宠物删除失败");
      return;
    }
  }
  const deletedName = activePetName;
  delete petProfiles[deletedName];
  petProfileOrder = petProfileOrder.filter((name) => name !== deletedName);
  submittedHealthPets.delete(deletedName);
  const nextName = getPetNames()[0];
  activePetName = nextName;
  activeRecordPetName = nextName;
  persistPetProfiles();
  renderAllPetControls();
  updateCurrentPet(nextName);
  updateRecordsPet(nextName);
  if (activeHealthPetName === deletedName) updateHealthRecordPet(nextName);
  else renderHealthRecordFlow();
  showPage("home-page", "home-page");
  showToast("宠物已删除");
}
function updateCurrentPet(petName) {
  const pet = petProfiles[petName];
  activePetName = petName;
  if (!pet) return;

  document.querySelector("#current-pet-avatar").src = pet.avatar;
  document.querySelector("#current-pet-avatar").alt = `${pet.name}照片`;
  document.querySelector("#current-pet-avatar").setAttribute("aria-label", `查看${pet.name}的宠物信息`);
  document.querySelector("#current-pet-name").textContent = pet.name;
  document.querySelector("#current-pet-desc").textContent = pet.desc;
  document.querySelector("#current-pet-days").textContent = `${pet.days}天`;
  document.querySelector("#current-pet-score").textContent = `${pet.score}%`;
  document.querySelector("#current-pet-health-label").textContent = pet.taskProgress;
}

function updateHealthRecordPet(petName) {
  const pet = petProfiles[petName];
  if (!pet) return;
  activeHealthPetName = petName;
  document.querySelector("#health-record-title").textContent = `记录${pet.name}今天的身体状态`;

  document.querySelector("#home-feeding").value = pet.record.feeding;
  document.querySelector("#home-walk").value = pet.record.walk;
  document.querySelector("#home-weight").value = pet.record.weight;
  setSegmentedValue("#home-water", pet.record.water);
  setSegmentedValue("#home-stool", pet.record.stool);
  setSegmentedValue("#home-mood", pet.record.mood);
  renderHealthRecordFlow();
}

function getHealthPetNames() {
  return getPetNames();
}

function getNextPendingHealthPet(currentPetName) {
  const petNames = getHealthPetNames();
  const currentIndex = petNames.indexOf(currentPetName);
  for (let offset = 1; offset < petNames.length; offset += 1) {
    const candidate = petNames[(currentIndex + offset) % petNames.length];
    if (!submittedHealthPets.has(candidate)) return candidate;
  }
  return null;
}

function selectHomePet(petName) {
  document.querySelectorAll(".pet-switcher [data-pet]").forEach((item) => {
    item.classList.toggle("active", item.dataset.pet === petName);
  });
  updateCurrentPet(petName);
}

function renderHealthRecordFlow() {
  const petNames = getHealthPetNames();
  const completedCount = petNames.filter((petName) => submittedHealthPets.has(petName)).length;
  const allCompleted = petNames.length > 0 && completedCount === petNames.length;
  const healthPanel = document.querySelector(".health-panel");
  const progress = document.querySelector("#health-flow-progress");
  const flowHint = document.querySelector("#health-flow-hint");
  const submitButton = document.querySelector("#health-submit-button");
  const completeList = document.querySelector("#health-complete-list");
  const currentLabel = document.querySelector("#health-flow-current");
  const nextLabel = document.querySelector("#health-flow-next");
  const singlePetState = document.querySelector("#single-pet-flow-state");

  if (progress) progress.textContent = `今日记录 ${completedCount}/${petNames.length}`;
  if (flowHint) flowHint.textContent = petNames.length === 1
    ? `记录${petNames[0]}今天的身体状态`
    : "提交后将自动进入下一只宠物";
  document.querySelectorAll("#health-flow-pets [data-health-pet]").forEach((button) => {
    const petName = button.dataset.healthPet;
    button.classList.toggle("current", petName === activeHealthPetName && !allCompleted);
    button.classList.toggle("completed", submittedHealthPets.has(petName));
    button.setAttribute("aria-pressed", String(petName === activeHealthPetName && !allCompleted));
    const marker = button.querySelector("i");
    if (marker) marker.textContent = submittedHealthPets.has(petName) ? "✓" : petName === activeHealthPetName && !allCompleted ? "●" : "○";
    button.nextElementSibling?.classList.toggle("completed", submittedHealthPets.has(petName));
  });

  healthPanel?.classList.toggle("submitted", allCompleted);
  if (completeList) {
    completeList.innerHTML = petNames.map((petName) => `<span class="health-complete-item"><b class="health-complete-check">✓</b>${petName}<em class="health-complete-status">已记录</em></span>`).join("");
  }
  if (allCompleted) {
    if (currentLabel) currentLabel.textContent = "今日记录已全部完成";
    if (nextLabel) nextLabel.textContent = `${completedCount}/${petNames.length} 已记录`;
  }
  if (!submitButton || allCompleted) return;

  if (petNames.length === 1) {
    const onlyPetName = petNames[0];
    if (singlePetState) singlePetState.querySelector("span").textContent = `当前宠物：${onlyPetName} · 今天尚未提交健康记录`;
    if (currentLabel) currentLabel.textContent = "唯一宠物，无需切换";
    if (nextLabel) nextLabel.textContent = "完成后结束今日记录";
    submitButton.textContent = "保存并完成今日记录";
    return;
  }

  const nextPetName = getNextPendingHealthPet(activeHealthPetName);
  if (currentLabel) currentLabel.textContent = `当前：${activeHealthPetName}`;
  if (nextLabel) nextLabel.textContent = nextPetName ? `下一只：${nextPetName}` : "最后一只记录";
  if (!nextPetName) {
    submitButton.textContent = "保存并完成今日记录";
  } else {
    const action = submittedHealthPets.has(activeHealthPetName) ? "更新并记录下一只" : "保存并记录下一只";
    submitButton.textContent = `${action}：${nextPetName}`;
  }
}

function saveActiveHealthRecord() {
  const pet = petProfiles[activeHealthPetName];
  if (!pet) return;
  pet.record.feeding = Number(document.querySelector("#home-feeding").value || 0);
  pet.record.walk = Number(document.querySelector("#home-walk").value || 0);
  pet.record.weight = Number(document.querySelector("#home-weight").value || 0);
  pet.record.water = document.querySelector("#home-water .selected")?.dataset.value || pet.record.water;
  pet.record.stool = document.querySelector("#home-stool .selected")?.dataset.value || pet.record.stool;
  pet.record.mood = document.querySelector("#home-mood .selected")?.dataset.value || pet.record.mood;
  try { persistPetProfiles(); } catch (error) { showToast(error.message); return; }

  const savedPetName = activeHealthPetName;
  submittedHealthPets.add(savedPetName);
  const nextPetName = getNextPendingHealthPet(savedPetName);
  if (nextPetName) {
    updateHealthRecordPet(nextPetName);
    showToast(`${savedPetName}的记录已保存，正在记录${nextPetName}`);
    return;
  }
  renderHealthRecordFlow();
  showToast("所有宠物的今日健康记录已完成");
}

renderAllPetControls();
document.querySelector("#health-submit-button")?.addEventListener("click", saveActiveHealthRecord);
document.querySelector("#health-flow-pets").addEventListener("click", (event) => {
  const button = event.target.closest("[data-health-pet]");
  if (button) updateHealthRecordPet(button.dataset.healthPet);
});
updateHealthRecordPet(activeHealthPetName);

const homePetSwitcher = document.querySelector(".pet-switcher");

homePetSwitcher.addEventListener("click", (event) => {
  if (suppressPetSelection) {
    event.preventDefault();
    return;
  }
  const addButton = event.target.closest(".add-pet-button");
  if (addButton) {
    petModal.classList.add("active");
    petModal.setAttribute("aria-hidden", "false");
    setTimeout(() => document.querySelector("#pet-create-name").focus(), 0);
    return;
  }
  const button = event.target.closest("[data-pet]");
  if (button) selectHomePet(button.dataset.pet);
});

function activatePointerPetSort() {
  if (!pointerPetSort || pointerPetSort.active) return;
  pointerPetSort.active = true;
  draggedPetName = pointerPetSort.sourceName;
  pointerPetSort.sourceButton.classList.add("dragging");
  pointerPetSort.sourceButton.style.setProperty("--drag-x", "0px");
  pointerPetSort.sourceButton.style.setProperty("--drag-y", "0px");
  if (pointerPetSort.pointerType !== "mouse" && navigator.vibrate) navigator.vibrate(25);
}

function getNearestPetDropTarget(clientX, sourceName, sourceCenterX) {
  const buttons = [...homePetSwitcher.querySelectorAll("[data-pet]")];
  const sourceIndex = buttons.findIndex((button) => button.dataset.pet === sourceName);
  if (sourceIndex < 0 || !Number.isFinite(sourceCenterX)) return null;
  const candidates = buttons
    .map((button, index) => {
      const rect = button.getBoundingClientRect();
      return { button, index, centerX: rect.left + rect.width / 2 };
    })
    .filter(({ button }) => button.dataset.pet !== sourceName);
  if (!candidates.length) return null;
  const nearest = candidates.reduce((closest, candidate) => (
    Math.abs(candidate.centerX - clientX) < Math.abs(closest.centerX - clientX) ? candidate : closest
  ));
  const activationBoundary = (sourceCenterX + nearest.centerX) / 2;
  if (nearest.index > sourceIndex && clientX <= activationBoundary) return null;
  if (nearest.index < sourceIndex && clientX >= activationBoundary) return null;
  return { button: nearest.button, placeAfter: sourceIndex < nearest.index };
}

homePetSwitcher.addEventListener("pointerdown", (event) => {
  const button = event.target.closest("[data-pet]");
  if (!button) return;
  const sourceRect = button.getBoundingClientRect();
  pointerPetSort = {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    sourceName: button.dataset.pet,
    sourceButton: button,
    startX: event.clientX,
    startY: event.clientY,
    sourceCenterX: sourceRect.left + sourceRect.width / 2,
    active: false,
    targetButton: null,
    placeAfter: false,
    timer: event.pointerType === "mouse" ? null : setTimeout(activatePointerPetSort, 260),
  };
  button.setPointerCapture?.(event.pointerId);
});

homePetSwitcher.addEventListener("pointermove", (event) => {
  if (!pointerPetSort || event.pointerId !== pointerPetSort.pointerId) return;
  if (!pointerPetSort.active) {
    const moved = Math.hypot(event.clientX - pointerPetSort.startX, event.clientY - pointerPetSort.startY);
    if (pointerPetSort.pointerType === "mouse" && moved > 4) {
      activatePointerPetSort();
    } else if (pointerPetSort.pointerType !== "mouse" && moved > 9) {
      clearTimeout(pointerPetSort.timer);
      pointerPetSort = null;
      clearPetDropIndicators();
      return;
    }
  }
  if (!pointerPetSort?.active) return;
  event.preventDefault();
  pointerPetSort.sourceButton.style.setProperty("--drag-x", `${event.clientX - pointerPetSort.startX}px`);
  pointerPetSort.sourceButton.style.setProperty("--drag-y", `${event.clientY - pointerPetSort.startY}px`);
  const target = getNearestPetDropTarget(event.clientX, pointerPetSort.sourceName, pointerPetSort.sourceCenterX);
  if (!target) {
    pointerPetSort.targetButton = null;
    clearPetDropIndicators();
    return;
  }
  pointerPetSort.targetButton = target.button;
  pointerPetSort.placeAfter = target.placeAfter;
  markPetDropTarget(target.button, target.placeAfter);
});

function finishPointerPetSort(event, commit = true) {
  if (!pointerPetSort || event.pointerId !== pointerPetSort.pointerId) return;
  clearTimeout(pointerPetSort.timer);
  if (pointerPetSort.active) {
    suppressPetSelection = true;
    if (commit && pointerPetSort.targetButton) {
      reorderPetProfiles(pointerPetSort.sourceName, pointerPetSort.targetButton.dataset.pet, pointerPetSort.placeAfter);
    }
    setTimeout(() => { suppressPetSelection = false; }, 0);
  }
  draggedPetName = "";
  pointerPetSort = null;
  clearPetDropIndicators();
}

homePetSwitcher.addEventListener("pointerup", finishPointerPetSort);
homePetSwitcher.addEventListener("pointercancel", (event) => finishPointerPetSort(event, false));

homePetSwitcher.addEventListener("keydown", (event) => {
  if (!event.altKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  const button = event.target.closest("[data-pet]");
  if (!button) return;
  const names = getPetNames();
  const index = names.indexOf(button.dataset.pet);
  const targetIndex = event.key === "ArrowLeft" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= names.length) return;
  event.preventDefault();
  reorderPetProfiles(button.dataset.pet, names[targetIndex], event.key === "ArrowRight");
  document.querySelector(`.pet-switcher [data-pet="${CSS.escape(button.dataset.pet)}"]`)?.focus();
});
document.querySelector(".records-pet-switcher").addEventListener("click", (event) => {
  const button = event.target.closest("[data-record-pet]");
  if (button) {
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateRecordsPet(button.dataset.recordPet);
  }
});

document.querySelector(".open-pet-detail").addEventListener("click", openActivePetDetail);
document.querySelector(".open-pet-detail").addEventListener("keydown", (event) => {
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

document.querySelectorAll(".history-item").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll(".history-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const record = recordHistoryData[button.dataset.history];
    if (record) {
      renderManagedRecord(record);
    }
    showToast(`正在查看 ${button.querySelector("time")?.textContent || "历史"} 记录`);
  });
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
    activityList.insertAdjacentHTML("afterbegin", `<article><i>✓</i><div><strong>小鱼完成了${task.dataset.familyTask}</strong><span>刚刚 · 豆包</span></div></article>`);
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
