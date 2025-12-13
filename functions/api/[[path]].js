export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);

  const q = searchParams.get("q");
  const min = searchParams.get("minPrice");
  const max = searchParams.get("maxPrice");
  const sold = searchParams.get("sold") === "true";
  const sort = searchParams.get("sort");
  const page = Number(searchParams.get("page") || 1);

  let filter = [];
  if (min) filter.push(`price:[${min}..]`);
  if (max) filter.push(`price:[..${max}]`);
  if (sold) filter.push("sold:true");

  let sortMap = {
    price_asc: "price",
    price_desc: "-price",
    newest: "-endTime"
  };

  const ebayURL = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(q)}&limit=24&offset=${(page-1)*24}${filter.length ? `&filter=${filter.join(",")}` : ""}${sortMap[sort] ? `&sort=${sortMap[sort]}` : ""}`;

  const ebayRes = await fetch(ebayURL, {
    headers: {
      Authorization: `Bearer ${context.env.EBAY_TOKEN}`
    }
  });

  const json = await ebayRes.json();

  return new Response(JSON.stringify({
    items: (json.itemSummaries || []).map(i => ({
      title: i.title,
      price: i.price?.value,
      image: i.image?.imageUrl,
      url: i.itemWebUrl
    }))
  }), { headers: { "Content-Type": "application/json" } });
}
