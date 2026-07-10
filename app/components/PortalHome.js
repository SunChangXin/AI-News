"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, GlobeHemisphereWest, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import SiteNav from "./SiteNav";

const sections = [
  { href: "/world", label: "世界见闻", description: "国际组织、外交与全球热点", accent: "#315b8e", live: true },
  { href: "/china", label: "社会时事", description: "民生、教育、医疗与公共事件", accent: "#d85a35" },
  { href: "/party", label: "党建", description: "政策文件、会议与理论学习", accent: "#bd2735" },
  { href: "/horror", label: "恐怖怪谈", description: "故事、传闻与社区热帖，含内容标注", accent: "#5d466c" },
  { href: "/science", label: "科普探索", description: "天文、生命、地球与论文速读", accent: "#177c71", live: true },
  { href: "/english", label: "英语口语", description: "TED、表达训练与实用听说素材", accent: "#2874a8", live: true },
];

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "近期";
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric" }).format(date);
};

export default function PortalHome() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/news")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!live) return;
        setItems(data.items || []);
        setStatus("ready");
      })
      .catch(() => live && setStatus("error"));
    return () => { live = false; };
  }, []);

  const aiItems = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return items.filter((item) => !keyword || `${item.title} ${item.summary}`.toLocaleLowerCase().includes(keyword)).slice(0, 4);
  }, [items, query]);

  return (
    <main className="portal-shell">
      <SiteNav current="/" />
      <section className="portal-hero">
        <div>
          <p className="portal-kicker"><GlobeHemisphereWest size={16} /> 综合资讯门户</p>
          <h1>看清正在发生的事。</h1>
          <p>从全球 AI 动态开始，逐步汇集世界、社会、科普与语言学习资讯。</p>
          <Link className="portal-primary-link" href="/ai">进入 AI 前线 <ArrowRight size={17} weight="bold" /></Link>
        </div>
        <div className="portal-hero-visual" aria-hidden="true">
          <img src="/ai-news-icon.svg" alt="" />
          <span>AI</span><span>WORLD</span><span>SCIENCE</span>
        </div>
      </section>

      <section className="portal-search-section" aria-label="搜索 AI 前线资讯">
        <label className="portal-search">
          <MagnifyingGlass size={19} />
          <span className="sr-only">搜索 AI 前线资讯</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 AI 前线资讯" />
        </label>
      </section>

      <section className="portal-ai-section" aria-labelledby="ai-heading">
        <div className="portal-section-heading">
          <div>
            <p className="portal-kicker"><Sparkle size={16} /> 已上线</p>
            <h2 id="ai-heading">AI 前线</h2>
          </div>
          <Link href="/ai">查看全部 <ArrowRight size={17} /></Link>
        </div>
        {status === "loading" && <div className="portal-loading">正在聚合 AI 公司动态</div>}
        {status === "error" && <div className="portal-loading">资讯暂时不可用，请稍后刷新页面。</div>}
        {status === "ready" && !aiItems.length && <div className="portal-loading">没有匹配的 AI 资讯。</div>}
        {status === "ready" && aiItems.length > 0 && (
          <div className="portal-ai-grid">
            {aiItems.map((item) => (
              <article className="portal-story" key={item.id}>
                <div className="portal-story-meta"><span>{item.company}</span><time>{formatDate(item.date)}</time></div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">阅读原文 <ArrowRight size={15} /></a>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="portal-sections" aria-labelledby="sections-heading">
        <div className="portal-section-heading portal-section-intro">
          <div><h2 id="sections-heading">更多栏目，逐步上线</h2><p>每个栏目将使用独立资讯源与专属筛选方式。</p></div>
        </div>
        <div className="portal-section-grid">
          {sections.map((section) => (
            <Link className="portal-section-card" href={section.href} key={section.href} style={{ "--section-accent": section.accent }}>
              <span>{section.label}</span>
              <p>{section.description}</p>
              <small>{section.live ? "已上线" : "筹备中"} <ArrowRight size={14} /></small>
            </Link>
          ))}
        </div>
      </section>

      <footer className="portal-footer">资讯前线 · 让信息回到清晰、可靠的原始来源。</footer>
    </main>
  );
}
