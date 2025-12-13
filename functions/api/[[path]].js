export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const q = url.searchParams.get("q") || "";
  const offset = Number(url.searchParams.get("offset") || 0);
  const limit = 24;

  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const sold = url.searchParams.get("sold") === "1";
  const listingType = url.searchParams.get("listingType"); // auction | fixed
  const sort = url.searchParams.get("sort"); // priceAsc | priceDesc | endSoonest

  let filter = `categoryIds:{183454}`;
  if (minPrice) filter += `,price:[${minPrice}..]`;
  if (maxPrice) filter += `,price:[..${maxPrice}]`;
  if (listingType === "auction") filter += `,buyingOptions:{AUCTION}`;
  if (listingType === "fixed") filter += `,buyingOptions:{FIXED_PRICE}`;
  if (sold) filter += `,soldItemsOnly:true`;

  let sortParam = "";
  if (sort === "priceAsc") sortParam = "sort=price";
  if (sort === "priceDesc") sortParam = "sort=-price";
  if (sort === "endSoonest") sortParam = "sort=endTime";

  const ebayUrl =
    `https://api.ebay.com/buy/browse/v1/item_summary/search` +
    `?q=${encodeURIComponent(q)}` +
    `&limit=${limit}` +
    `&offset=${offset}` +
    `&filter=${encodeURIComponent(filter)}` +
    (sortParam ? `&${sortParam}` : "");

  const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  const tokenJson = await tokenRes.json();

  const ebayRes = await fetch(ebayUrl, {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
  });

  const data = await ebayRes.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
