let page = 0;
let loading = false;
let listingType = "all";

let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    listingType = tab.dataset.type;
    newSearch();
  };
});

function newSearch() {
  page = 0;
  document.getElementById("results").innerHTML = "";
  runSearch();
}

function mapSort(uiSort) {
  switch (uiSort) {
    case "price_asc":
      return "price";
    case "price_desc":
      return "-price";
    case "newest":
      return "newlyListed";
    default:
      return "relevance";
  }
}

async function runSearch() {
  if (loading) return;
  loading = true;

  const q = document.getElementById("query").value.trim();
  let query = q;

  const grading = document.getElementById("grading").value;
  const grade = document.getElementById("grade").value;
  const min = document.getElementById("minPrice").value;
  const max = document.getElementById("maxPrice").value;
  const sold = document.getElementById("soldToggle").checked;

  const uiSort = document.getElementById("sort").value;
  const sort = mapSort(uiSort);

  if (grading) query += ` ${grading}`;
  if (grade) query += ` ${grade}`;

  const params = new URLSearchParams({
    q: query,
    offset: page * 24,
    limit: 24,
    sort
  });

  if (listingType === "auction") params.append("auction", "true");
  if (listingType === "fixed") params.append("fixed", "true");
  if (min) params.append("min", min);
  if (max) params.append("max", max);
  if (sold) params.append("sold", "true");

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  const results = document.getElementById("results");

  data.itemSummaries?.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const liked = watchlist.includes(item.itemId);

    card.innerHTML = `
      <div class="heart ${liked ? "active" : ""}" data-id="${item.itemId}">♥</div>
      <img src="${item.image?.imageUrl || ""}">
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="price">$${item.price?.value || "-"}</div>
        <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
      </div>
    `;

    card.querySelector(".heart").onclick = (e) => {
      const id = e.target.dataset.id;
      if (watchlist.includes(id)) {
        watchlist = watchlist.filter(x => x !== id);
        e.target.classList.remove("active");
      } else {
        watchlist.push(id);
        e.target.classList.add("active");
      }
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
    };

    results.appendChild(card);
  });

  page++;
  loading = false;
}

window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY > document.body.offsetHeight - 600) {
    runSearch();
  }
});
