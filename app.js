const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");

let allItems = [];

searchBtn.addEventListener("click", runSearch);

async function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  resultsDiv.innerHTML = "Loading...";

  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();

  allItems = data.itemSummaries || [];
  applyFilters();
}

function applyFilters() {
  let items = [...allItems];

  const grading = document.getElementById("gradingFilter").value;
  const gradeNum = document.getElementById("gradeNumberFilter").value;
  const minPrice = parseFloat(document.getElementById("minPrice").value);
  const maxPrice = parseFloat(document.getElementById("maxPrice").value);
  const listingType = document.getElementById("listingType").value;
  const usOnly = document.getElementById("usOnly").checked;
  const sortBy = document.getElementById("sortBy").value;

  if (grading) {
    items = items.filter(i =>
      grading === "UNGRADED"
        ? !/PSA|BGS|CGC/i.test(i.title)
        : i.title.includes(grading)
    );
  }

  if (gradeNum) {
    items = items.filter(i =>
      new RegExp(`\\b${gradeNum}\\b`).test(i.title)
    );
  }

  if (!isNaN(minPrice)) {
    items = items.filter(i => parseFloat(i.price.value) >= minPrice);
  }

  if (!isNaN(maxPrice)) {
    items = items.filter(i => parseFloat(i.price.value) <= maxPrice);
  }

  if (listingType) {
    items = items.filter(i =>
      i.buyingOptions && i.buyingOptions.includes(listingType)
    );
  }

  if (usOnly) {
    items = items.filter(i => i.itemLocation?.country === "US");
  }

  if (sortBy === "priceAsc") {
    items.sort((a, b) => a.price.value - b.price.value);
  }

  if (sortBy === "priceDesc") {
    items.sort((a, b) => b.price.value - a.price.value);
  }

  renderItems(items);
}

function renderItems(items) {
  if (!items.length) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  resultsDiv.innerHTML = items.map(item => `
    <div class="card">
      <img src="${item.image?.imageUrl || ""}" />
      <h3>${item.title}</h3>
      <p>$${item.price.value}</p>
      <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
    </div>
  `).join("");
}

// Auto re-filter when controls change
document.querySelectorAll(
  "#gradingFilter,#gradeNumberFilter,#minPrice,#maxPrice,#listingType,#usOnly,#sortBy"
).forEach(el => el.addEventListener("change", applyFilters));
