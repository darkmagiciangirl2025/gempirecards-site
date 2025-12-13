export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const endpoint = params.path;

  // Only handle /api/search
  if (endpoint !== "search") {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const q = url.searchParams.get("q") || "pokemon";
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const sold = url.searchParams.get("sold") === "true";
  const sort = url.searchParams.get("sort") || "BestMatch";

  const ebayParams = new URLSearchParams({
    _nkw: q,
    _sop: sort === "PricePlusShippingLowest" ? "15" : "12",
    LH_Sold: sold ? "1" : "0",
    LH_Complete: sold ? "1" : "0",
    _ipg: "60",
  });

  if (minPrice) ebayParams.set("_udlo", minPrice);
  if (maxPrice) ebayParams.set("_udhi", maxPrice);

  const ebayURL = `https://www.ebay.com/sch/i.html?${ebayParams.toString()}`;

  const res = await fetch(ebayURL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const html = await res.text();

  // VERY BASIC scrape (safe fallback)
  const items = [...html.matchAll(/<li class="s-item.*?<\/li>/gs)].slice(0, 60);

  const results = items.map((block) => {
    const title = block[0].match(/class="s-item__title">([^<]+)/)?.[1];
    const price = block[0].match(/\$[\d,]+(\.\d{2})?/i)?.[0];
    const link = block[0].match(/href="(https:\/\/www\.ebay\.com\/itm\/[^"]+)"/)?.[1];
    const img = block[0].match(/img src="([^"]+)"/)?.[1];

    if (!title || !price || !link) return null;

    return { title, price, link, img };
  }).filter(Boolean);

  return new Response(JSON.stringify({ results }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
