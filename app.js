let page = 1;
let loading = false;
let hasMore = true;

const results = document.getElementById("results");
const loadingEl = document.getElementById("loading");

async function search(reset = true) {
  if (loading || !hasMore) return;
  loading = true;
  loadingEl.style.display = "block";

  if (reset) {
    page = 1;
    hasMore = true;
    results.innerHTML = "";
  }

  const params = new URLSearchParams({
    q: searchInput.value,
    grading: grading.value,
    grade: grade.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    sold: soldToggle.checked,
    sort: sort.value,
    page
  });

  const res = await fetch(`/functions/search?${params}`);
  const data = await res.json();

  data.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}">
      <h4>${item.title}</h4>
      <div class="price">$${item.price}</div>
      <a href="${item.url}" target="_blank">View on eBay</a>
    `;
    results.appendChild(card);
  });

  if (data.items.length === 0) hasMore = false;

  page++;
  loading = false;
  loadingEl.style.display = "none";
}

searchBtn.onclick = () => search(true);
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY > document.body.offsetHeight - 500) {
    search(false);
  }
});
