export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Normalize path (THIS FIXES YOUR ISSUE)
  const path = url.pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/+/, "");

  // =========================
  // HEALTH CHECK
  // =========================
  if (path === "") {
    return new Response("Gempire Discovery API is live", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // =========================
  // SEARCH ENDPOINT
  // /api/search?q=charizard
  // =========================
  if (path === "search") {
    const q = url.searchParams.get("q");

    if (!q) {
      return new Response(JSON.stringify({ items: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const ebayUrl =
      "https://api.ebay.com/buy/browse/v1/item_summary/search" +
      `?q=${encodeURIComponent(q)}` +
      "&category_ids=183454" +
      "&limit=24";

    const ebayRes = await fetch(ebayUrl, {
      headers: {
        Authorization: `Bearer ${env.EBAY_TOKEN}`,
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
      },
    });

    if (!ebayRes.ok) {
      const text = await ebayRes.text();
      return new Response(
        JSON.stringify({
          error: "eBay API error",
          status: ebayRes.status,
          details: text,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await ebayRes.json();

    const CAMPID = "5339113235";
    const UL_REF = "https://rover.ebay.com/rover/1/711-53200-19255-0/1";

    const items = (data.itemSummaries || []).map((item) => {
      const itemId = item.itemId;
      const link =
        `/go/${itemId}`;

      return {
        id: itemId,
        title: item.title,
        price: item.price?.value,
        currency: item.price?.currency,
        image: item.image?.imageUrl,
        condition: item.condition,
        seller: item.seller?.username,
        link,
      };
    });

    return new Response(JSON.stringify({ items }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // =========================
  // FALLBACK
  // =========================
  return new Response("Not found", { status: 404 });
}
