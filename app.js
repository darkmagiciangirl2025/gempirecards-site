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
sentinel.style.height = '1px';
resultsEl.after(sentinel);

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

    let appended = 0;

    for (const item of items) {
      if (seenIds.has(item.itemId)) continue;
      seenIds.add(item.itemId);
      resultsEl.appendChild(renderCard(item));
      appended++;
    }

    offset += items.length;

    if (items.length < LIMIT || appended === 0) {
      hasMore = false;
    }

  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    isFetching = false;
    loadingEl.style.display = 'none';
  }
}

/* ---------- CARD ---------- */
function renderCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = item.image?.imageUrl || '';
  const price = item.price?.value ? `$${item.price.value}` : '';

  card.innerHTML = `
    <img src="${img}" />
    <h4>${item.title}</h4>
    <div class="price">${price}</div>
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
  { rootMargin: '800px' }
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

/* ---------- INITIAL LOAD ---------- */
fetchResults(true);
