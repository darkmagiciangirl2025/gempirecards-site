import { useEffect, useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("pokemon psa");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newlyListed");

  const [page, setPage] = useState(1);
  const perPage = 50;
  const [total, setTotal] = useState(0);

  async function fetchResults(overrides = {}) {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      q: overrides.query ?? query,
      min: overrides.minPrice ?? minPrice,
      max: overrides.maxPrice ?? maxPrice,
      sort: overrides.sort ?? sort,
      page: overrides.page ?? page,
      limit: perPage,
    });

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  // AUTO LOAD ON PAGE LOAD
  useEffect(() => {
    fetchResults({ page: 1 });
  }, []);

  function applyFilters() {
    setPage(1);
    fetchResults({ page: 1 });
  }

  function changePage(p) {
    setPage(p);
    fetchResults({ page: p });
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Gempire Discovery</h1>
      <p>Search Pokémon cards across eBay</p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="pokemon psa"
          style={{ flex: 1 }}
        />
        <button onClick={() => fetchResults({ page: 1 })}>Search</button>
      </div>

      <div style={{ marginTop: 12 }}>
        Sort by{" "}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            fetchResults({ sort: e.target.value, page: 1 });
          }}
        >
          <option value="newlyListed">Newly Listed</option>
          <option value="priceHigh">Price: High → Low</option>
          <option value="priceLow">Price: Low → High</option>
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Filters</strong>
        <div>
          $
          <input
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value.replace(/[^\d]/g, ""))}
          />
          {" to $"}
          <input
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ""))}
          />
          <button onClick={applyFilters}>Apply</button>
        </div>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Showing {(page - 1) * perPage + 1}–
        {Math.min(page * perPage, total)} of {total.toLocaleString()} results
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: "1px solid #333", padding: 12 }}>
            <img
              src={item.image}
              style={{ width: "100%", height: 260, objectFit: "contain" }}
            />
            <strong>{item.title}</strong>
            <div>${item.price.toLocaleString()}</div>
            <a href={item.url} target="_blank">View</a>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <button disabled={page === 1} onClick={() => changePage(page - 1)}>
          Prev
        </button>
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            disabled={p === page}
            onClick={() => changePage(p)}
          >
            {p}
          </button>
        ))}
        <button onClick={() => changePage(page + 1)}>Next</button>
      </div>
    </div>
  );
}
