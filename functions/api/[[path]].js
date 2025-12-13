export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const q = searchParams.get("q") || "pokemon";
  const page = searchParams.get("page") || 1;
  const type = searchParams.get("type") || "all";
  const sort = searchParams.get("sort") || "best";
  const sold = searchParams.get("sold") === "true";

  const EBAY_APP_ID = context.env.EBAY_APP_ID;

  let filter = [];
  if (sold) filter.push("SoldItemsOnly");

  let sortMap = {
    price_asc: "PricePlusShippingLowest",
    price_desc: "PricePlusShippingHighest",
    newest: "StartTimeNewest",
    best: "BestMatch"
  };

  const ebayURL =
    `https://svcs.ebay.com/services/search/FindingService/v1` +
    `?OPERATION-NAME=findItemsAdvanced` +
    `&SERVICE-VERSION=1.0.0` +
    `&SECURITY-APPNAME=${EBAY_APP_ID}` +
    `&RESPONSE-DATA-FORMAT=JSON` +
    `&REST-PAYLOAD` +
    `&keywords=${encodeURIComponent(q)}` +
    `&paginationInput.pageNumber=${page}` +
    `&sortOrder=${sortMap[sort] || "BestMatch"}` +
    filter.map((f, i) => `&itemFilter(${i}).name=${f}&itemFilter(${i}).value=true`).join("");

  const res = await fetch(ebayURL);
  const json = await res.json();

  const items =
    json.findItemsAdvancedResponse?.[0]?.searchResult?.[0]?.item?.map(i => ({
      title: i.title[0],
      price: i.sellingStatus?.[0]?.currentPrice?.[0]?.__value__,
      image: i.galleryURL?.[0],
      url: i.viewItemURL?.[0]
    })) || [];

  return new Response(
    JSON.stringify({
      items,
      hasMore: items.length > 0
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
