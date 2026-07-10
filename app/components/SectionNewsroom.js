"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import SiteNav from "./SiteNav";

const sectionMeta = {
  world: { label: "世界见闻", description: "追踪国际组织、外交与全球公共议题。", accent: "#315b8e" },
  science: { label: "科普探索", description: "从太空任务到最新论文，读懂科学进展。", accent: "#177c71" },
  english: { label: "英语口语", description: "用真实演讲和表达素材练习英语听说。", accent: "#2874a8" },
};

const formatDate = (value) => new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function SectionNewsroom({ section }) {
  const meta = sectionMeta[section];
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let live = true;
    fetch(`/api/sections/${section}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!live) return;
        setItems(data.items || []);
        setStatus(data.items?.length ? "ready" : "empty");
      })
      .catch(() => live && setStatus("error"));
    return () => { live = false; };
  }, [section]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return items.filter((item) => !keyword || `${item.title} ${item.summaryZh}`.toLocaleLowerCase().includes(keyword));
  }, [items, query]);

  return (
    <main className="portal-shell section-newsroom" style={{ "--section-accent": meta.accent }}>
      <SiteNav current={`/${section}`} />
      <section className="section-news-hero">
        <p className="portal-kicker">实时聚合</p>
        <h1>{meta.label}</h1>
        <p>{meta.description}</p>
      </section>
      <label className="portal-search section-search">
        <MagnifyingGlass size={19} />
        <span className="sr-only">搜索{meta.label}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${meta.label}资讯`} />
      </label>
      <section className="section-feed" aria-label={`${meta.label}资讯列表`}>
        {status === "loading" && <div className="portal-loading">正在聚合最新资讯</div>}
        {status === "error" && <div className="section-state"><WarningCircle size={32} /><p>资讯暂时不可用，请稍后刷新页面。</p></div>}
        {(status === "empty" || (status === "ready" && !filtered.length)) && <div className="portal-loading">没有找到匹配的资讯。</div>}
        {status === "ready" && filtered.map((item) => (
          <article className="section-story" key={item.id}>
            <div><span>{item.sourceName}</span><time>{formatDate(item.publishedAt)}</time><small>{item.sourceType}</small></div>
            <h2>{item.title}</h2>
            <p>{item.summaryZh}</p>
            <a href={item.originalUrl} target="_blank" rel="noreferrer">阅读原文 <ArrowRight size={16} /></a>
          </article>
        ))}
      </section>
    </main>
  );
}
