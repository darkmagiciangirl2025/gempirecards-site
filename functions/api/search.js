export default async function handler(req, res) {
  try {
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

    // ✅ PRICE FILTER
    if (min || max) {
      const minVal = min ? Number(min) : 0;
      const maxVal = max ? Number(max) : "";
      filters.push(`price:[${minVal}..${maxVal}]`);
    }

    // Listing type
    if (type === "auction") filters.push("buyingOptions:{AUCTION}");
    if (type === "fixed") filters.push("buyingOptions:{FIXED_PRICE}");

    const sortMap = {
      newlyListed: "NEWLY_LISTED",
      priceLow: "PRICE_PLUS_SHIPPING_LOWEST",
      priceHigh: "PRICE_PLUS_SHIPPING_HIGHEST",
    };

    const url = new URL(
      "https://api.ebay.com/buy/browse/v1/item_summary/search"
    );
    url.searchParams.set("q", q);
    url.searchParams.set("limit", limit);
    url.searchParams.set("offset", offset);
    url.searchParams.set("sort", sortMap[sort] || "NEWLY_LISTED");

    if (filters.length) {
      url.searchParams.set("filter", filters.join(","));
    }

    if (!process.env.EBAY_TOKEN) {
      return res.status(500).json({
        error: "EBAY_TOKEN missing",
      });
    }

    const ebayRes = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.EBAY_TOKEN}`,
      },
    });

    if (!ebayRes.ok) {
      const text = await ebayRes.text();
      return res.status(500).json({
        error: "eBay API error",
        details: text,
      });
    }

    const data = await ebayRes.json();

    const items = (data.itemSummaries || []).map((it) => ({
      id: it.itemId,
      title: it.title,
      price: it.price?.value ? Number(it.price.value) : null,
      currency: it.price?.currency || "USD",
      image:
        it.image?.imageUrl ||
        it.thumbnailImages?.slice(-1)[0]?.imageUrl ||
        "",
      url: it.itemWebUrl,
    }));

    res.status(200).json({
      total: data.total || 0,
      items,
    });
  } catch (err) {
    res.status(500).json({
      error: "Server crash",
      message: err.message,
    });
  }
}
