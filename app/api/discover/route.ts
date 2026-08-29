import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({ url: z.string().trim().min(1).max(2048) });

function normalizeUrl(input: string) {
  const candidate = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only http and https websites are supported.");
  return url;
}

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) || normalized.startsWith("2001:db8")) return true;
  const ipv4 = normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
  if (!isIP(ipv4)) return true;
  const parts = ipv4.split(".").map(Number);
  if (parts.length !== 4) return false;
  return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && (parts[1] === 0 || parts[1] === 168)) ||
    (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19)) ||
    (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) ||
    (parts[0] === 203 && parts[1] === 0 && parts[2] === 113);
}

async function assertPublicHost(url: URL) {
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("Please enter a public website.");
  const addresses = await lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Please enter a public website.");
}

function absoluteAsset(value: string | undefined, base: URL) {
  if (!value) return undefined;
  try { return new URL(value, base).toString(); } catch { return undefined; }
}

async function fetchPublicWebsite(startUrl: URL, signal: AbortSignal) {
  let currentUrl = startUrl;

  for (let redirectCount = 0; redirectCount <= 4; redirectCount += 1) {
    await assertPublicHost(currentUrl);
    const response = await fetch(currentUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "manual",
      signal,
      cache: "no-store",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The website returned an invalid redirect.");
      currentUrl = normalizeUrl(new URL(location, currentUrl).toString());
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new Error("The website redirected too many times.");
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter a valid website address." }, { status: 400 });
    const website = normalizeUrl(parsed.data.url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const { response, finalUrl } = await fetchPublicWebsite(website, controller.signal).finally(() => clearTimeout(timeout));

    if (!response.ok) throw new Error(`The website returned ${response.status}.`);
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) throw new Error("That URL is not an HTML website.");
    const html = (await response.text()).slice(0, 1_500_000);
    const $ = cheerio.load(html);

    const title = $('meta[property="og:site_name"]').attr("content") || $('meta[property="og:title"]').attr("content") || $("title").text() || finalUrl.hostname;
    const name = title.split(/\s[|—–]\s/)[0].trim().slice(0, 80);
    const description = ($('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "We found the website. Add a short product description before generating content.").trim().slice(0, 300);
    const image = absoluteAsset($('meta[property="og:image"]').attr("content") || $('link[rel~="icon"]').attr("href"), finalUrl);
    const themeColor = $('meta[name="theme-color"]').attr("content");
    const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const signals = [
      keywords[0] || "website positioning",
      keywords[1] || "audience language",
      "brand voice",
      image ? "visual identity" : "content opportunity",
    ];

    return NextResponse.json({
      profile: {
        name,
        url: finalUrl.toString(),
        description,
        image,
        themeColor,
        signals,
      },
    });
  } catch (error) {
    const message = error instanceof Error && error.name !== "AbortError" ? error.message : "The website took too long to respond.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
