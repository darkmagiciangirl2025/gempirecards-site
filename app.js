// ==========================
// Helpers
// ==========================

// For MIN/MAX inputs: digits only (no commas, no $)
function stripDigits(val = "") {
  return val.replace(/[^\d]/g, "");
}

function formatNumber(val) {
  const num = Number(stripDigits(val));
  if (!num) return "";
  return num.toLocaleString("en-US");
}

// For LISTING prices: allow decimals + commas
function parsePrice(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;

  const s = String(val).trim();

  // Keep digits, comma, dot. Remove $ and other text.
  const cleaned = s.replace(/[^0-9.,]/g, "");
  if (!cleaned) return null;

  // Remove thousands separators
  const normalized = cleaned.replace(/,/g, "");

  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : null;
}

function formatUSD(val) {
  const num = parsePrice(val);
  if (num === null) return "—";

  const hasCents = Math.round(num * 100) % 100 !== 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(num);
}

// ==========================
// DOM
// ==========================
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const results = document.getElementById("results");

const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const applyPrice = document.getElementById("applyPrice");

const tabAll = document.getElementById("tabAll");
const tabAuction = document.getElementById("tabAuction");
const tabFixed = document.getElementById("tabFixed");

let listingType = "all";

// ==========================
// Price Input Formatting (Min/Max)
// ==========================
function attachPriceFormatter(input) {
  input.addEventListener("input", (e) => {
    e.target.value = stripDigits(e.target.value);
  });

  input.addEventListener("blur", (e) => {
    const raw = stripDigits(e.target.value);
    e.target.value = raw ? formatNumber(raw) : "";
  });

  input.addEventListener("focus", (e) => {
    e.target.value = stripDigits(e.target.value);
  });
}

attachPriceFormatter(minPrice);
attachPriceFormatter(maxPrice);

// ==========================
// Tabs
// ==========================
function setTab(type) {
  listingType = type;

  tabAll.classList.remove("active");
  tabAuction.classList.remove("active");
  tabFixed.classList.remove("active");

  if (type === "all") tabAll.classList.add("active");
  if (type === "auction") tabAuction.classList.add("active");
  if (type === "fixed") tabFixed.classList.add("active");

  runSearch();
}

tabAll.onclick = () => setTab("all");
tabAuction.onclick = () => setTab("auction");
tabFixed.onclick = () => setTab("fixed");

// ==========================
// Search
// ==========================
async function runSearch() {
  const q = searchInput.value.trim();
  if (!q) return;

  const min = Number(stripDigits(minPrice.value));
  const max = Number(stripDigits(maxPrice.value));

  if (min && max && min > max) {
    alert("Min price cannot be greater than Max price");
    return;
  }

  results.innerHTML = "Loading…";

  const params = new URLSearchParams({
    q,
    type: listingType,
  });

  if (min) params.append("min", min);
  if (max) params.append("max", max);

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  if (!data.items || !data.items.length) {
    results.innerHTML = "No results found";
    return;
  }

  render(data.items);
}

searchBtn.onclick = runSearch;
applyPrice.onclick = runSearch;

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

// ==========================
// Render
// ==========================
function render(items) {
  results.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.image}" />
      <h3>${item.title}</h3>
      <div class="price">${formatUSD(item.price)}</div>
      <a href="${item.link}" target="_blank">View</a>
    `;

    results.appendChild(card);
  });
}

// ==========================
// AUTO SEARCH ON LOAD ✅
// ==========================
window.addEventListener("load", () => {
  searchInput.value = "pokemon psa";

  // Min price = 3000, formatted as 3,000
  minPrice.value = formatNumber("3000");
  maxPrice.value = "";

  listingType = "all";
  tabAll.classList.add("active");

  runSearch();
});
