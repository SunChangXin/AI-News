import { NextResponse } from "next/server";

export const revalidate = 21600;
export const dynamic = "force-dynamic";

const sources = [
  {
    company: "openai",
    name: "OpenAI",
    urls: [
      "https://openai.com/news/rss.xml",
      googleNews("OpenAI OR ChatGPT OR GPT-5 OR GPT-5.6 OR GPT-5.6 Sol OR Sora"),
      googleNews("OpenAI product launch OR OpenAI model release OR ChatGPT update"),
      googleNews("site:openai.com/news OR site:help.openai.com OpenAI"),
    ],
  },
  {
    company: "anthropic",
    name: "Anthropic",
    urls: [
      "https://www.anthropic.com/news/rss.xml",
      googleNews("Anthropic OR Claude AI OR Claude Code OR Claude model release"),
      googleNews("site:anthropic.com/news OR site:support.anthropic.com Claude Anthropic"),
      googleNews("Claude update OR Claude new model OR Anthropic product launch"),
    ],
  },
  {
    company: "zhipu",
    name: "智谱 AI",
    urls: [
      googleNews("智谱 AI OR 智谱清言 OR GLM OR Z.ai"),
      googleNews("site:zhipuai.cn OR site:z.ai 智谱 OR GLM"),
      googleNews("智谱 模型 发布 OR 智谱 产品 更新 OR GLM 新模型"),
    ],
  },
  {
    company: "deepmind",
    name: "Google DeepMind",
    urls: [
      "https://deepmind.google/discover/blog/rss.xml",
      googleNews("Google DeepMind OR Gemini OR Gemma OR Veo model update"),
      googleNews("site:deepmind.google Gemini OR Gemma OR Veo"),
    ],
  },
  {
    company: "meta",
    name: "Meta AI",
    urls: [
      "https://ai.meta.com/blog/rss/",
      googleNews("Meta AI OR Llama OR Meta Superintelligence Labs"),
      googleNews("site:ai.meta.com/blog Llama OR Meta AI"),
    ],
  },
  {
    company: "xai",
    name: "xAI",
    urls: [
      googleNews("xAI OR Grok model OR Grok API"),
      googleNews("site:x.ai/news Grok OR xAI"),
    ],
  },
  {
    company: "mistral",
    name: "Mistral AI",
    urls: [
      googleNews("Mistral AI OR Le Chat OR Mistral model"),
      googleNews("site:mistral.ai/news Mistral"),
    ],
  },
  {
    company: "deepseek",
    name: "DeepSeek",
    urls: [
      googleNews("DeepSeek OR DeepSeek R1 OR DeepSeek V3"),
      googleNews("site:deepseek.com DeepSeek OR site:github.com/deepseek-ai"),
    ],
  },
  {
    company: "qwen",
    name: "通义千问",
    urls: [
      googleNews("通义千问 OR Qwen OR 阿里云 AI"),
      googleNews("site:qwenlm.github.io OR site:aliyun.com Qwen OR 通义千问"),
    ],
  },
  {
    company: "baidu",
    name: "百度文心",
    urls: [
      googleNews("百度 文心 OR ERNIE OR 飞桨 AI"),
      googleNews("site:baidu.com 文心 OR ERNIE 模型"),
    ],
  },
  {
    company: "tencent",
    name: "腾讯混元",
    urls: [
      googleNews("腾讯 混元 OR Hunyuan OR 腾讯元宝 AI"),
      googleNews("site:tencent.com 混元 OR Hunyuan 模型"),
    ],
  },
  {
    company: "kimi",
    name: "Kimi",
    urls: [
      googleNews("月之暗面 OR Kimi AI OR Kimi 模型"),
      googleNews("site:moonshot.cn Kimi OR 月之暗面"),
    ],
  },
];

function googleNews(query, locale = "zh-CN", region = "CN") {
  const url = new URL("https://news.google.com/rss/search");
  url.searchParams.set("q", query);
  url.searchParams.set("hl", locale);
  url.searchParams.set("gl", region);
  url.searchParams.set("ceid", `${region}:zh-Hans`);
  return url.toString();
}

const decode = (value = "") => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, "\"")
  .replace(/&nbsp;/g, " ")
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
  return blocks.slice(0, 12).map((block, index) => {
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
      category: inferCategory(link || guid, field(block, "category")),
      url: normalizeGoogleNewsUrl(link || guid),
    };
  }).filter((item) => item.title && item.url);
}

function inferCategory(url = "", category = "") {
  if (category) return category;
  if (/news\.google\.com/i.test(url)) return "媒体报道";
  return "官方动态";
}

function normalizeGoogleNewsUrl(url = "") {
  return url.replace(/^https?:\/\/news\.google\.com\/rss\/articles\//, "https://news.google.com/articles/");
}

function uniqueItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.company}:${item.url || item.title}`.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const containsChinese = (text = "") => /[\u3400-\u9fff]/.test(text);

async function toChineseSummary(item) {
  if (containsChinese(item.summary)) return item;

  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "auto");
    endpoint.searchParams.set("tl", "zh-CN");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", item.summary);

    const response = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("translation unavailable");

    const data = await response.json();
    const translated = data?.[0]?.map((part) => part?.[0] || "").join("").trim();
    if (translated) return { ...item, summary: translated };
  } catch {}

  return {
    ...item,
    summary: `这篇资讯介绍了 ${item.title} 的最新进展，涉及相关产品、研究或公司动态。点击原文可查看完整信息。`,
  };
}

async function loadSource(source) {
  const batches = await Promise.all(source.urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "AI-Newsroom/1.0 (+https://vercel.app)" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return [];
      return parseRss(await response.text(), source);
    } catch {
      return [];
    }
  }));

  return uniqueItems(batches.flat())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
}

export async function GET() {
  const results = await Promise.all(sources.map(loadSource));
  const sorted = uniqueItems(results.flat())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 72);
  const items = await Promise.all(sorted.map(toChineseSummary));
  return NextResponse.json(
    { items, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  );
}
