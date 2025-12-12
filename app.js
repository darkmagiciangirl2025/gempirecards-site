async function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const sort = document.getElementById("sortSelect").value;
  const resultsEl = document.getElementById("results");

  if (!query) {
    resultsEl.innerHTML = "";
    return;
  }

  resultsEl.innerHTML = "<p>Loading results...</p>";

  try {
    // Build API URL
    let apiUrl = `https://shop.gempirecards.com/search?q=${encodeURIComponent(query)}`;

    if (sort) {
      apiUrl += `&sort=${sort}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = "<p>No results found.</p>";
      return;
    }

    resultsEl.innerHTML = data.items
      .map(item => `
        <div class="card">
          <img src="${item.image}" alt="${item.title}" />
          <h3>${item.title}</h3>
          <p class="price">$${item.price}</p>
          <p class="seller">Seller: ${item.seller}</p>
          <a href="${item.link}" target="_blank" rel="noopener">
            View on eBay
          </a>
        </div>
      `)
      .join("");

  } catch (err) {
    console.error("Search failed:", err);
    resultsEl.innerHTML = "<p>Error loading results.</p>";
  }
}

// Optional: run search on Enter key
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    runSearch();
  }
});
