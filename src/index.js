export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return new Response("Missing address param", { status: 400 });
    }

    const query = `site:zillow.com "${address}"`;
    const duckUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(duckUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      const html = await res.text();
      const match = html.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"/i);
      const rawHref = match ? match[1] : null;

      let actualUrl = null;
      if (rawHref) {
        const fullDuckUrl = "https:" + rawHref;
        const urlObj = new URL(fullDuckUrl);
        const encoded = urlObj.searchParams.get("uddg");
        if (encoded) {
          actualUrl = decodeURIComponent(encoded);
        }
      }

      return new Response(JSON.stringify({ url: actualUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
