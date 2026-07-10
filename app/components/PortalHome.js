"use client";

import Link from "next/link";
import { ArrowRight, GlobeHemisphereWest } from "@phosphor-icons/react";
import SiteNav from "./SiteNav";

const sections = [
  { href: "/ai", label: "AI 前线", description: "头部 AI 公司、产品与模型动态", accent: "#e5532d", live: true },
  { href: "/world", label: "世界见闻", description: "国际组织、外交与全球热点", accent: "#315b8e", live: true },
  { href: "/china", label: "社会时事", description: "民生、教育、医疗与公共事件", accent: "#d85a35", live: true },
  { href: "/party", label: "党建", description: "政策文件、会议与理论学习", accent: "#bd2735", live: true },
  { href: "/horror", label: "恐怖怪谈", description: "故事、传闻与社区热帖，含内容标注", accent: "#5d466c", live: true },
  { href: "/science", label: "科普探索", description: "天文、生命、地球与论文速读", accent: "#177c71", live: true },
  { href: "/english", label: "英语口语", description: "TED、表达训练与实用听说素材", accent: "#2874a8", live: true },
];

export default function PortalHome() {
  return (
    <main className="portal-shell">
      <SiteNav current="/" />
      <section className="portal-hero">
        <div>
          <p className="portal-kicker"><GlobeHemisphereWest size={16} /> 综合资讯门户</p>
          <h1>看清正在发生的事。</h1>
          <p>七个并列分区，覆盖科技、世界、社会、学习与社区内容。</p>
          <a className="portal-primary-link" href="#sections">浏览全部分区 <ArrowRight size={17} weight="bold" /></a>
        </div>
        <div className="portal-hero-visual" aria-hidden="true">
          <img src="/ai-news-icon.svg" alt="" />
        </div>
      </section>

      <section className="portal-sections portal-sections-home" id="sections" aria-labelledby="sections-heading">
        <div className="portal-section-heading portal-section-intro">
          <div><h2 id="sections-heading">全部分区</h2><p>每个分区使用独立资讯源与专属筛选方式。</p></div>
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
