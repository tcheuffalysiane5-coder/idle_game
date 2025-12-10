const DEFAULT = {
  chakra: 0,
  perClick: 1,
  currentLevelId: null,
  unlocked: [],
  totalPurchases: 0,
};

const STORAGE_KEY = "ninjaSave";
class Level {
  constructor(id, name, price, clickps) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.cps = clickps;
  }
}

const LEVELS = [
  new Level("genin", "Genin", 50, 1),
  new Level("chunin", "Chunin", 100, 2),
  new Level("jonin", "Jonin", 500, 3),
  new Level("anbu", "Anbu", 5000, 4),
  new Level("sannin", "Sannin", 15000, 5),
  new Level("kage", "Kage", 50000, 6),
];

const characterImagesById = {
  base: "Sanstitre.jpeg",
  genin: "naruto genin.jpeg",
  chunin: "naruto chunin.jpeg",
  jonin: "naruto jonin.jpeg",
  anbu: "naruto anbu.jpeg",
  sannin: "naruto sanin.jpeg",
  kage: "naruto kage.jpeg",
};

function loadState() {
  const texte = localStorage.getItem(STORAGE_KEY);
  if (texte !== null) {
    try {
      return JSON.parse(texte);
    } catch (e) {
      console.warn("Saved state corrupt, resetting to default.");
      return { ...DEFAULT };
    }
  }
  return { ...DEFAULT };
}

let state = loadState();

const DOM = {
  chakraVal: document.getElementById("chakraVal"),
  perClick: document.getElementById("perClick"),
  cpsDisplay: document.getElementById("cpsDisplay"),
  clickBtn: document.getElementById("clickBtn"),
  shopList: document.getElementById("shopList"),
  currentLevelName: document.getElementById("currentLevelName"),
  nextLevelInfo: document.getElementById("nextLevelInfo"),
  stockAchat: document.getElementById("stockAchat"),
  characterImg: document.getElementById("characterImg"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

function format(n) {
  return Math.floor(n).toLocaleString();
}

function getCPSFromCurrent() {
  if (!state.currentLevelId) return 0;
  const lvl = LEVELS.find((l) => l.id === state.currentLevelId);
  return lvl ? lvl.cps : 0;
}

function findNextLevel() {
  for (const lvl of LEVELS) {
    if (!state.unlocked.includes(lvl.id)) return lvl;
  }
  return null;
}

function updateCharacterImage() {
  const img = DOM.characterImg;
  if (!img) return;

  if (!state.currentLevelId) {
    img.src = characterImagesById.base;
    return;
  }
  const level = LEVELS.find((l) => l.id === state.currentLevelId);
  (level && characterImagesById[level.id]) || characterImagesById.base;
}

function renderShop() {
  if (!DOM.shopList) return;
  DOM.shopList.innerHTML = "";

  LEVELS.forEach(function (level) {
    const li = document.createElement("li");
    li.className = "shop-item";
    li.innerHTML =
      "<strong>" + level.name + "</strong> — " + format(level.price) + " Rio";

    const btn = document.createElement("button");
    btn.className = "buy-btn";

    if (state.unlocked.includes(level.id)) {
      btn.textContent = "Débloqué";
      btn.disabled = true;
    } else {
      btn.textContent = "Acheter";
      btn.disabled = state.chakra < level.price;
    }
    li.appendChild(btn);
    DOM.shopList.appendChild(li);

    btn.addEventListener("click", function () {
      buyLevel(level.id);
    });
  });
}

function buyLevel(id) {
  const lvl = LEVELS.find((l) => l.id === id);
  if (!lvl) return;

  if (state.unlocked.includes(id)) return;
  if (state.chakra < lvl.price) return;

  state.chakra -= lvl.price;
  state.unlocked.push(id);
  state.currentLevelId = id;
  state.totalPurchases += 1;

  renderUI();
}

function renderNextLevel() {
  const next = findNextLevel();

  if (!next) {
    if (DOM.nextLevelInfo)
      DOM.nextLevelInfo.textContent = "Tous les niveaux sont débloqués.";
  } else {
    let missing = next.price - Math.floor(state.chakra);
    if (missing < 0) missing = 0;

    if (DOM.nextLevelInfo) {
      DOM.nextLevelInfo.innerHTML =
        next.name +
        " — " +
        format(next.price) +
        " Rio" +
        "<br>Manque : <strong>" +
        format(missing) +
        "</strong> Rio";
    }
  }
}

function renderUI() {
  if (DOM.chakraVal) DOM.chakraVal.textContent = format(state.chakra);
  if (DOM.perClick) DOM.perClick.textContent = "+" + state.perClick;
  if (DOM.cpsDisplay) DOM.cpsDisplay.textContent = getCPSFromCurrent();
  if (DOM.stockAchat) DOM.stockAchat.textContent = state.totalPurchases;

  if (DOM.currentLevelName) {
    if (state.currentLevelId) {
      const lvl = LEVELS.find((l) => l.id === state.currentLevelId);
      DOM.currentLevelName.textContent = lvl ? lvl.name : "Aucun";
    } else {
      DOM.currentLevelName.textContent = "Aucun";
    }
  }

  renderShop();
  renderNextLevel();
  updateCharacterImage();
  updateProgressBar();
}

function updateProgressBar() {
  const next = findNextLevel();
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  if (!next) {
    bar.style.width = "100%";
    bar.style.background = "linear-gradient(90deg, #27ae60, #f1c40f)";
    return;
  }
  let percent = Math.min(100, (state.chakra / next.price) * 100);
  bar.style.width = percent + "%";
  bar.style.background =
    percent >= 100
      ? "linear-gradient(90deg, #27ae60, #f1c40f)"
      : "linear-gradient(90deg, #e67e22, #e74c3c)";
}

if (DOM.clickBtn) {
  DOM.clickBtn.addEventListener("click", function () {
    state.chakra += state.perClick;
    renderUI();
  });
}

setInterval(function () {
  state.chakra += getCPSFromCurrent();
  renderUI();
}, 1000);

if (DOM.resetBtn) {
  DOM.resetBtn.addEventListener("click", function () {
    const confirmation = confirm("Es-tu sûr de vouloir tout remettre à zéro ?");
    if (confirmation) {
      state = { ...DEFAULT };
      renderUI();
    }
  });
}

renderUI();
