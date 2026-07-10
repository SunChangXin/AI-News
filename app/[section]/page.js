import { notFound } from "next/navigation";
import SectionPlaceholder from "../components/SectionPlaceholder";
import SectionNewsroom from "../components/SectionNewsroom";

const sections = new Set(["world", "china", "party", "horror", "science", "english"]);

export function generateStaticParams() {
  return [...sections].map((section) => ({ section }));
}

export default async function SectionPage({ params }) {
  const { section } = await params;
  if (!sections.has(section)) notFound();
  if (["world", "china", "party", "horror", "science", "english"].includes(section)) return <SectionNewsroom section={section} />;
  return <SectionPlaceholder section={section} />;
}
