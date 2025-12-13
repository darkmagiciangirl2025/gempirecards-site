// app.js
// Gempire Discovery frontend logic
// Talks to /api/search and /api/go/:itemId

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsEl = document.getElementById("results");
  const statusEl = document.getElementById("status");

  async function runSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    statusEl.textContent = "Searching eBay…";
    resultsEl.innerHTML = "";

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

      if (!res.ok) {
        throw new Error(`API error (${res.status})`);
      }

      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        statusEl.textContent = "No results found.";
        return;
      }

      statusEl.textContent = `Showing ${data.items.length} results`;

      data.items.forEach(item => {
        const card = document.createElement("div");
        card.className = "result-card";

        card.innerHTML = `
          <img src="${item.image}" alt="${item.title}" />
          <div class="result-info">
            <h3>${item.title}</h3>
            <p class="price">$${item.price}</p>
            <p class="meta">
              ${item.condition || "Unknown condition"} · ${item.seller}
            </p>
            <a
              href="${item.link}"
              target="_blank"
              rel="noopener noreferrer"
              class="buy-btn"
            >
              View on eBay →
            </a>
          </div>
        `;

        resultsEl.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      statusEl.textContent = "Something went wrong. Check console.";
    }
  }

  // Click search
  searchBtn.addEventListener("click", runSearch);

  // Enter key search
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  });
});
