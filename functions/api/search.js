const state = {
  q: "pokemon psa",
  min: 0,
  max: 0,
  page: 1,
  sort: "newlyListed",
};

const resultsEl = document.getElementById("results");
const paginationEl = document.getElementById("pagination");

async function load() {
  resultsEl.innerHTML = "Loading…";
  paginationEl.innerHTML = "";

  const params = new URLSearchParams({
    q: state.q,
    min: state.min,
    max: state.max,
    page: state.page,
    sort: state.sort,
  });

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  if (!data.items.length) {
    resultsEl.innerHTML = "No results";
    return;
  }

  resultsEl.innerHTML = data.items.map(item => `
    <div class="card">
      <img src="${item.image}" loading="lazy">
      <div class="title">${item.title}</div>
      <div class="price">$${item.price.toLocaleString()}</div>
      <a href="${item.link}" target="_blank">View</a>
    </div>
  `).join("");

  renderPagination(data.total);
}

function renderPagination(total) {
  const pages = Math.ceil(total / 50);
  for (let i = 1; i <= Math.min(3, pages); i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      state.page = i;
      load();
    };
    paginationEl.appendChild(btn);
  }

  const next = document.createElement("button");
  next.textContent = "Next";
  next.onclick = () => {
    state.page++;
    load();
  };
  paginationEl.appendChild(next);
}

document.getElementById("searchBtn").onclick = () => {
  state.q = document.getElementById("q").value;
  state.page = 1;
  load();
};

document.getElementById("applyFilters").onclick = () => {
  state.min = Number(document.getElementById("minPrice").value) || 0;
  state.max = Number(document.getElementById("maxPrice").value) || 0;
  state.page = 1;
  load();
};

document.getElementById("sort").onchange = (e) => {
  state.sort = e.target.value;
  state.page = 1;
  load();
};

window.onload = load;
