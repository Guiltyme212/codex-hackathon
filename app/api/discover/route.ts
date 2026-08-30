import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { BrandProfile } from "@/lib/brand-profile";

export const runtime = "nodejs";

const requestSchema = z
  .object({
    url: z.string().trim().max(2048).optional(),
    description: z.string().trim().max(50_000).optional(),
  })
  .refine((value) => Boolean(value.url || (value.description && value.description.length >= 20)), {
    message: "Add a website or at least 20 characters of product context.",
  });

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

function unique(values: string[]) {
  return [...new Set(values.map(clean).filter(Boolean))];
}

function firstSentence(value: string) {
  const sentence = clean(value).split(/(?<=[.!?])\s/)[0];
  return sentence.slice(0, 260).replace(/[.!?]?$/, ".");
}

function inferAudience(copy: string) {
  const normalized = copy.toLowerCase();
  if (/developer|api|code|software team/.test(normalized)) return ["Developers and product teams", "Technical founders", "Teams shipping software"];
  if (/founder|startup|saas|business/.test(normalized)) return ["App founders", "Small product teams", "People responsible for growth"];
  if (/wellness|meditat|mental|health|calm/.test(normalized)) return ["People building healthier routines", "Busy adults", "Wellness-minded users"];
  if (/creator|content|social|marketing/.test(normalized)) return ["Creators and marketers", "Founder-led brands", "Small growth teams"];
  if (/learn|student|course|education/.test(normalized)) return ["Curious learners", "Students and educators", "People building a new skill"];
  return ["People actively looking for this outcome", "Early adopters", "Customers frustrated by existing options"];
}

function buildProfile(input: {
  name: string;
  url: string;
  description: string;
  logo?: string;
  image?: string;
  themeColor?: string;
  headings?: string[];
  keywords?: string[];
  sourceLabel: string;
}): BrandProfile {
  const headings = unique(input.headings ?? []).filter((heading) => heading.length > 8 && heading.length < 140);
  const sourceCopy = [input.name, input.description, ...headings, ...(input.keywords ?? [])].join(" ");
  const audience = inferAudience(sourceCopy);
  const proofHeadings = headings.slice(0, 3);
  const benefits = unique([
    ...proofHeadings,
    `Reach the outcome without the usual complexity`,
    `Get value from the first session`,
  ]).slice(0, 3);
  const accent = /^#[0-9a-f]{6}$/i.test(input.themeColor ?? "") ? input.themeColor! : "#c8ff5c";

  return {
    name: input.name,
    url: input.url,
    description: input.description,
    logo: input.logo,
    image: input.image,
    themeColor: input.themeColor,
    palette: ["#f5f1e8", "#151612", accent, "#ffffff"],
    signals: unique([
      input.keywords?.[0] ?? "Website positioning",
      input.keywords?.[1] ?? "Audience language",
      headings[0] ?? "Core product promise",
      input.image ? "Visual identity" : "Founder-supplied context",
    ]).slice(0, 4),
    product: firstSentence(input.description),
    audience,
    problem: `The audience needs the outcome ${input.name} promises, but current options still feel slow, generic, or difficult to sustain.`,
    benefits,
    tone: ["Clear and human", "Confident without hype", "Specific and product-led"],
    avoid: ["Generic AI phrasing", "Claims without proof", "Feature lists without an outcome"],
    positioning: `${input.name} helps ${audience[0].toLowerCase()} reach the promised outcome with less friction and more clarity.`,
    mission: `Make the product’s value obvious, useful, and easier to act on.`,
    evidence: unique([
      ...proofHeadings.map((heading) => `“${heading}”`),
      `${input.sourceLabel} description`,
    ]).slice(0, 3),
    contentAngles: [
      `The problem ${audience[0].toLowerCase()} rarely say out loud`,
      `What changes before and after ${input.name}`,
      `The fastest way to understand why ${input.name} exists`,
      `A founder’s honest take on the old way`,
      `Show the product moment that makes the benefit click`,
    ],
  };
}

function profileFromDescription(description: string) {
  const nameMatch = description.match(/(?:called|named|app is|product is)\s+["“]?([A-Z][\w-]{1,30})/i);
  const name = nameMatch?.[1] ?? "Your app";
  return buildProfile({
    name,
    url: "Founder brief",
    description: firstSentence(description),
    headings: description.split(/\n+/).slice(0, 6),
    sourceLabel: "Founder-provided",
  });
}

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
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Add your app context." }, { status: 400 });

    if (parsed.data.description && !parsed.data.url) {
      return NextResponse.json({ profile: profileFromDescription(parsed.data.description) });
    }

    const website = normalizeUrl(parsed.data.url ?? "");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const { response, finalUrl } = await fetchPublicWebsite(website, controller.signal).finally(() => clearTimeout(timeout));

    if (!response.ok) throw new Error(`The website returned ${response.status}.`);
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) throw new Error("That URL is not an HTML website.");
    const html = (await response.text()).slice(0, 1_500_000);
    const $ = cheerio.load(html);

    const title = $('meta[property="og:site_name"]').attr("content") || $('meta[property="og:title"]').attr("content") || $("title").text() || finalUrl.hostname;
    const name = clean(title).split(/\s[|—–]\s/)[0].trim().slice(0, 80);
    const description = clean($('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || $("h1").first().text() || "We found the website. Add a short product description before generating content.").slice(0, 400);
    const logo = absoluteAsset(
      $('link[rel="apple-touch-icon"]').last().attr("href") ||
      $('link[rel~="icon"]').last().attr("href") ||
      "/favicon.ico",
      finalUrl,
    );
    const image = absoluteAsset($('meta[property="og:image"]').attr("content"), finalUrl);
    const themeColor = $('meta[name="theme-color"]').attr("content");
    const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map((item) => item.trim()).filter(Boolean);
    const headings = unique($("h1, h2").map((_, element) => $(element).text()).get()).slice(0, 8);
    const profile = buildProfile({
      name,
      url: finalUrl.toString(),
      description,
      logo,
      image,
      themeColor,
      headings,
      keywords,
      sourceLabel: finalUrl.hostname,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error && error.name !== "AbortError" ? error.message : "The website took too long to respond.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
