import Link from "next/link";
import SiteNav from "./SiteNav";

const content = {
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
