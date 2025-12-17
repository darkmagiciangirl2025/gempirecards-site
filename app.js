const elQ = document.getElementById("q");
const btnSearch = document.getElementById("searchBtn");
const statusEl = document.getElementById("status");
const gridEl = document.getElementById("grid");

const tabAll = document.getElementById("tabAll");
const tabAuction = document.getElementById("tabAuction");
const tabFixed = document.getElementById("tabFixed");

const sortEl = document.getElementById("sort");

const minEl = document.getElementById("minPrice");
const maxEl = document.getElementById("maxPrice");
const applyBtn = document.getElementById("applyBtn");
const applyBtnBig = document.getElementById("applyBtnBig");

const pager = document.getElementById("pager");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
const p3 = document.getElementById("p3");

const state = {
  q: "pokemon psa",
  type: "all",
  sort: "newlyListed",
  min: 3000,
  max: null,
  page: 1,
  limit: 50,
  total: 0,
};

/* ---------- helpers ---------- */

function moneyFormat(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

function parseMoneyInput(val) {
  if (!val) return null;
  const num = Number(String(val).replace(/[^\d]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function formatPrice(v, c = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  }).format(v);
}

function upgradeImage(url) {
  return url ? url.replace(/s-l\d+/i, "s-l500") : "";
}

/* ---------- UI ---------- */

function setActiveTab(type) {
  state.type = type;
  tabAll.classList.toggle("active", type === "all");
  tabAuction.classList.toggle("active", type === "auction");
  tabFixed.classList.toggle("active", type === "fixed");
}

function updateInputs() {
  elQ.value = state.q;
  sortEl.value = state.sort;
  minEl.value = state.min ? moneyFormat(state.min) : "";
  maxEl.value = state.max ? moneyFormat(state.max) : "";
}

/* ---------- render ---------- */

function renderItems(items) {
  gridEl.innerHTML = "";

  if (!items.length) {
    statusEl.textContent = "No results";
    return;
  }

  statusEl.textContent = `Showing ${(state.page - 1) * state.limit + 1}-${Math.min(
    state.page * state.limit,
    state.total
  )} of ${state.total.toLocaleString()} results`;

  for (const it of items) {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="thumb">
        <img loading="lazy" src="${upgradeImage(it.image)}">
      </div>
      <div class="meta">
        <div class="title">${it.title}</div>
        <div class="price">${formatPrice(it.priceValue, it.currency)}</div>
        <a class="viewLink" href="${it.link}" target="_blank">View</a>
      </div>
    `;

    gridEl.appendChild(card);
  }
}

/* ---------- pagination ---------- */

function updatePager() {
  const totalPages = Math.ceil(state.total / state.limit);

  pager.style.display = totalPages > 1 ? "flex" : "none";
  prevPageBtn.disabled = state.page === 1;
  nextPageBtn.disabled = state.page >= totalPages;

  const start = Math.floor((state.page - 1) / 3) * 3 + 1;
  const buttons = [p1, p2, p3];

  buttons.forEach((btn, i) => {
    const page = start + i;
    if (page > totalPages) {
      btn.style.display = "none";
      return;
    }
    btn.style.display = "inline-flex";
    btn.textContent = page;
    btn.classList.toggle("active", page === state.page);
    btn.onclick = () => {
      state.page = page;
      runSearch();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}

/* ---------- search ---------- */

async function runSearch() {
  const params = new URLSearchParams({
    q: state.q,
    type: state.type,
    sort: state.sort,
    page: state.page,
    limit: state.limit,
  });

  if (state.min != null) params.set("min", state.min);
  if (state.max != null) params.set("max", state.max);

  statusEl.textContent = "Loading…";
  gridEl.innerHTML = "";

  const res = await fetch(`/api/search?${params}`);
  const data = await res.json();

  state.total = data.total || 0;
  renderItems(data.items || []);
  updatePager();
}

/* ---------- events ---------- */

btnSearch.onclick = () => {
  state.q = elQ.value.trim() || "pokemon psa";
  state.page = 1;
  runSearch();
};

elQ.onkeydown = (e) => e.key === "Enter" && btnSearch.click();

sortEl.onchange = () => {
  state.sort = sortEl.value;
  state.page = 1;
  runSearch();
};

[tabAll, tabAuction, tabFixed].forEach((b) =>
  b.onclick = () => {
    setActiveTab(b.dataset.type);
    state.page = 1;
    runSearch();
  }
);

/* 🔥 THIS IS THE FIX 🔥 */
function applyFilters() {
  state.min = parseMoneyInput(minEl.value);
  state.max = parseMoneyInput(maxEl.value);
  state.page = 1;
  runSearch();
}

applyBtn.onclick = applyFilters;
applyBtnBig.onclick = applyFilters;

prevPageBtn.onclick = () => {
  state.page--;
  runSearch();
};

nextPageBtn.onclick = () => {
  state.page++;
  runSearch();
};

/* ---------- init ---------- */

setActiveTab("all");
updateInputs();
runSearch();
