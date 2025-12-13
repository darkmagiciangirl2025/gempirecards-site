export async function onRequestGet({ request, env }) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "pokemon";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = 24;

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sold = searchParams.get("sold") === "true";
    const sort = searchParams.get("sort") || "best";
    const type = searchParams.get("type") || "all"; // all | auction | fixed

    const ebayParams = new URLSearchParams({
      q,
      limit: perPage.toString(),
      offset: ((page - 1) * perPage).toString(),
    });

    if (minPrice) ebayParams.append("priceFrom", minPrice);
    if (maxPrice) ebayParams.append("priceTo", maxPrice);

    if (type === "auction") ebayParams.append("buyingOptions", "AUCTION");
    if (type === "fixed") ebayParams.append("buyingOptions", "FIXED_PRICE");

    if (sold) ebayParams.append("soldItemsOnly", "true");

    if (sort === "price_asc") ebayParams.append("sort", "price");
    if (sort === "price_desc") ebayParams.append("sort", "-price");
    if (sort === "newest") ebayParams.append("sort", "newlyListed");

    const ebayRes = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${ebayParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${env.EBAY_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!ebayRes.ok) {
      return json({ items: [], error: "eBay API error" }, 200);
    }

    const data = await ebayRes.json();

    const items = (data.itemSummaries || []).map((item) => ({
      id: item.itemId,
      title: item.title,
      price: item.price?.value ? Number(item.price.value) : null,
      currency: item.price?.currency || "USD",
      image: item.image?.imageUrl || "",
      url: item.itemWebUrl,
    }));

    return json({
      items,
      page,
      hasMore: items.length === perPage,
    });
  } catch (err) {
    return json(
      {
        items: [],
        error: "Server error",
        message: err.message,
      },
      200
    );
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
