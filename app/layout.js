import "./globals.css";

export const metadata = {
  title: "AI 前线 | 全球 AI 公司动态",
  description: "自动聚合 OpenAI、Anthropic、智谱等头部 AI 公司的最新官方动态与媒体报道。",
  icons: {
    icon: "/ai-news-icon.svg",
    shortcut: "/ai-news-icon.svg",
    apple: "/ai-news-icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
