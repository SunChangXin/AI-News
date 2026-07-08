import { NextResponse } from "next/server";

export const revalidate = 21600;
export const dynamic = "force-dynamic";

const sources = [
  {
    company: "openai",
    name: "OpenAI",
    urls: ["https://openai.com/news/rss.xml", "https://news.google.com/rss/search?q=site%3Aopenai.com%2Findex&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans"],
  },
  {
    company: "anthropic",
    name: "Anthropic",
    urls: ["https://www.anthropic.com/news/rss.xml", "https://news.google.com/rss/search?q=site%3Aanthropic.com%2Fnews+Anthropic&hl=en-US&gl=US&ceid=US%3Aen"],
  },
  {
    company: "zhipu",
    name: "智谱 AI",
    urls: ["https://news.google.com/rss/search?q=site%3Azhipuai.cn+OR+site%3Az.ai%2Fblog&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans"],
  },
];

const decode = (value = "") => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, "\"")
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/\s+/g, " ")
  .trim();

const field = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decode(match?.[1] || "");
};

const cleanTitle = (title, sourceName) => title
  .replace(new RegExp(`\\s*[-|]\\s*${sourceName}\\s*$`, "i"), "")
  .replace(/\s*[-|]\s*OpenAI\s*$/i, "")
  .trim();

const makeSummary = (description, title) => {
  const clean = decode(description).replace(/^.*?\s[-–]\s/, "");
  if (clean && clean.toLocaleLowerCase() !== title.toLocaleLowerCase()) return clean.slice(0, 180);
  return `了解这项来自官方的最新发布，涵盖相关产品、研究进展与后续影响。点击进入原文查看完整信息。`;
};

function parseRss(xml, source) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  return blocks.slice(0, 8).map((block, index) => {
    const title = cleanTitle(field(block, "title"), source.name);
    const link = field(block, "link");
    const guid = field(block, "guid");
    const description = field(block, "description") || field(block, "content:encoded");
    return {
      id: `${source.company}-${guid || link || index}`,
      company: source.company,
      title,
      summary: makeSummary(description, title),
      date: field(block, "pubDate") || field(block, "dc:date") || new Date().toISOString(),
      category: field(block, "category") || "官方动态",
      url: link || guid,
    };
  }).filter((item) => item.title && item.url);
}

async function loadSource(source) {
  for (const url of source.urls) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "AI-Newsroom/1.0 (+https://vercel.app)" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) continue;
      const items = parseRss(await response.text(), source);
      if (items.length) return items;
    } catch {}
  }
  return [];
}

export async function GET() {
  const results = await Promise.all(sources.map(loadSource));
  const items = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
  return NextResponse.json(
    { items, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  );
}
