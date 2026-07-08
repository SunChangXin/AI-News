"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Buildings,
  Clock,
  MagnifyingGlass,
  NewspaperClipping,
  Pulse,
  WarningCircle,
} from "@phosphor-icons/react";

const companies = [
  { id: "all", name: "全部动态" },
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "zhipu", name: "智谱 AI" },
];

const companyMeta = {
  openai: { name: "OpenAI", mark: "OAI", color: "#111111" },
  anthropic: { name: "Anthropic", mark: "A", color: "#d97757" },
  zhipu: { name: "智谱 AI", mark: "Z", color: "#3056d3" },
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "近期";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  }).format(date);
};

function Skeleton() {
  return (
    <div className="news-list" aria-label="正在获取资讯">
      {[1, 2, 3, 4].map((item) => (
        <div className="news-row skeleton-row" key={item}>
          <span className="skeleton skeleton-logo" />
          <div>
            <span className="skeleton skeleton-short" />
            <span className="skeleton skeleton-title" />
            <span className="skeleton skeleton-copy" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewsItem({ item, index }) {
  const meta = companyMeta[item.company] || companyMeta.openai;
  return (
    <article className="news-row" style={{ "--delay": `${Math.min(index, 8) * 45}ms` }}>
      <div className="company-mark" style={{ "--brand": meta.color }} aria-hidden="true">
        {meta.mark}
      </div>
      <div className="news-content">
        <div className="news-meta">
          <span>{meta.name}</span>
          <span>{formatDate(item.date)}</span>
          {item.category && <span>{item.category}</span>}
        </div>
        <h2>{item.title}</h2>
        <p>{item.summary}</p>
        <a href={item.url} target="_blank" rel="noreferrer" aria-label={`阅读原文：${item.title}`}>
          阅读原文 <ArrowRight size={17} weight="bold" />
        </a>
      </div>
    </article>
  );
}

export default function Newsroom() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let live = true;
    fetch("/api/news")
      .then((response) => {
        if (!response.ok) throw new Error("资讯服务暂时不可用");
        return response.json();
      })
      .then((data) => {
        if (!live) return;
        setNews(data.items || []);
        setUpdatedAt(data.updatedAt);
        setStatus(data.items?.length ? "ready" : "empty");
      })
      .catch(() => live && setStatus("error"));
    return () => { live = false; };
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return news.filter((item) => {
      const matchesCompany = active === "all" || item.company === active;
      const matchesQuery = !keyword || `${item.title} ${item.summary}`.toLocaleLowerCase().includes(keyword);
      return matchesCompany && matchesQuery;
    });
  }, [active, news, query]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AI 前线首页">
          <span className="brand-mark"><Pulse size={20} weight="bold" /></span>
          <span>AI 前线</span>
        </a>
        <div className="header-status">
          <span className="live-dot" />
          {updatedAt ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : "正在同步全球动态"}
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><NewspaperClipping size={16} /> AI COMPANY INTELLIGENCE</div>
          <h1>重要的 AI 消息，<br /><span>一处看完。</span></h1>
          <p>自动追踪头部 AI 公司的产品发布、研究进展与企业动态，直达每一条官方原文。</p>
        </div>
        <div className="hero-index" aria-label="监测概况">
          <div><strong>3</strong><span>重点公司</span></div>
          <div><strong>6h</strong><span>自动刷新</span></div>
          <div><strong>24/7</strong><span>持续监测</span></div>
        </div>
      </section>

      <section className="feed-shell" aria-label="AI 公司最新资讯">
        <div className="feed-toolbar">
          <div className="company-tabs" role="tablist" aria-label="按公司筛选">
            {companies.map((company) => (
              <button
                key={company.id}
                className={active === company.id ? "active" : ""}
                onClick={() => setActive(company.id)}
                role="tab"
                aria-selected={active === company.id}
              >
                {company.name}
              </button>
            ))}
          </div>
          <label className="search-box">
            <MagnifyingGlass size={18} />
            <span className="sr-only">搜索资讯</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或摘要" />
          </label>
        </div>

        <div className="feed-heading">
          <div>
            <h2>{companies.find((company) => company.id === active)?.name}</h2>
            <p>{status === "ready" ? `共 ${filtered.length} 条最新资讯` : "聚合官方发布与可靠资讯源"}</p>
          </div>
          <Clock size={22} />
        </div>

        {status === "loading" && <Skeleton />}
        {status === "error" && (
          <div className="state-panel">
            <WarningCircle size={32} />
            <h3>暂时无法获取最新资讯</h3>
            <p>上游资讯源可能正在维护，请稍后刷新页面。</p>
            <button onClick={() => window.location.reload()}>重新获取</button>
          </div>
        )}
        {(status === "empty" || (status === "ready" && !filtered.length)) && (
          <div className="state-panel">
            <MagnifyingGlass size={32} />
            <h3>没有找到匹配内容</h3>
            <p>换一个关键词，或查看其他公司动态。</p>
          </div>
        )}
        {status === "ready" && filtered.length > 0 && (
          <div className="news-list">{filtered.map((item, index) => <NewsItem item={item} index={index} key={item.id} />)}</div>
        )}
      </section>

      <footer>
        <div className="footer-brand"><Buildings size={19} /> AI 前线</div>
        <p>资讯版权归原发布方所有。本网站仅提供摘要与原文索引。</p>
      </footer>
    </main>
  );
}
