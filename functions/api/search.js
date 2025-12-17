let cachedToken = null;
let tokenExpiry = 0;

async function getToken(env) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const auth = btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`);

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
  });

  const data = await res.json();
  if (!res.ok) {
    return { error: "Token request failed", details: data };
  }

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000; // buffer
  return cachedToken;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);

    // Supported: /api/search
    const pathname = url.pathname;
    if (!pathname.startsWith("/api/search")) {
      return json({ error: "Not found" }, 404);
    }

    const q = (url.searchParams.get("q") || "").trim();
    const min = url.searchParams.get("min") ? Number(url.searchParams.get("min")) : null;
    const max = url.searchParams.get("max") ? Number(url.searchParams.get("max")) : null;
    const type = (url.searchParams.get("type") || "all").toLowerCase(); // all|auction|fixed
    const sort = (url.searchParams.get("sort") || "newlyListed").trim(); // ebay browse sort values
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 50)));
    const offset = (page - 1) * limit;

    if (!q) {
      return json({ items: [], total: 0, page, limit });
    }

    const token = await getToken(env);
    if (typeof token === "object" && token?.error) return json(token, 500);

    // Build filters
    const filters = [];

    // Price filter syntax for Browse API: price:[min..max] (or min.. or ..max)
    if (Number.isFinite(min) && Number.isFinite(max)) filters.push(`price:[${min}..${max}]`);
    else if (Number.isFinite(min)) filters.push(`price:[${min}..]`);
    else if (Number.isFinite(max)) filters.push(`price:[..${max}]`);

    // Buying options
    // Browse API uses buyingOptions values like AUCTION / FIXED_PRICE
    if (type === "auction") filters.push("buyingOptions:{AUCTION}");
    if (type === "fixed") filters.push("buyingOptions:{FIXED_PRICE}");

    const apiUrl = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    apiUrl.searchParams.set("q", q);
    apiUrl.searchParams.set("limit", String(limit));
    apiUrl.searchParams.set("offset", String(offset));
    apiUrl.searchParams.set("sort", sort);
    if (filters.length) apiUrl.searchParams.set("filter", filters.join(","));

    const res = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return json(
        {
          error: "eBay search failed",
          status: res.status,
          details: data,
          apiUrl: apiUrl.toString(),
        },
        500
      );
    }

    const rawItems = Array.isArray(data.itemSummaries) ? data.itemSummaries : [];
    const items = rawItems.map((it) => {
      const priceValue = it?.price?.value != null ? Number(it.price.value) : null;
      const currency = it?.price?.currency || "USD";

      return {
        title: it?.title || "",
        priceValue,
        currency,
        priceText: it?.price?.value != null ? String(it.price.value) : "",
        image: it?.image?.imageUrl || "",
        link: it?.itemWebUrl || "",
        buyingOptions: it?.buyingOptions || [],
      };
    });

    return json({
      items,
      total: Number(data.total) || 0,
      page,
      limit,
      q,
      min,
      max,
      type,
      sort,
    });
  } catch (err) {
    return json({ error: "Server error", message: String(err?.message || err) }, 500);
  }
}
