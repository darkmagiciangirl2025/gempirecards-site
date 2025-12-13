const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

async function search() {
  const q = searchInput.value || "pokemon";
  loadingEl.style.display = "block";
  resultsEl.innerHTML = "";

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();

  loadingEl.style.display = "none";

  data.results.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.img || ""}" />
      <h4>${item.title}</h4>
      <p>${item.price}</p>
      <a href="${item.link}" target="_blank">View on eBay</a>
    `;
    resultsEl.appendChild(card);
  });
}

searchBtn.addEventListener("click", search);
window.addEventListener("load", search);
