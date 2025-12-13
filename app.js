console.log("app.js loaded");

const resultsEl = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

async function runSearch() {
  const query = searchInput.value.trim();
  if (!query) return alert("Enter a search term");

  resultsEl.innerHTML = "Loading…";
  console.log("Searching:", query);

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    console.log("API response:", data);

    const items = data.itemSummaries || [];

    if (items.length === 0) {
      resultsEl.innerHTML = "No results found.";
      return;
    }

    resultsEl.innerHTML = "";

    items.forEach(item => {
      const image =
        item.image?.imageUrl ||
        item.thumbnailImages?.[0]?.imageUrl ||
        "";

      const price = item.price?.value
        ? `$${item.price.value}`
        : "—";

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${image}" />
        <div>${item.title}</div>
        <div>${price}</div>
        <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
      `;

      resultsEl.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "Error loading results.";
  }
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});
