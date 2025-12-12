async function runSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const sort = document.getElementById("sortSelect").value;
  const resultsEl = document.getElementById("results");

  if (!query) return;

  resultsEl.innerHTML = "Loading...";

  try {
    let url = `https://shop.gempirecards.com/search?q=${encodeURIComponent(query)}`;

    if (sort) {
      url += `&sort=${sort}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Bad response");

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      resultsEl.innerHTML = "No results found";
      return;
    }

    resultsEl.innerHTML = data.items.map(item => `
      <div class="card">
        <img src="${item.image}" />
        <h3>${item.title}</h3>
        <p>$${item.price}</p>
        <a href="${item.link}" target="_blank">View on eBay</a>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = "Error loading results";
  }
}
