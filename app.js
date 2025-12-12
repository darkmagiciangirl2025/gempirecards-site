const API_BASE = "https://shop.gempirecards.com";

async function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const sort = document.getElementById("sortSelect").value;
  const resultsEl = document.getElementById("results");

  if (!query) return;

  resultsEl.innerHTML = "Loading…";

  let url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
  if (sort) url += `&sort=${sort}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    resultsEl.innerHTML = "";

    data.items.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${item.image}" />
        <h3>${item.title}</h3>
        <div class="price">$${item.price}</div>
        <a href="${item.link}" target="_blank">View on eBay</a>
      `;

      resultsEl.appendChild(card);
    });
  } catch (err) {
    resultsEl.innerHTML = "Error loading results";
  }
}
