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

let currentOffset = 0;
let isLoading = false;
let hasMore = true;
let currentType = 'all';

const LIMIT = 24;
const seenIds = new Set();

async function loadResults(reset = false) {
  if (isLoading || !hasMore) return;
  isLoading = true;
  loadingEl.style.display = 'block';

  if (reset) {
    currentOffset = 0;
    hasMore = true;
    seenIds.clear();
    resultsEl.innerHTML = '';
  }

  const params = new URLSearchParams({
    q: searchInput.value || 'pokemon',
    limit: LIMIT,
    offset: currentOffset,
    sort: sortSelect.value,
    sold: soldToggle.checked,
    grading: grading.value,
    grade: grade.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    type: currentType
  });

  const res = await fetch(`/api/search?${params.toString()}`);
  const data = await res.json();

  const items = data.itemSummaries || [];
  if (items.length === 0) {
    hasMore = false;
    loadingEl.style.display = 'none';
    return;
  }

  for (const item of items) {
    if (seenIds.has(item.itemId)) continue;
    seenIds.add(item.itemId);
    resultsEl.appendChild(renderCard(item));
  }

  currentOffset += items.length;
  if (items.length < LIMIT) hasMore = false;

  isLoading = false;
  loadingEl.style.display = 'none';
}

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

/* EVENTS */

searchBtn.onclick = () => loadResults(true);
sortSelect.onchange = () => loadResults(true);
soldToggle.onchange = () => loadResults(true);
grading.onchange = () => loadResults(true);
grade.onchange = () => loadResults(true);
minPrice.onchange = () => loadResults(true);
maxPrice.onchange = () => loadResults(true);

document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentType = tab.dataset.type;
    loadResults(true);
  };
});

/* INFINITE SCROLL */
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
    loadResults();
  }
});

/* INITIAL LOAD */
loadResults(true);
