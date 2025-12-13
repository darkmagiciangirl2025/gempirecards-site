let listingType = "all";

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    listingType = tab.dataset.type;
    runSearch();
  });
});

async function runSearch() {
  const q = document.getElementById("query").value.trim();
  if (!q) return;

  const grading = document.getElementById("grading").value;
  const grade = document.getElementById("grade").value;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const usOnly = document.getElementById("usOnly").checked;

  let finalQuery = q;
  if (grading) finalQuery += ` ${grading}`;
  if (grade) finalQuery += ` ${grade}`;

  const params = new URLSearchParams({
    q: finalQuery
  });

  if (listingType === "auction") params.append("auction", "true");
  if (listingType === "fixed") params.append("fixed", "true");
  if (minPrice) params.append("min", minPrice);
  if (maxPrice) params.append("max", maxPrice);
  if (usOnly) params.append("us", "true");

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!data.itemSummaries || data.itemSummaries.length === 0) {
    results.innerHTML = `<div class="empty">No results found</div>`;
    return;
  }

  data.itemSummaries.forEach(item => {
    const img = item.image?.imageUrl || "";
    const price = item.price?.value
      ? `$${Number(item.price.value).toLocaleString()}`
      : "—";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${img}">
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="price">${price}</div>
        <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
      </div>
    `;

    results.appendChild(card);
  });
}
