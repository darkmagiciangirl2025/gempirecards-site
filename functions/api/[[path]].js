export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/?/, "");

    /* ---------------- HEALTH CHECK ---------------- */
    if (path === "" || path === "/") {
      return new Response("Gempire Discovery API is live", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    /* ---------------- SEARCH ---------------- */
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
        },
      });

      if (!ebayRes.ok) {
        const text = await ebayRes.text();
        return new Response(
          JSON.stringify({ error: "eBay API error", details: text }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await ebayRes.json();

      const items = (data.itemSummaries || []).map(item => ({
        id: item.itemId,
        title: item.title,
        price: item.price?.value,
        currency: item.price?.currency,
        image: item.image?.imageUrl,
        condition: item.condition,
        seller: item.seller?.username,
        link: `/api/go/${item.itemId}`,
      }));

      return new Response(JSON.stringify({ items }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    /* ---------------- AFFILIATE REDIRECT ---------------- */
    if (path.startsWith("go/")) {
      const itemId = path.split("go/")[1];
      if (!itemId) {
        return new Response("Missing item ID", { status: 400 });
      }

      const CAMPID = "5339113253"; // your EPN campaign ID

      const redirectUrl =
        `https://www.ebay.com/itm/${itemId}` +
        `?mkcid=1&mkrid=711-53200-19255-0` +
        `&campid=${CAMPID}` +
        `&toolid=10001`;

      return Response.redirect(redirectUrl, 302);
    }

    /* ---------------- FALLBACK ---------------- */
    return new Response("Not found", { status: 404 });
  },
};
