const breeds = {
  dog: [
    { name: "金毛寻回犬", desc: "温顺友好，适合家庭陪伴", meta: "中大型 · 运动量较高", image: "https://images.unsplash.com/photo-1554456854-55a089fd4cb2?auto=format&fit=crop&w=720&q=85" },
    { name: "拉布拉多", desc: "亲人稳定，学习能力强", meta: "中大型 · 新手友好", image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=720&q=85" },
    { name: "柯基犬", desc: "活泼机警，需要关注体重", meta: "小型 · 公寓适合", image: "https://images.unsplash.com/photo-1557973557-ddfa9ee8c8c6?auto=format&fit=crop&w=720&q=85" },
    { name: "边境牧羊犬", desc: "聪明敏捷，精力非常旺盛", meta: "中型 · 运动量很高", image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=720&q=85" }
  ],
  cat: [
    { name: "英国短毛猫", desc: "性格稳定，圆润安静", meta: "短毛 · 新手友好", image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=720&q=85" },
    { name: "布偶猫", desc: "温柔亲人，需要毛发护理", meta: "长毛 · 公寓适合", image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=720&q=85" },
    { name: "美国短毛猫", desc: "活泼聪明，适应能力强", meta: "短毛 · 运动量中等", image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=720&q=85" },
    { name: "暹罗猫", desc: "喜欢交流，活泼又黏人", meta: "短毛 · 互动需求高", image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=720&q=85" }
  ]
};

let activeSpecies = "dog";
const breedGrid = document.querySelector("#breed-grid");

function renderBreeds(query = "") {
  const list = breeds[activeSpecies].filter((breed) => `${breed.name}${breed.desc}${breed.meta}`.includes(query.trim()));
  breedGrid.innerHTML = list.length ? list.map((breed) => `
    <button class="breed-card" type="button">
      <img class="breed-photo" src="${breed.image}" alt="${breed.name}" />
      <span class="breed-arrow">→</span>
      <div><small>${breed.meta}</small><h3>${breed.name}</h3><p>${breed.desc}</p></div>
    </button>`).join("") : `<div class="empty-state"><strong>没有找到相关品种</strong><span>换一个关键词试试</span></div>`;
}

document.querySelectorAll("[data-species]").forEach((tab) => tab.addEventListener("click", () => {
  activeSpecies = tab.dataset.species;
  document.querySelectorAll("[data-species]").forEach((item) => item.classList.toggle("active", item === tab));
  renderBreeds(document.querySelector("#breed-search").value);
}));

document.querySelector("#breed-search").addEventListener("input", (event) => renderBreeds(event.target.value));
document.querySelectorAll(".filter-chip").forEach((chip) => chip.addEventListener("click", () => {
  document.querySelectorAll(".filter-chip").forEach((item) => item.classList.toggle("active", item === chip));
}));

const modalTemplates = {
  food: `<span class="modal-kicker">食物安全查询</span><h2 id="modal-title">这个能不能吃？</h2><p class="modal-lead">输入食物名称，查看犬猫安全性和注意事项。</p><div class="modal-search"><span>⌕</span><input type="text" value="葡萄" aria-label="食物名称"/><button type="button">查询</button></div><div class="food-result danger-result"><div><span>高风险</span><strong>葡萄｜禁止食用</strong></div><p>对犬猫可能产生严重毒性，少量也存在风险。如果已经误食，请记录时间和大致数量，并尽快联系宠物医院。</p><small>不要擅自催吐或等待症状出现。</small></div><div class="quick-foods"><span>常见查询</span><button type="button">巧克力</button><button type="button">牛奶</button><button type="button">鸡蛋</button><button type="button">西瓜</button></div>`,
  feeding: `<span class="modal-kicker">每日喂食量</span><h2 id="modal-title">豆包今天吃多少？</h2><p class="modal-lead">已读取宠物档案，可继续调整活动量和管理目标。</p><div class="pet-summary"><span>🐕</span><div><strong>豆包 · 柯基</strong><small>3 岁 · 已绝育 · 12.8 kg</small></div></div><div class="choice-row"><span>活动量</span><div><button type="button">较低</button><button class="selected" type="button">正常</button><button type="button">较高</button></div></div><div class="choice-row"><span>管理目标</span><div><button type="button">减重</button><button class="selected" type="button">维持</button><button type="button">增重</button></div></div><div class="calorie-result"><span>每日建议摄入</span><strong>610–680 <small>kcal</small></strong><p>按当前宠粮计算，约 165–185 克，建议分早晚两餐。</p></div><button class="modal-primary" type="button">加入喂养计划</button>`,
  body: `<span class="modal-kicker">体况评分 BCS</span><h2 id="modal-title">从外形判断理想体态</h2><p class="modal-lead">选择最接近豆包当前状态的描述。</p><div class="bcs-scale"><button type="button"><b>1–3</b><span>偏瘦</span></button><button class="selected" type="button"><b>4–5</b><span>理想</span></button><button type="button"><b>6–7</b><span>超重</span></button><button type="button"><b>8–9</b><span>肥胖</span></button></div><div class="bcs-checklist"><p><i>✓</i><span><strong>肋骨</strong>轻触可以摸到，表面有少量脂肪覆盖</span></p><p><i>✓</i><span><strong>腰线</strong>从上方观察可以看到明显腰部曲线</span></p><p><i>✓</i><span><strong>腹部</strong>从侧面观察腹部自然向上收紧</span></p></div><div class="ideal-result"><span>当前评估</span><strong>理想体态</strong><p>建议继续保持当前饮食与运动习惯，每月记录一次。</p></div><button class="modal-primary" type="button">保存到健康档案</button>`,
  vaccine: `<span class="modal-kicker">疫苗驱虫助手</span><h2 id="modal-title">豆包的健康计划</h2><p class="modal-lead">根据历史记录整理下一步安排。</p><div class="timeline"><div class="done"><i>✓</i><p><strong>体外驱虫</strong><small>7 月 3 日 · 已完成</small></p><span>完成</span></div><div class="next"><i>6</i><p><strong>体内驱虫</strong><small>7 月 21 日 · 还有 6 天</small></p><span>即将到期</span></div><div><i>28</i><p><strong>年度疫苗</strong><small>8 月 12 日 · 还有 28 天</small></p><span>待安排</span></div></div><button class="modal-primary" type="button">添加驱虫提醒</button>`,
  more: `<span class="modal-kicker">全部工具</span><h2 id="modal-title">更多实用工具</h2><p class="modal-lead">根据使用频率逐步补充，不让百科首页变得拥挤。</p><div class="more-tools"><button type="button"><span>💧</span><strong>饮水量估算</strong></button><button type="button"><span>🎂</span><strong>年龄换算</strong></button><button type="button"><span>🆘</span><strong>紧急指南</strong></button><button type="button"><span>💊</span><strong>用药记录</strong></button></div>`
};

const toolModal = document.querySelector("#tool-modal");
document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => {
  document.querySelector("#modal-content").innerHTML = modalTemplates[button.dataset.tool];
  toolModal.classList.add("open");
  toolModal.setAttribute("aria-hidden", "false");
}));

function closeLayer(layer) { layer.classList.remove("open"); layer.setAttribute("aria-hidden", "true"); }
document.querySelector("[data-close-modal]").addEventListener("click", () => closeLayer(toolModal));
toolModal.addEventListener("click", (event) => { if (event.target === toolModal) closeLayer(toolModal); });

const scanModal = document.querySelector("#scan-modal");
document.querySelector("[data-open-scan]").addEventListener("click", () => { scanModal.classList.add("open"); scanModal.setAttribute("aria-hidden", "false"); });
document.querySelector("[data-close-scan]").addEventListener("click", () => closeLayer(scanModal));
scanModal.addEventListener("click", (event) => { if (event.target === scanModal) closeLayer(scanModal); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeLayer(toolModal); closeLayer(scanModal); } });

renderBreeds();
