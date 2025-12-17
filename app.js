let state = {
  query: "pokemon psa",
  page: 1,
  min: 3000,
  max: "",
  sort: "newlyListed",
  type: "all",
};

const resultsEl = document.getElementById("results");
const loadingEl = document.getElementById("loading");

async function loadResults() {
  loadingEl.style.display = "block";
  resultsEl.innerHTML = "";

  const params = new URLSearchParams({
    q: state.query,
    page: state.page,
    limit: 50,
    sort: state.sort,
    type: state.type,
    min: state.min,
    max: state.max,
  });

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    loadingEl.style.display = "none";

    if (data.error) {
      resultsEl.innerHTML = `<p style="color:red">${data.error}</p>`;
      console.error(data);
      return;
    }

    if (!data.items.length) {
      resultsEl.innerHTML = "<p>No results</p>";
      return;
    }

    data.items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${item.image}" />
        <h4>${item.title}</h4>
        <p>$${item.price?.toLocaleString() || "—"}</p>
        <a href="${item.url}" target="_blank">View</a>
      `;
      resultsEl.appendChild(card);
    });
  } catch (err) {
    loadingEl.style.display = "none";
    resultsEl.innerHTML = `<p style="color:red">Failed to load</p>`;
    console.error(err);
  }
}

// Initial load
loadResults();
