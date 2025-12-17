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
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    console.log("WORKER RESPONSE:", data);

    const items = data.items || [];

    if (!items.length) {
      resultsEl.innerHTML =
        "<p style='opacity:.7'>No listings returned</p>";
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${item.image || ""}" />
        <h4>${item.title}</h4>
        <p class="price">${item.price || "—"}</p>
        <a href="${item.link}" target="_blank" rel="noopener">
          View on eBay
        </a>
      `;

      resultsEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML =
      "<p style='o
