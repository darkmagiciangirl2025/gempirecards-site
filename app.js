console.log("app.js loaded");

const resultsEl = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

async function runSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    alert("Enter a search term");
    return;
  }

  console.log("Searching for:", query);
  resultsEl.innerHTML = "Loading…";

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    console.log("API response:", data);

    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = "No results found.";
      return;
    }

    resultsEl.innerHTML = "";

    data.items.forEach(item => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${item.image}" />
        <div>${item.title}</div>
        <div>$${item.price}</div>
        <a href="${item.url}" target="_blank">View on eBay</a>
      `;

      resultsEl.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "Error loading results.";
  }
}

searchBtn.addEventListener("click", runSearch);

// allow Enter key
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") runSearch();
});
