const resultsEl = document.getElementById("grid");
const loadingEl = document.getElementById("loader");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

async function search() {
  const q = searchInput.value.trim() || "pokemon";

  loadingEl.style.display = "block";
  resultsEl.innerHTML = "";

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const data = await res.json();
    console.log("RAW API RESPONSE:", data);

    // 🔑 normalize ALL possible response shapes
    let items = [];

    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data.results)) {
      items = data.results;
    } else if (Array.isArray(data.items)) {
      items = data.items;
    }

    console.log("NORMALIZED ITEMS COUNT:", items.length);

    if (!items.length) {
      resultsEl.innerHTML =
        "<p style='opacity:.7'>No listings returned from eBay</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const image =
        item.img ||
        item.image ||
        item.image?.imageUrl ||
        "https://via.placeholder.com/300x300?text=No+Image";

      const price =
        typeof item.price === "string"
          ? item.price
          : item.price?.value
          ? `$${item.price.value}`
          : item.currentPrice?.value
          ? `$${item.currentPrice.value}`
          : "—";

      const link =
        item.link ||
        item.url ||
        item.itemWebUrl ||
        "#";

      const title = item.title || "Untitled listing";

      card.innerHTML = `
        <img src="${image}" alt="${title}" />
        <h4>${title}</h4>
        <p class="price">${price}</p>
        <a href="${link}" target="_blank" rel="noopener">
          View on eBay
        </a>
      `;

      resultsEl.appendChild(card);
    });
  } catch (err) {
    console.error("SEARCH FAILED:", err);
    resultsEl.innerHTML =
      "<p style='opacity:.7'>Error loading listings</p>";
  } finally {
    loadingEl.style.display = "none";
  }
}

// EVENTS
searchBtn.addEventListener("click", search);
window.addEventListener("load", search);
