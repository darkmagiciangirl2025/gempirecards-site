const resultsEl = document.getElementById("grid");
const loadingEl = document.getElementById("loader");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

async function search() {
  const q = searchInput.value || "pokemon";

  loadingEl.style.display = "block";
  resultsEl.innerHTML = "";

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    console.log("API DATA:", data); // keep for verification

    const items = data.results || data.items || [];

    if (!items.length) {
      resultsEl.innerHTML = "<p>No results found</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const image =
        item.img ||
        item.image ||
        "https://via.placeholder.com/300x300?text=No+Image";

      const price =
        typeof item.price === "string"
          ? item.price
          : item.price?.value
          ? `$${item.price.value}`
          : "—";

      const link = item.link || item.url || "#";

      card.innerHTML = `
        <img src="${image}" />
        <h4>${item.title}</h4>
        <p class="price">${price}</p>
        <a href="${link}" target="_blank" rel="noopener">
          View on eBay
        </a>
      `;

      resultsEl.appendChild(card);
    });
  } catch (err) {
    console.error("Search failed:", err);
    resultsEl.innerHTML =
      "<p style='opacity:.7'>Error loading results</p>";
  } finally {
    loadingEl.style.display = "none";
  }
}

// EVENTS
searchBtn.addEventListener("click", search);
window.addEventListener("load", search);
