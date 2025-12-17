export default async function handler(req, res) {
  const {
    q = "pokemon psa",
    type = "all",
    sort = "newlyListed",
    min,
    max,
    page = 1,
    limit = 50,
  } = req.query;

  const offset = (page - 1) * limit;

  const filters = [];

  // ✅ PRICE FILTER (THIS WAS MISSING)
  if (min || max) {
    const minVal = min ? Number(min) : 0;
    const maxVal = max ? Number(max) : "";
    filters.push(`price:[${minVal}..${maxVal}]`);
  }

  // Listing type
  if (type === "auction") {
    filters.push("buyingOptions:{AUCTION}");
  }
  if (type === "fixed") {
    filters.push("buyingOptions:{FIXED_PRICE}");
  }

  // Sort mapping
  const sortMap = {
    newlyListed: "NEWLY_LISTED",
    priceLow: "PRICE_PLUS_SHIPPING_LOWEST",
    priceHigh: "PRICE_PLUS_SHIPPING_HIGHEST",
  };

  const ebayURL = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  ebayURL.searchParams.set("q", q);
  ebayURL.searchParams.set("limit", limit);
  ebayURL.searchParams.set("offset", offset);
  ebayURL.searchParams.set("sort", sortMap[sort] || "NEWLY_LISTED");

  if (filters.length) {
    ebayURL.searchParams.set("filter", filters.join(","));
  }

  const ebayRes = await fetch(ebayURL.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.EBAY_TOKEN}`,
    },
  });

  const data = await ebayRes.json();

  const items = (data.itemSummaries || []).map((it) => ({
    id: it.itemId,
    title: it.title,
    priceValue: it.price?.value || 0,
    currency: it.price?.currency || "USD",
    image:
      it.image?.imageUrl ||
      it.thumbnailImages?.[0]?.imageUrl ||
      "",
    link: it.itemWebUrl,
  }));

  res.status(200).json({
    total: data.total || 0,
    items,
  });
}
