import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

function cleanSearchQuery(title: string): string {
  if (!title) return "";
  const splitPattern = new RegExp(
    "\\b(intel|amd|core|ryzen|i3|i5|i7|i9|r3|r5|r7|r9|generation|gen|gb|ssd|hdd|windows|nvidia|geforce|gtx|rtx|graphics|\\d+(st|nd|rd|th))\\b|[-([/•]",
    "i"
  );
  const match = title.match(splitPattern);
  let cutIndex = match ? match.index! : title.length;
  let finalQuery = title.substring(0, cutIndex).trim();
  finalQuery = finalQuery.replace(/^[,\s-]+|[,\s-]+$/g, "");
  if (finalQuery.length < 6) {
    return title.split(" ").slice(0, 4).join(" ");
  }
  return finalQuery;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

async function fetchHTML(targetUrl: string): Promise<string | null> {
  const apiKey = process.env.SCRAPER_API_KEY;
  try {
    let url = targetUrl;
    let headers: HeadersInit = HEADERS;

    if (apiKey && !apiKey.includes("YOUR_") && apiKey.trim() !== "") {
      url = `http://api.scraperapi.com?api_key=${apiKey.trim()}&url=${encodeURIComponent(targetUrl)}`;
      headers = {}; // ScraperAPI manages headers automatically
    }

    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.error(`Fetch failed for URL: ${targetUrl}`, err);
    return null;
  }
}


function parsePriceText(text: string | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[₹,\s]/g, "");
  const val = parseInt(cleaned, 10);
  return Number.isFinite(val) ? val : null;
}

// Tokenize + score title relevance against the query.
// Requires most of the query's meaningful words to appear in the candidate title.
function titleMatchesQuery(title: string, query: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2);

  const queryTokens = normalize(query);
  const titleTokens = new Set(normalize(title));

  if (queryTokens.length === 0) return false;

  const matched = queryTokens.filter(t => titleTokens.has(t)).length;
  const ratio = matched / queryTokens.length;

  // Require at least ~70% of query words present in the product title
  return ratio >= 0.7;
}

async function getFlipkartPrice(query: string): Promise<number | null> {
  try {
    const html = await fetchHTML(`https://www.flipkart.com/search?q=${encodeURIComponent(query)}`);
    if (!html) return null;
    if (html.includes("captcha") || html.length < 5000) return null;

    const $ = cheerio.load(html);
    const candidates: number[] = [];

    $("a[href*='/p/']").each((_, el) => {
      const card = $(el).closest("div");
      const title = card.find("div").first().text().trim() || $(el).attr("title") || "";
      if (!titleMatchesQuery(title, query)) return;

      const priceEl = card.find("div").filter((_, d) => /^₹[\d,]+$/.test($(d).text().trim())).first();
      const price = parsePriceText(priceEl.text());
      if (price && price > 5000 && price < 400000) candidates.push(price);
    });

    return candidates.length > 0 ? Math.min(...candidates) : null;
  } catch (err) {
    console.error("Flipkart scrape failed:", err);
    return null;
  }
}

async function getAmazonPrice(query: string): Promise<number | null> {
  try {
    const html = await fetchHTML(`https://www.amazon.in/s?k=${encodeURIComponent(query)}`);
    if (!html) return null;
    if (html.includes("Enter the characters you see below") || html.length < 5000) return null;

    const $ = cheerio.load(html);
    const candidates: number[] = [];

    $('div[data-component-type="s-search-result"]').each((_, card) => {
      const $card = $(card);

      // Skip sponsored listings entirely — they're frequently irrelevant/mismatched products
      const isSponsored = $card.find("span:contains('Sponsored')").length > 0 ||
        $card.attr("data-cel-widget")?.includes("SPONSORED");
      if (isSponsored) return;

      const title = $card.find("h2 span").first().text().trim();
      if (!titleMatchesQuery(title, query)) return;

      const offerPriceEl = $card.find("span.a-price:not(.a-text-price) span.a-offscreen").first();
      const price = parsePriceText(offerPriceEl.text());
      if (price && price > 5000 && price < 400000) candidates.push(price);
    });

    return candidates.length > 0 ? Math.min(...candidates) : null;
  } catch (err) {
    console.error("Amazon scrape failed:", err);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("query");
  if (!rawQuery) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const query = cleanSearchQuery(rawQuery);

  const [flipkartPrice, amazonPrice] = await Promise.all([
    getFlipkartPrice(query),
    getAmazonPrice(query),
  ]);

  return NextResponse.json({ amazonPrice, flipkartPrice, matchedQuery: query });
}