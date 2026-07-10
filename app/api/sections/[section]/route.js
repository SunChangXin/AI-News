import { NextResponse } from "next/server";
import { decodeRssText } from "../../../../lib/rss";

export const revalidate = 21600;
export const dynamic = "force-dynamic";

const sectionSources = {
  china: {
    label: "社会时事",
    sources: [
      { name: "国内资讯", type: "媒体报道", url: googleNewsChinese("中国 社会 民生 教育 医疗 公共事件") },
      { name: "政府公开信息", type: "公开发布", url: googleNewsChinese("site:gov.cn 民生 OR 教育 OR 医疗") },
    ],
  },
  party: {
    label: "党建",
    sources: [
      { name: "党建资讯", type: "公开发布", url: googleNewsChinese("党建 OR 党史学习 OR 中央党校 OR 组织建设") },
      { name: "政府公开信息", type: "公开发布", url: googleNewsChinese("site:gov.cn 党建 OR 党的建设") },
    ],
  },
  horror: {
    label: "恐怖怪谈",
    sources: [
      { name: "r/nosleep", type: "社区故事", url: "https://www.reddit.com/r/nosleep/.rss", warning: "虚构故事与用户经历并存，请自行判断真实性。" },
      { name: "怪谈社区", type: "社区故事", url: googleNews("site:reddit.com/r/nosleep OR site:reddit.com/r/LetsNotMeet horror story"), warning: "内容可能包含惊悚、暴力或不适描述。" },
    ],
  },
  world: {
    label: "世界见闻",
    sources: [
      { name: "联合国新闻", type: "官方发布", url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml" },
      { name: "全球媒体", type: "媒体报道", url: googleNews("global affairs OR international diplomacy OR United Nations") },
    ],
  },
  science: {
    label: "科普探索",
    sources: [
      { name: "NASA", type: "官方发布", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss" },
      { name: "arXiv", type: "论文速读", url: "https://export.arxiv.org/rss/astro-ph" },
      { name: "科学媒体", type: "媒体报道", url: googleNews("science discovery OR space exploration OR climate research") },
    ],
  },
  english: {
    label: "英语口语",
    sources: [
      { name: "TED Talks", type: "英语学习", url: "https://feeds.feedburner.com/tedtalks_video" },
      { name: "TED", type: "英语学习", url: googleNews("site:ted.com/talks TED talk communication OR learning") },
    ],
  },
};

function googleNews(query, locale = "en-US", region = "US") {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", locale);
  url.searchParams.set("gl", region);
  url.searchParams.set("ceid", `${region}:en`);
  return url.toString();
}

function googleNewsChinese(query) {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", "zh-CN");
  url.searchParams.set("gl", "CN");
  url.searchParams.set("ceid", "CN:zh-Hans");
  return url.toString();
}

const field = (xml, tag) => {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return decodeRssText(match?.[1] || "");
};

const normalizeUrl = (url = "") => url.replace(/^https?:\/\/news\.google\.com\/rss\/articles\//, "https://news.google.com/articles/");
const containsChinese = (text = "") => /[\u3400-\u9fff]/.test(text);

function parseRss(xml, section, source) {
  const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
  return blocks.slice(0, 12).map((block, index) => {
    const title = field(block, "title").replace(/\s*[-|]\s*(TED Talks Daily|NASA|United Nations).*$/i, "").trim();
    const atomLink = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] || "";
    const originalUrl = normalizeUrl(atomLink || field(block, "link") || field(block, "guid"));
    const originalTitle = title;
    const summaryZh = (field(block, "description") || field(block, "content:encoded") || field(block, "summary") || field(block, "content")).slice(0, 320);
    return {
      id: `${section}-${source.name}-${field(block, "guid") || originalUrl || index}`,
      section,
      title,
      originalTitle,
      summaryZh,
      sourceName: source.name,
      sourceType: source.type,
      sourceLanguage: containsChinese(title) || containsChinese(summaryZh) ? "zh" : "en",
      originalUrl,
      publishedAt: field(block, "pubDate") || field(block, "dc:date") || new Date().toISOString(),
      fetchedAt: new Date().toISOString(),
      tags: [],
      warning: source.warning,
    };
  }).filter((item) => item.title && item.originalUrl);
}

async function toChineseSummary(article) {
  if (containsChinese(article.summaryZh)) return article;
  const sourceText = article.summaryZh || article.title;
  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "auto");
    endpoint.searchParams.set("tl", "zh-CN");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", sourceText);
    const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("translation unavailable");
    const data = await response.json();
    const translated = data?.[0]?.map((part) => part?.[0] || "").join("").trim();
    if (translated) return { ...article, summaryZh: translated };
  } catch {}
  return { ...article, summaryZh: `这篇内容来自${article.sourceName}，点击原文可查看完整信息。` };
}

const uniqueItems = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.originalUrl.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export async function GET(_, { params }) {
  const { section } = await params;
  const config = sectionSources[section];
  if (!config) return NextResponse.json({ error: "栏目不存在" }, { status: 404 });

  const batches = await Promise.all(config.sources.map(async (source) => {
    try {
      const response = await fetch(source.url, {
        headers: { "User-Agent": "Information-Frontier/1.0 (+https://ai-news-blond.vercel.app)" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return [];
      return parseRss(await response.text(), section, source);
    } catch {
      return [];
    }
  }));

  const articles = uniqueItems(batches.flat())
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 24);
  const items = await Promise.all(articles.map(toChineseSummary));
  return NextResponse.json(
    { section, label: config.label, items, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  );
}
