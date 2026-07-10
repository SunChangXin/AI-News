import "./globals.css";

export const metadata = {
  title: "资讯前线 | 全球资讯与 AI 动态",
  description: "聚合 AI、世界、社会、科普与英语学习资讯，直达可靠原始来源。",
  icons: {
    icon: "/news-portal-icon.png",
    shortcut: "/news-portal-icon.png",
    apple: "/news-portal-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
