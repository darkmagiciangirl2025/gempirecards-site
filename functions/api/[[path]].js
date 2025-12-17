let cachedToken = null;
let tokenExpiry = 0;

async function getToken(env) {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
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

  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000 - 60000;

  return cachedToken;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "pokemon";

  const token = await getToken(env);

  const ebayUrl = new URL(
    "https://api.ebay.com/buy/browse/v1/item_summary/search"
  );
  ebayUrl.searchParams.set("q", q);
  ebayUrl.searchParams.set("limit", "24");
  ebayUrl.searchParams.set("category_ids", "183454");

  const ebayRes = await fetch(ebayUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

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
