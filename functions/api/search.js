let tokenCache = null;
let tokenExpiry = 0;

async function getToken(env) {
  if (tokenCache && Date.now() < tokenExpiry) {
    return tokenCache;
  }

  const auth = btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`);

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!res.ok) {
    throw new Error("Failed to get eBay token");
  }

  const json = await res.json();
  tokenCache = json.access_token;
  tokenExpiry = Date.now() + json.expires_in * 1000 - 60000;
  return tokenCache;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q") || "pokemon";
  const min = url.searchParams.get("min");
  const max = url.searchParams.get("max");
  const type = url.searchParams.get("type"); // all | auction | fixed

  const token = await getToken(env);

  const ebayURL = new URL(
    "https://api.ebay.com/buy/browse/v1/item_summary/search"
  );

  ebayURL.searchParams.set("q", q);
  ebayURL.searchParams.set("limit", "24");
  ebayURL.searchParams.set("category_ids", "183454");

  // ============================
  // ✅ FILTER LOGIC (CORRECT)
  // ============================

  const filters = [];

  let minPrice = min ? Number(min) : null;
  let maxPrice = max ? Number(max) : null;

  // ✅ Auto-fix reversed ranges
  if (minPrice && maxPrice && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  // ✅ Price filter (currency REQUIRED)
  if (minPrice || maxPrice) {
    filters.push(
      `price:[${minPrice ?? 0}..${maxPrice ?? ""}],priceCurrency:USD`
    );
  }

  // ✅ Auction / Fixed Price
  if (type === "auction") {
    filters.push("buyingOptions:{AUCTION}");
  }

  if (type === "fixed") {
    filters.push("buyingOptions:{FIXED_PRICE}");
  }

  if (filters.length) {
    ebayURL.searchParams.set("filter", filters.join(","));
  }

  // ============================
  // eBay API CALL
  // ============================

  const ebayRes = await fetch(ebayURL.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!ebayRes.ok) {
    const err = await ebayRes.text();
    return new Response(
      JSON.stringify({ error: "eBay API error", details: err }),
      { status: 500 }
    );
  }

  const data = await ebayRes.json();

  const items = (data.itemSummaries || []).map((item) => ({
    title: item.title,
    price: `$${item.price?.value}`,
    image: item.image?.imageUrl,
    link: item.itemWebUrl,
  }));

  return new Response(JSON.stringify({ items }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
