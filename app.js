const resultsWrapper = document.getElementById('resultsWrapper');
const resultsEl = document.getElementById('results');
const loadingEl = document.getElementById('loading');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortSelect = document.getElementById('sort');
const soldToggle = document.getElementById('soldToggle');

const grading = document.getElementById('grading');
const grade = document.getElementById('grade');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

let offset = 0;
let hasMore = true;
let isFetching = false;
let currentType = 'all';

const LIMIT = 24;
const seenIds = new Set();

/* ---------- SENTINEL ---------- */
const sentinel = document.createElement('div');
sentinel.style.height = '40px';
sentinel.style.width = '100%';
resultsWrapper.appendChild(sentinel);

/* ---------- FETCH ---------- */
async function fetchResults(reset = false) {
  if (isFetching || !hasMore) return;

  isFetching = true;
  loadingEl.style.display = 'block';

  if (reset) {
    offset = 0;
    hasMore = true;
    seenIds.clear();
    resultsEl.innerHTML = '';
  }

  const params = new URLSearchParams({
    q: searchInput.value || 'pokemon',
    limit: LIMIT,
    offset,
    sort: sortSelect.value,
    sold: soldToggle.checked,
    grading: grading.value,
    grade: grade.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    type: currentType
  });

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    const items = data.itemSummaries || [];

    if (items.length === 0) {
      hasMore = false;
      return;
    }

    let added = 0;

    for (const item of items) {
      if (seenIds.has(item.itemId)) continue;
      seenIds.add(item.itemId);
      resultsEl.appendChild(renderCard(item));
      added++;
    }

    offset += items.length;

    if (items.length < LIMIT || added === 0) {
      hasMore = false;
    }

  } catch (err) {
    console.error(err);
  } finally {
    isFetching = false;
    loadingEl.style.display = 'none';
  }
}

/* ---------- CARD ---------- */
function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="${item.image?.imageUrl || ''}">
    <h4>${item.title}</h4>
    <div class="price">${item.price?.value ? `$${item.price.value}` : ''}</div>
    <a href="${item.itemWebUrl}" target="_blank">View on eBay</a>
  `;

  return card;
}

/* ---------- INTERSECTION OBSERVER ---------- */
const observer = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      fetchResults();
    }
  },
  {
    root: resultsWrapper, // ✅ THIS IS THE FIX
    rootMargin: '400px',
    threshold: 0
  }
);

observer.observe(sentinel);

/* ---------- EVENTS ---------- */
function resetAndSearch() {
  hasMore = true;
  fetchResults(true);
}

searchBtn.onclick = resetAndSearch;
sortSelect.onchange = resetAndSearch;
soldToggle.onchange = resetAndSearch;
grading.onchange = resetAndSearch;
grade.onchange = resetAndSearch;
minPrice.onchange = resetAndSearch;
maxPrice.onchange = resetAndSearch;

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentType = tab.dataset.type;
    resetAndSearch();
  };
});

/* ---------- INITIAL ---------- */
fetchResults(true);
