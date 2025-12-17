const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");

const minInput = document.getElementById("minPrice");
const maxInput = document.getElementById("maxPrice");

const tabs = document.querySelectorAll(".tab");

let activeType = "all"; // all | auction | fixed

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    runSearch();
  });
});

async function runSearch() {
  loader.style.display = "block";
  grid.innerHTML = "";

  const q = input.value || "pokemon";
  const min = minInput.value;
  const max = maxInput.value;

  const params = new URLSearchParams({ q });

  if (min) params.append("min", min);
  if (max) params.append("max", max);
  if (activeType !== "all") params.append("type", activeType);

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  loader.style.display = "none";

  if (!data.items || !data.items.length) {
    grid.innerHTML = "<p>No results found</p>";
    return;
  }

  data.items.forEach((item) => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <img src="${item.image}" />
      <h4>${item.title}</h4>
      <p>${item.price}</p>
      <a href="${item.link}" target="_blank">View</a>
    `;
    grid.appendChild(el);
  });
}

button.addEventListener("click", runSearch);
window.addEventListener("load", runSearch);
