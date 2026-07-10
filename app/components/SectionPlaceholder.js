import Link from "next/link";
import SiteNav from "./SiteNav";

const content = {
  china: ["社会时事", "正在建立面向民生、教育、医疗与公共事件的资讯来源。"],
  party: ["党建", "正在整理政策文件、会议与理论学习的可靠公开来源。"],
  horror: ["恐怖怪谈", "该栏目会在上线前完成内容分级、真实性标注与不适内容提示。"],
};

export default function SectionPlaceholder({ section }) {
  const [title, description] = content[section] || ["栏目", "该栏目正在准备中。"];
  return (
    <main className="portal-shell">
      <SiteNav current={`/${section}`} />
      <section className="section-placeholder">
        <p className="portal-kicker">栏目筹备中</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link href="/">返回资讯前线首页</Link>
      </section>
    </main>
  );
}
