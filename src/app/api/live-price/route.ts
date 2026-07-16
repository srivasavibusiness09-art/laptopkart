import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function cleanSearchQuery(title: string): string {
  if (!title) return "";
  const splitPattern = new RegExp(
    "\\s[-([/•]\\s|\\b(intel|amd|core|ryzen|i3|i5|i7|i9|r3|r5|r7|r9|generation|gen|gb|ssd|hdd|windows|nvidia|geforce|gtx|rtx|graphics|\\d+(st|nd|rd|th))\\b",
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


function parsePriceText(text: string | undefined): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[₹,\s]/g, "");
  const val = parseInt(cleaned, 10);
  return Number.isFinite(val) ? val : null;
}

// Tokenize + score title relevance against the query.
// Decomposes unicode mathematical alphanumeric signs and exact matches model numbers.
function titleMatchesQuery(title: string, query: string): boolean {
  const cleanStr = (s: string) =>
    s.normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ");

  const titleCleaned = cleanStr(title);
  const queryCleaned = cleanStr(query);

  // Extract model numbers (3 or 4 digit sequences) from query
  const queryModelNumbers = queryCleaned.match(/\b\d{3,4}\b/g) || [];
  for (const num of queryModelNumbers) {
    if (!titleCleaned.includes(num)) {
      return false; // Model number mismatch
    }
  }

  // Tokenize
  const tokenize = (s: string) =>
    s.split(/\s+/).filter(w => w.length > 2);

  const queryTokens = tokenize(queryCleaned);
  const titleTokens = new Set(tokenize(titleCleaned));

  if (queryTokens.length === 0) return false;

  // Filter out brand names when calculating matching tokens ratio
  const brands = new Set(['dell', 'hp', 'lenovo', 'apple', 'macbook', 'asus', 'acer']);
  const nonBrandQueryTokens = queryTokens.filter(t => !brands.has(t));

  if (nonBrandQueryTokens.length > 0) {
    const matched = nonBrandQueryTokens.filter(t => titleTokens.has(t)).length;
    const ratio = matched / nonBrandQueryTokens.length;
    return ratio >= 0.5; // Lenient ratio for remaining terms since model number is already verified
  }

  // Fallback if query only contains brands / numbers
  const matched = queryTokens.filter(t => titleTokens.has(t)).length;
  const ratio = matched / queryTokens.length;
  return ratio >= 0.5;
}



async function getLivePricesFromSearch(query: string): Promise<{ amazonPrice: number | null, flipkartPrice: number | null, cromaPrice: number | null }> {
  const searchEngines = [
    { name: "Ask.com", url: `https://www.ask.com/web?q=${encodeURIComponent(query + ' price India')}` },
    { name: "Yahoo", url: `https://search.yahoo.com/search?p=${encodeURIComponent(query + ' price India')}` }
  ];

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  };

  const candidatesAmazon: number[] = [];
  const candidatesFlipkart: number[] = [];
  const candidatesCroma: number[] = [];

  for (const engine of searchEngines) {
    try {
      const res = await fetch(engine.url, { headers, cache: "no-store" });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("a").each((_, el) => {
        const href = $(el).attr("href") || "";
        let store: "flipkart" | "amazon" | "croma" | null = null;
        
        if (href.includes("flipkart.com")) store = "flipkart";
        else if (href.includes("amazon.in") || href.includes("amazon.co.in")) store = "amazon";
        else if (href.includes("croma.com")) store = "croma";

        if (!store) return;

        // Traverse parent elements to find snippet containing price patterns
        let parent = $(el).parent();
        let foundSnippet = "";
        for (let i = 0; i < 4; i++) {
          if (!parent.length) break;
          const parentText = parent.text();
          if (parentText.includes("₹") || parentText.includes("Rs") || parentText.includes("INR") || parentText.includes("Rs.")) {
            foundSnippet = parentText;
          }
          parent = parent.parent();
        }

        if (foundSnippet) {
          const priceMatches = foundSnippet.match(/(?:₹|Rs\.?|INR)\s*([\d,]+)/gi);
          if (priceMatches) {
            for (const matchStr of priceMatches) {
              const cleaned = matchStr.replace(/(?:₹|Rs\.?|INR|,\s*)/gi, "").replace(/,/g, "").trim();
              const price = parseInt(cleaned, 10);
              if (price && price > 5000 && price < 400000) {
                if (store === "amazon") candidatesAmazon.push(price);
                if (store === "flipkart") candidatesFlipkart.push(price);
                if (store === "croma") candidatesCroma.push(price);
              }
            }
          }
        }
      });
    } catch (err) {
      console.error(`Scrape search engine ${engine.name} failed:`, err);
    }
  }

  return {
    amazonPrice: candidatesAmazon.length > 0 ? Math.min(...candidatesAmazon) : null,
    flipkartPrice: candidatesFlipkart.length > 0 ? Math.min(...candidatesFlipkart) : null,
    cromaPrice: candidatesCroma.length > 0 ? Math.min(...candidatesCroma) : null
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("query");
  if (!rawQuery) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const query = cleanSearchQuery(rawQuery);

  let amazonPrice: number | null = null;
  let flipkartPrice: number | null = null;
  let cromaPrice: number | null = null;

  // 1. Sanitize the query to form a safe Firestore document ID
  const cacheId = query.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const docRef = doc(db, "price_cache", cacheId);

  // 2. Check for a valid 24-hour cache entry in Firestore
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const cachedData = docSnap.data();
      const ageInSeconds = (Date.now() - (cachedData.lastScrapedAt || 0)) / 1000;
      if (ageInSeconds < 432000) { // 5-day TTL
        console.log(`[Cache Hit] Serving stored prices for: ${query}`);
        return NextResponse.json({
          amazonPrice: cachedData.amazonPrice,
          flipkartPrice: cachedData.flipkartPrice,
          cromaPrice: cachedData.cromaPrice,
          matchedQuery: query,
          cached: true
        });
      }
    }
  } catch (dbErr) {
    console.error("Failed to read price cache from Firestore:", dbErr);
  }

  // 3. Fallback: Trigger unblocked free search scrapers if cache is missing or expired
  console.log(`[Cache Miss] Querying free search engines for: ${query}`);
  const result = await getLivePricesFromSearch(query);
  amazonPrice = result.amazonPrice;
  flipkartPrice = result.flipkartPrice;
  cromaPrice = result.cromaPrice;

  // Save fresh prices to cache
  try {
    await setDoc(docRef, {
      amazonPrice,
      flipkartPrice,
      cromaPrice,
      lastScrapedAt: Date.now(),
      query
    });
    console.log(`[Cache Write] Updated Firestore cache for: ${query}`);
  } catch (dbErr) {
    console.error("Failed to write price cache to Firestore:", dbErr);
  }

  return NextResponse.json({ amazonPrice, flipkartPrice, cromaPrice, matchedQuery: query, cached: false });
}