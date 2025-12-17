// ==========================
// Helpers
// ==========================
const formatUSD = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value.toString().replace(/[^0-9]/g, ""));
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(num);
};

const stripNumber = (val) => val.replace(/[^0-9]/g, "");

// ==========================
// DOM Elements
// ==========================
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsEl = document.getElementById("results");

const minInput = document.getElementById("minPrice");
const maxInput = document.getElementById("maxPrice");

const tabAll = document.getElementById("tabAll");
const tabAuction = document.getElementById("tabAuction");
const tabFixed = document.getElementById("tabFixed");

// ==========================
// State
// ==========================
let listingType = "all"; // all | auction | fixed

// ==========================
// Input Formatting
// ==========================
function attachCurrencyFormatter(input) {
  input.addEventListener("input", (e) => {
    const raw = stripNumber(e.target.value);
    if (!raw) {
      e.target.value = "";
      return;
    }
    e.target.value = formatUSD(raw);
  });
}

attachCurrencyFormatter(minInput);
attachCurrencyFormatter(maxInput);

// ==========================
// Tabs
// ==========================
function setActiveTab(type) {
  listingType = type;
  tabAll.classList.remove("active");
  tabAuction.classList.remove("active");
  tabFixed.classList.remove("active");

  if (type === "all") tabAll.classList.add("active");
  if (type === "auction") tabAuction.classList.add("active");
  if (type === "fixed") tabFixed.classList.add("active");

  runSearch();
}

tabAll?.addEventListener("click", () => setActiveTab("all"));
tabAuction?.addEventListener("click", () => setActiveTab("auction"));
tabFixed?.addEventListener("click", () => setActiveTab("fixed"));

// ==========================
// Search
// ==========================
async function runSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  const min = stripNumber(minInput.value);
  const max = stripNumber(maxInput.value);

  resultsEl.innerHTML = "<p>Loading...</p>";

  const params = new URLSearchParams({
    q: query,
    type: listingType
  });

  if (min) params.append("min", min);
  if (max) params.append("max", max);

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = "<p>No results found</p>";
      return;
    }

    renderResults(data.items);
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<p>Error loading results</p>";
  }
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

// ==========================
// Render
// ==========================
function renderResults(items) {
  resultsEl.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-image">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="card-body">
        <h3>${item.title}</h3>
        <p class="price">${formatUSD(item.price)}</p>
        <a href="${item.link}" target="_blank">View</a>
      </div>
    `;

    resultsEl.appendChild(card);
  });
}
