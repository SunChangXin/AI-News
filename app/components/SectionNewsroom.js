"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import SiteNav from "./SiteNav";

const sectionMeta = {
  world: { label: "世界见闻", description: "聚焦中国、美国、欧盟、俄罗斯等主要国家和地区的全球动向。", accent: "#315b8e", subcategories: ["中国", "美国", "欧盟", "俄罗斯", "国际组织"] },
  china: { label: "社会时事", description: "关注民生、教育、医疗与公共事件。", accent: "#d85a35" },
  party: { label: "党建", description: "汇集党建公开信息、政策文件与理论学习动态。", accent: "#bd2735" },
  horror: { label: "恐怖怪谈", description: "收录社区故事与怪谈内容，已标注可能的不适信息。", accent: "#5d466c", subcategories: ["长篇故事", "短篇故事"] },
  science: { label: "科普探索", description: "覆盖医疗健康、心理学、社会实验、数学物理与优质科普内容。", accent: "#177c71", subcategories: ["太空天文", "医疗健康", "心理学", "社会实验", "数学物理", "冷知识", "名人堂", "Kurzgesagt"] },
  english: { label: "英语口语", description: "按听、说、读、写四项能力组织学习素材。", accent: "#2874a8", subcategories: ["听力", "口语", "阅读", "写作"] },
};

const formatDate = (value) => new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function SectionNewsroom({ section }) {
  const meta = sectionMeta[section];
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
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
    return items.filter((item) => {
      const matchesSubcategory = activeSubcategory === "all" || item.subcategory === activeSubcategory;
      const matchesQuery = !keyword || `${item.title} ${item.summaryZh}`.toLocaleLowerCase().includes(keyword);
      return matchesSubcategory && matchesQuery;
    });
  }, [activeSubcategory, items, query]);

  const availableSubcategories = (meta.subcategories || []).filter((subcategory) => items.some((item) => item.subcategory === subcategory));

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
      {availableSubcategories.length > 0 && (
        <div className="section-tabs" role="tablist" aria-label={`${meta.label}子分区`}>
          <button className={activeSubcategory === "all" ? "active" : ""} onClick={() => setActiveSubcategory("all")} role="tab" aria-selected={activeSubcategory === "all"}>全部</button>
          {availableSubcategories.map((subcategory) => (
            <button className={activeSubcategory === subcategory ? "active" : ""} onClick={() => setActiveSubcategory(subcategory)} role="tab" aria-selected={activeSubcategory === subcategory} key={subcategory}>{subcategory}</button>
          ))}
        </div>
      )}
      <section className="section-feed" aria-label={`${meta.label}资讯列表`}>
        {status === "loading" && <div className="portal-loading">正在聚合最新资讯</div>}
        {status === "error" && <div className="section-state"><WarningCircle size={32} /><p>资讯暂时不可用，请稍后刷新页面。</p></div>}
        {(status === "empty" || (status === "ready" && !filtered.length)) && <div className="portal-loading">没有找到匹配的资讯。</div>}
        {status === "ready" && filtered.map((item) => (
          <article className="section-story" key={item.id}>
            <div><span>{item.sourceName}</span><time>{formatDate(item.publishedAt)}</time><small>{item.subcategory || item.sourceType}</small></div>
            <h2>{item.title}</h2>
            <p>{item.summaryZh}</p>
            {item.warning && <small className="section-warning">提示：{item.warning}</small>}
            <a href={item.originalUrl} target="_blank" rel="noreferrer">阅读原文 <ArrowRight size={16} /></a>
          </article>
        ))}
      </section>
    </main>
  );
}
