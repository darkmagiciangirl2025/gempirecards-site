const API_BASE = "https://shop.gempirecards.com";

async function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const sort = document.getElementById("sortSelect").value;
  const resultsEl = document.getElementById("results");

  if (!query) {
    resultsEl.innerHTML = "<p>Enter a search term.</p>";
    return;
  }

  resultsEl.innerHTML = "<p>Loading…</p>";

  let url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
  if (sort) url += `&sort=${sort}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = "<p>No results found.</p>";
      return;
    }

    resultsEl.innerHTML = data.items
      .map(item => `
        <a class="card" href="${API_BASE}/go/${item.id}" target="_blank">
          <img src="${item.image}" alt="${item.title}" />
          <div class="card-info">
            <h3>${item.title}</h3>
            <p class="price">$${item.price}</p>
            <p class="condition">${item.condition}</p>
          </div>
        </a>
      `)
      .join("");

  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "<p>Error loading results.</p>";
  }
}
