let offset = 0;
let loading = false;
let hasMore = true;
let listingType = "";
let sort = "";

const grid = document.getElementById("grid");
const loader = document.getElementById("loader");

async function loadItems(reset = false) {
  if (loading || !hasMore) return;
  loading = true;
  loader.style.display = "block";

  if (reset) {
    offset = 0;
    hasMore = true;
    grid.innerHTML = "";
  }

  const q = document.getElementById("searchInput").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const sold = document.getElementById("soldToggle").checked ? "1" : "0";

  const params = new URLSearchParams({
    q,
    offset,
    minPrice,
    maxPrice,
    sold,
    listingType,
    sort,
  });

  const res = await fetch(`/api/search?${params}`);
  const data = await res.json();

  const items = data.itemSummaries || [];
  if (items.length === 0) hasMore = false;

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image?.imageUrl || ""}" />
      <h4>${item.title}</h4>
      <p>$${item.price?.value || ""}</p>
      <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
    `;
    grid.appendChild(card);
  });

  offset += items.length;
  loading = false;
  loader.style.display = "none";
}

document.getElementById("searchBtn").onclick = () => loadItems(true);
document.getElementById("sortSelect").onchange = e => {
  sort = e.target.value;
  loadItems(true);
};

document.querySelectorAll(".tab").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    listingType = btn.dataset.type;
    loadItems(true);
  };
});

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 400
  ) {
    loadItems();
  }
});
