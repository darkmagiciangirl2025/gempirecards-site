let listingType = "all";

const resultsEl = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    listingType = tab.dataset.type;
    runSearch();
  });
});

searchBtn.addEventListener("click", runSearch);

async function runSearch() {
  resultsEl.innerHTML = "";

  const q = document.getElementById("query").value.trim();
  if (!q) return;

  const params = new URLSearchParams({
    q,
    grading: document.getElementById("grading").value,
    grade: document.getElementById("grade").value,
    minPrice: document.getElementById("minPrice").value,
    maxPrice: document.getElementById("maxPrice").value,
    usOnly: document.getElementById("usOnly").checked
  });

  if (listingType === "auction") {
    params.append("buyingOptions", "AUCTION");
  }
  if (listingType === "fixed") {
    params.append("buyingOptions", "FIXED_PRICE");
  }

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  if (!data.itemSummaries || !data.itemSummaries.length) {
    resultsEl.innerHTML = "<p>No results found.</p>";
    return;
  }

  data.itemSummaries.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.image?.imageUrl || ""}">
      <h3>${item.title}</h3>
      <div class="price">$${item.price?.value || ""}</div>
      <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
    `;

    resultsEl.appendChild(card);
  });
}
