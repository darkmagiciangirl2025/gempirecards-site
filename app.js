const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");

async function runSearch() {
  loader.style.display = "block";
  grid.innerHTML = "";

  const q = input.value || "pokemon";

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();

  loader.style.display = "none";

  console.log("UI DATA:", data);

  if (!data.items || !data.items.length) {
    grid.innerHTML = "<p>No results</p>";
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

button.onclick = runSearch;
window.onload = runSearch;
