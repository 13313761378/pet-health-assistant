const schemeTabs = document.querySelectorAll("[data-scheme]");
const panels = document.querySelectorAll("[data-panel]");
const toast = document.querySelector("#preview-toast");
let toastTimer;

function showToast(message = "这是交互示意") {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1300);
}

schemeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    schemeTabs.forEach((item) => item.classList.toggle("active", item === tab));
    panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === tab.dataset.scheme));
    window.scrollTo({ top: Math.max(0, document.querySelector(".scheme-switcher").offsetTop - 10), behavior: "smooth" });
  });
});

document.querySelectorAll(".issue-chip").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".issue-chip").forEach((item) => item.classList.toggle("selected", item === button));
    document.querySelector("#issue-title").textContent = button.dataset.issue;
    document.querySelector("#issue-copy").textContent = button.dataset.copy;
  });
});

const stageContent = {
  "幼年期": ["幼年期 · 建立健康基础", "完成免疫、驱虫和社会化训练，同时建立规律饮食与体重记录。"],
  "成年期": ["成年期 · 稳定健康习惯", "维持理想体重、规律运动和年度体检，是成年阶段的三个核心目标。"],
  "老年期": ["老年期 · 提前发现变化", "增加体检频率，重点关注关节、口腔、心肾功能和日常行为变化。"],
  "特殊时期": ["特殊时期 · 精细照顾与恢复", "根据换粮、绝育、术后或环境变化，提供短周期的专项照顾方案。"]
};

document.querySelectorAll(".stage-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".stage-tab").forEach((item) => item.classList.toggle("active", item === button));
    const [title, copy] = stageContent[button.dataset.stage];
    document.querySelector("#stage-title").textContent = title;
    document.querySelector("#stage-copy").textContent = copy;
  });
});

document.querySelectorAll(".demo-action").forEach((button) => button.addEventListener("click", () => showToast()));
