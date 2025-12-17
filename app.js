// ==========================
// Helpers
// ==========================
function stripNumber(val = "") {
  return val.replace(/[^\d]/g, "");
}

function formatNumber(val) {
  const num = Number(stripNumber(val));
  if (!num) return "";
  return num.toLocaleString("en-US");
}

function formatUSD(val) {
  const num = Number(stripNumber(val));
  if (!num) return "—";
  return `$${num.toLocaleString("en-US")}`;
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
// Price Input Formatting
// ==========================
function attachPriceFormatter(input) {
  input.addEventListener("input", (e) => {
    e.target.value = stripNumber(e.target.value);
  });

  input.addEventListener("blur", (e) => {
    const raw = stripNumber(e.target.value);
    e.target.value = raw ? formatNumber(raw) : "";
  });

  input.addEventListener("focus", (e) => {
    e.target.value = stripNumber(e.target.value);
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

  const min = Number(stripNumber(minPrice.value));
  const max = Number(stripNumber(maxPrice.value));

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

  items.forEach(item => {
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
  // Default experience
  searchInput.value = "pokemon psa";

  // Min price = 3000, formatted as 3,000
  minPrice.value = formatNumber("3000");
  maxPrice.value = "";

  listingType = "all";
  tabAll.classList.add("active");

  runSearch();
});
