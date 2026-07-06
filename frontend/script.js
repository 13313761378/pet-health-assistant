const navButtons = document.querySelectorAll(".bottom-nav button");
const pages = document.querySelectorAll(".page");
const modal = document.querySelector("#task-modal");
const petModal = document.querySelector("#pet-modal");
const toast = document.querySelector("#app-toast");
let previousPageId = "mine-page";
let activeBreedCategory = "dog";
let toastTimer;

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
let weekStartDate = new Date(2026, 5, 1);
let selectedRecordDate = new Date(2026, 5, 4);

const dailyRecordData = {
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
        image: "https://images.unsplash.com/photo-1554456854-55a089fd4cb2?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1557973557-ddfa9ee8c8c6?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?auto=format&fit=crop&w=720&q=85",
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
        image: "https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&w=720&q=85",
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

function formatShortDate(date) {
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function renderDailyRecord() {
  const key = formatLocalDateKey(selectedRecordDate);
  const record = dailyRecordData[key];
  const card = document.querySelector("#records-page .record-layout .content-card");
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

function renderBreedList(category) {
  activeBreedCategory = category;
  const categoryData = breedData[category];
  document.querySelector("#breed-list-title").textContent = categoryData.title;
  document.querySelector("#breed-list").innerHTML = categoryData.breeds
    .map(
      (breed, index) => `
        <button class="breed-list-card" type="button" data-breed-index="${index}">
          <img src="${breed.image}" alt="${breed.name}" />
          <div>
            <strong>${breed.name}</strong>
            <span>${breed.desc}</span>
          </div>
        </button>
      `,
    )
    .join("");
  showWikiView("breed-list-view");
}

function renderInlineBreedList(category) {
  activeBreedCategory = category;
  const categoryData = breedData[category];
  document.querySelector("#wiki-category-title").textContent = categoryData.title;
  document.querySelectorAll(".wiki-category-grid button").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === category);
  });
  document.querySelector("#wiki-inline-breed-list").innerHTML = categoryData.breeds
    .map(
      (breed, index) => `
        <button class="breed-list-card" type="button" data-breed-index="${index}">
          <img src="${breed.image}" alt="${breed.name}" />
          <div>
            <strong>${breed.name}</strong>
            <span>${breed.desc}</span>
          </div>
        </button>
      `,
    )
    .join("");
}

function renderBreedDetail(index) {
  const breed = breedData[activeBreedCategory].breeds[index];
  document.querySelector("#breed-detail-title").textContent = breed.name;
  document.querySelector("#breed-detail-name").textContent = breed.name;
  document.querySelector("#breed-detail-intro").textContent = breed.intro;
  const image = document.querySelector("#breed-detail-image");
  image.src = breed.image;
  image.alt = `${breed.name}封面图`;
  document.querySelector("#breed-detail-grid").innerHTML = Object.entries(breed.info)
    .map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.querySelectorAll(".open-task-modal").forEach((button) => {
  button.addEventListener("click", () => {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  });
});

document.querySelectorAll(".toast-button").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.toast || "已保存");
    if (button.closest(".health-panel")) {
      button.closest(".health-panel").classList.add("submitted");
    }
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
    item.parentElement.appendChild(item);
  });
});

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

function updateCurrentPet(petName) {
  const pet = petProfiles[petName];
  if (!pet) return;

  document.querySelector("#current-pet-avatar").src = pet.avatar;
  document.querySelector("#current-pet-avatar").alt = `${pet.name}照片`;
  document.querySelector("#current-pet-name").textContent = pet.name;
  document.querySelector("#current-pet-desc").textContent = pet.desc;
  document.querySelector("#current-pet-days").textContent = `${pet.days}天`;
  document.querySelector("#current-pet-score").textContent = `${pet.score}%`;
  document.querySelector("#current-pet-health-label").textContent = pet.taskProgress;
  document.querySelector("#health-record-title").textContent = `记录${pet.name}今天的身体状态`;

  document.querySelector("#home-feeding").value = pet.record.feeding;
  document.querySelector("#home-walk").value = pet.record.walk;
  document.querySelector("#home-weight").value = pet.record.weight;
  setSegmentedValue("#home-water", pet.record.water);
  setSegmentedValue("#home-stool", pet.record.stool);
  setSegmentedValue("#home-mood", pet.record.mood);

  const healthPanel = document.querySelector(".health-panel");
  if (healthPanel) {
    healthPanel.classList.remove("submitted");
  }
}

document.querySelectorAll(".pet-switcher button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("add-pet-button")) return;
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateCurrentPet(button.dataset.pet || button.textContent.trim());
  });
});

document.querySelector(".add-pet-button").addEventListener("click", () => {
  petModal.classList.add("active");
  petModal.setAttribute("aria-hidden", "false");
});

document.querySelectorAll(".close-pet-modal").forEach((button) => {
  button.addEventListener("click", () => {
    petModal.classList.remove("active");
    petModal.setAttribute("aria-hidden", "true");
  });
});

petModal.addEventListener("click", (event) => {
  if (event.target === petModal) {
    petModal.classList.remove("active");
    petModal.setAttribute("aria-hidden", "true");
  }
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

renderInlineBreedList("dog");
renderWeekCalendar();
