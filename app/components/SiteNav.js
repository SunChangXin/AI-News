import Link from "next/link";

const links = [
  { href: "/ai", label: "AI 前线" },
  { href: "/world", label: "世界见闻" },
  { href: "/china", label: "社会时事" },
  { href: "/party", label: "党建" },
  { href: "/horror", label: "恐怖怪谈" },
  { href: "/science", label: "科普探索" },
  { href: "/english", label: "英语" },
];

export default function SiteNav({ current = "" }) {
  return (
    <header className="portal-header">
      <Link className="portal-brand" href="/" aria-label="资讯前线首页">
        <span className="portal-brand-mark"><img src="/news-portal-icon.png" alt="" /></span>
        <span>资讯前线</span>
      </Link>
      <nav className="portal-nav" aria-label="资讯分区">
        {links.map((link) => (
          <Link className={current === link.href ? "active" : ""} href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="portal-menu" aria-hidden="true">菜单</span>
    </header>
  );
}
