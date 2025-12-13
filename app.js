let page = 1;
let loading = false;
let hasMore = true;
let currentType = "all";

const grid = document.getElementById("grid");
const loader = document.getElementById("loader");

async function loadResults(reset = false) {
  if (loading || !hasMore) return;
  loading = true;
  loader.style.display = "block";

  if (reset) {
    page = 1;
    hasMore = true;
    grid.innerHTML = "";
  }

  const q = document.getElementById("searchInput").value || "pokemon";
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const sold = document.getElementById("soldToggle").checked;
  const sort = document.getElementById("sortSelect").value;

  const params = new URLSearchParams({
    q,
    page,
    type: currentType,
    sort,
    sold
  });

  if (minPrice) params.append("minPrice", minPrice);
  if (maxPrice) params.append("maxPrice", maxPrice);

  const res = await fetch(`/functions/search?${params.toString()}`);
  const data = await res.json();

  data.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" />
      <h4>${item.title}</h4>
      <p>$${item.price ?? "—"}</p>
      <a href="${item.url}" target="_blank">View on eBay</a>
    `;
    grid.appendChild(card);
  });

  hasMore = data.hasMore;
  page++;
  loading = false;
  loader.style.display = "none";
}

document.getElementById("searchBtn").onclick = () => loadResults(true);

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.type;
    loadResults(true);
  };
});

document.getElementById("sortSelect").onchange = () => loadResults(true);
document.getElementById("soldToggle").onchange = () => loadResults(true);
document.getElementById("minPrice").onchange = () => loadResults(true);
document.getElementById("maxPrice").onchange = () => loadResults(true);

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadResults();
  }
});

// initial load
loadResults(true);
