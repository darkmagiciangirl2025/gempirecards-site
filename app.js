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
  type: "all",          // all | auction | fixed
  sort: "newlyListed",  // newlyListed, bestMatch, price, priceDesc, endingSoonest
  min: 3000,
  max: null,
  page: 1,
  limit: 50,
  total: 0,
};

function setActiveTab(type) {
  state.type = type;
  tabAll.classList.toggle("active", type === "all");
  tabAuction.classList.toggle("active", type === "auction");
  tabFixed.classList.toggle("active", type === "fixed");
}

function moneyFormat(n) {
  if (n == null || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US").format(n);
}

function parseMoneyInput(str) {
  if (!str) return null;
  const digits = String(str).replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

// Upgrade eBay image size if the URL includes s-l###
// Example: .../s-l225.jpg -> .../s-l500.jpg
function upgradeImage(url) {
  if (!url) return "";
  return url.replace(/s-l\d+/i, "s-l500");
}

function formatPrice(value, currency = "USD") {
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${moneyFormat(value)}`;
  }
}

function updateInputsFromState() {
  elQ.value = state.q || "";
  sortEl.value = state.sort || "newlyListed";

  minEl.value = state.min != null ? moneyFormat(state.min) : "";
  maxEl.value = state.max != null ? moneyFormat(state.max) : "";
}

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function renderItems(items) {
  gridEl.innerHTML = "";

  if (!items || !items.length) {
    gridEl.innerHTML = "";
    setStatus("No results");
    return;
  }

  setStatus(
    `Showing ${(state.page - 1) * state.limit + 1}-${Math.min(
      state.page * state.limit,
      state.total || state.page * state.limit
    )} of ${state.total.toLocaleString()} results`
  );

  for (const it of items) {
    const card = document.createElement("div");
    card.className = "card";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = upgradeImage(it.image);
    img.alt = it.title || "Listing";
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = it.title || "";

    const price = document.createElement("div");
    price.className = "price";
    price.textContent =
      Number.isFinite(it.priceValue) ? formatPrice(it.priceValue, it.currency) : "";

    const link = document.createElement("a");
    link.className = "viewLink";
    link.href = it.link || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View";

    meta.appendChild(title);
    meta.appendChild(price);
    meta.appendChild(link);

    card.appendChild(thumb);
    card.appendChild(meta);

    gridEl.appendChild(card);
  }
}

function updatePager() {
  const totalPages = Math.max(1, Math.ceil((state.total || 0) / state.limit));
  pager.style.display = totalPages > 1 ? "flex" : "none";

  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= totalPages;

  // Show pages in blocks of 3: (1 2 3) (4 5 6) ...
  const blockStart = Math.floor((state.page - 1) / 3) * 3 + 1;
  const pages = [blockStart, blockStart + 1, blockStart + 2].map((p) =>
    p <= totalPages ? p : null
  );

  const btns = [p1, p2, p3];
  btns.forEach((btn, idx) => {
    const p = pages[idx];
    if (!p) {
      btn.style.display = "none";
      return;
    }
    btn.style.display = "inline-flex";
    btn.textContent = String(p);
    btn.classList.toggle("active", p === state.page);
    btn.onclick = () => {
      state.page = p;
      runSearch();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });
}

async function runSearch() {
  const params = new URLSearchParams();
  params.set("q", state.q);
  params.set("type", state.type);
  params.set("sort", state.sort);
  params.set("page", String(state.page));
  params.set("limit", String(state.limit));
  if (state.min != null) params.set("min", String(state.min));
  if (state.max != null) params.set("max", String(state.max));

  setStatus("Loading…");
  gridEl.innerHTML = "";

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    if (!res.ok || data?.error) {
      setStatus("Error loading results");
      return;
    }

    state.total = Number(data.total) || 0;

    renderItems(data.items || []);
    updatePager();
  } catch (e) {
    setStatus("Error loading results");
  }
}

// --- Events

btnSearch.addEventListener("click", () => {
  state.q = elQ.value.trim() || "pokemon psa";
  state.page = 1;
  runSearch();
});

elQ.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    state.q = elQ.value.trim() || "pokemon psa";
    state.page = 1;
    runSearch();
  }
});

[tabAll, tabAuction, tabFixed].forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.type);
    state.page = 1;
    runSearch();
  });
});

sortEl.addEventListener("change", () => {
  state.sort = sortEl.value;
  state.page = 1;
  runSearch();
});

// money inputs: keep numeric state, show commas
function bindMoneyInput(inputEl, key) {
  inputEl.addEventListener("input", () => {
    const n = parseMoneyInput(inputEl.value);
    state[key] = n;
    // live format (simple)
    if (n != null) inputEl.value = moneyFormat(n);
  });

  inputEl.addEventListener("blur", () => {
    const n = parseMoneyInput(inputEl.value);
    state[key] = n;
    inputEl.value = n != null ? moneyFormat(n) : "";
  });
}

bindMoneyInput(minEl, "min");
bindMoneyInput(maxEl, "max");

function applyFilters() {
  state.page = 1;
  runSearch();
}

applyBtn.addEventListener("click", applyFilters);
applyBtnBig.addEventListener("click", applyFilters);

prevPageBtn.addEventListener("click", () => {
  state.page = Math.max(1, state.page - 1);
  runSearch();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil((state.total || 0) / state.limit));
  state.page = Math.min(totalPages, state.page + 1);
  runSearch();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// --- Init: auto search on load (pokemon psa, min 3000, Newly Listed)
setActiveTab(state.type);
updateInputsFromState();
runSearch();
